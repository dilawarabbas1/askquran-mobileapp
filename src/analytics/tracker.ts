// Fire-and-forget event tracker for xNotify's `/v2/save` ingest. Pure and fully
// injectable (fetch, storage, id generator, clock, sleep) so it unit-tests with
// no network or native modules. Design rules:
//   • track() NEVER throws and NEVER blocks the UI — failures are swallowed.
//   • A bounded queue drains serially; on persistent failure the event is dropped
//     (analytics is best-effort, never a source of crashes or backpressure).
//   • Anonymous: a stable per-install `distinct_id` (no phone / PII) identifies the
//     device. It is generated once and persisted via the injected storage.
//   • When disabled (no Event Key) every call is a no-op.
//
// Wire contract (verified against the Event service source):
//   POST <saveUrl>  headers: { x-event-key, Content-Type: application/json }
//   body: { event_name, properties, distinct_id, source }
//   server requires event_name:string + properties:object; contact_no optional.

export interface TrackerResponse {
  ok: boolean;
  status: number;
}

export type TrackerFetch = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<TrackerResponse>;

export interface TrackerStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export interface TrackerDeps {
  fetch: TrackerFetch;
  /** Full ingest endpoint, e.g. https://event.xnotify.ai/v2/save */
  saveUrl: string;
  /** The product Event Key sent as the x-event-key header. */
  eventKey: string;
  storage: TrackerStorage;
  /** Returns a fresh unique id (used for distinct_id when none is stored). */
  genId: () => string;
  /** Tags every event's `source` (default "mobile"). */
  source?: string;
  /** Override the on/off decision (default: eventKey is non-empty). */
  enabled?: boolean;
  /** Merged into every event's properties (e.g. platform, app_version). */
  baseProperties?: () => Record<string, unknown>;
  /** Injectable for tests; default real setTimeout. */
  sleep?: (ms: number) => Promise<void>;
  /** Max queued events before the oldest are dropped (default 50). */
  maxQueue?: number;
  /** Retries per event on network/5xx failure (default 1). */
  maxRetries?: number;
  /** Storage key for the persisted anonymous id (default below). */
  distinctIdKey?: string;
  /** Observe swallowed errors (tests / optional debug logging). */
  onError?: (e: unknown) => void;
}

export interface Tracker {
  /** Enqueue an event. Never throws, never blocks. */
  track(eventName: string, properties?: Record<string, unknown>): void;
  /** Resolve (and cache) the anonymous per-install id. */
  distinctId(): Promise<string>;
  /** Resolves once the current queue has fully drained (tests/shutdown). */
  flush(): Promise<void>;
  /** Whether tracking is active. */
  readonly enabled: boolean;
}

const DEFAULT_DID_KEY = "aq:analytics:distinct_id";
const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

interface QueuedEvent {
  event_name: string;
  properties: Record<string, unknown>;
}

export function createTracker(deps: TrackerDeps): Tracker {
  const source = deps.source ?? "mobile";
  const enabled = deps.enabled ?? deps.eventKey.trim().length > 0;
  const sleep = deps.sleep ?? defaultSleep;
  const maxQueue = deps.maxQueue ?? 50;
  const maxRetries = deps.maxRetries ?? 1;
  const didKey = deps.distinctIdKey ?? DEFAULT_DID_KEY;

  const queue: QueuedEvent[] = [];
  let draining = false;
  let drainTail: Promise<void> = Promise.resolve();
  let didPromise: Promise<string> | null = null;

  async function resolveDistinctId(): Promise<string> {
    if (!didPromise) {
      didPromise = (async () => {
        try {
          const existing = await deps.storage.getItem(didKey);
          if (existing && existing.length > 0) return existing;
        } catch (e) {
          deps.onError?.(e);
        }
        const fresh = deps.genId();
        try {
          await deps.storage.setItem(didKey, fresh);
        } catch (e) {
          deps.onError?.(e); // still return the id even if persistence failed
        }
        return fresh;
      })();
    }
    return didPromise;
  }

  async function send(ev: QueuedEvent, distinct_id: string): Promise<boolean> {
    const body = JSON.stringify({
      event_name: ev.event_name,
      source,
      distinct_id,
      properties: ev.properties,
    });
    let attempt = 0;
    // attempt 0 + up to maxRetries retries
    // retry only on transport failure or 5xx; 4xx is a permanent drop.
    while (true) {
      try {
        const res = await deps.fetch(deps.saveUrl, {
          method: "POST",
          headers: {
            "x-event-key": deps.eventKey,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body,
        });
        if (res.ok) return true;
        if (res.status >= 500 && attempt < maxRetries) {
          attempt++;
          await sleep(500 * 2 ** (attempt - 1));
          continue;
        }
        return false; // 4xx (bad key / payload) — drop, no retry storm
      } catch (e) {
        deps.onError?.(e);
        if (attempt < maxRetries) {
          attempt++;
          await sleep(500 * 2 ** (attempt - 1));
          continue;
        }
        return false;
      }
    }
  }

  function drain(): void {
    if (draining) return;
    draining = true;
    drainTail = (async () => {
      try {
        const distinct_id = await resolveDistinctId();
        while (queue.length > 0) {
          const ev = queue.shift() as QueuedEvent;
          await send(ev, distinct_id);
        }
      } catch (e) {
        deps.onError?.(e);
      } finally {
        draining = false;
      }
    })();
  }

  return {
    enabled,
    track(eventName, properties) {
      if (!enabled) return;
      const name = typeof eventName === "string" ? eventName.trim() : "";
      if (!name) return; // server requires a non-empty event_name
      const base = (() => {
        try {
          return deps.baseProperties?.() ?? {};
        } catch (e) {
          deps.onError?.(e);
          return {};
        }
      })();
      const props: Record<string, unknown> = { ...base, ...(properties ?? {}) };
      queue.push({ event_name: name, properties: props });
      // drop oldest if the queue overflows (best-effort, bounded memory)
      while (queue.length > maxQueue) queue.shift();
      drain();
    },
    distinctId: resolveDistinctId,
    async flush() {
      // Wait for the in-flight drain, then for any drain it kicked off, until idle.
      // Bounded loop guards against pathological churn.
      for (let i = 0; i < 1000; i++) {
        await drainTail;
        if (queue.length === 0 && !draining) return;
        drain();
      }
    },
  };
}

/** RFC-4122-ish v4 id from Math.random — fine for an anonymous analytics id. */
export function uuidv4(rand: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      out += "-";
    } else if (i === 14) {
      out += "4";
    } else {
      const r = Math.floor(rand() * 16);
      out += (i === 19 ? (r & 0x3) | 0x8 : r).toString(16);
    }
  }
  return out;
}
