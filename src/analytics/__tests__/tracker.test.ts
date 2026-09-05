// Unit tests for the xNotify event tracker. Pure: fake fetch + fake storage are
// injected, so no network or native modules are touched. Run with `npm test`.

import assert from "node:assert/strict";
import { test } from "node:test";

import { createTracker, uuidv4, type TrackerFetch, type TrackerStorage } from "../tracker";

interface Recorded {
  url: string;
  headers: Record<string, string>;
  body: unknown;
}

function makeFetch(
  responder: (call: number) => { ok?: boolean; status?: number } = () => ({}),
): { fetch: TrackerFetch; calls: Recorded[] } {
  const calls: Recorded[] = [];
  const fetch: TrackerFetch = async (url, init) => {
    calls.push({ url, headers: init.headers, body: JSON.parse(init.body) });
    const { ok = true, status = 202 } = responder(calls.length - 1);
    return { ok, status };
  };
  return { fetch, calls };
}

function makeFetchThrows(throwsTimes: number): { fetch: TrackerFetch; attempts: () => number } {
  let n = 0;
  const fetch: TrackerFetch = async () => {
    n++;
    if (n <= throwsTimes) throw new Error("network down");
    return { ok: true, status: 202 };
  };
  return { fetch, attempts: () => n };
}

function makeStorage(initial: Record<string, string> = {}): TrackerStorage & { store: Record<string, string> } {
  const store: Record<string, string> = { ...initial };
  return {
    store,
    async getItem(k) {
      return k in store ? store[k] : null;
    },
    async setItem(k, v) {
      store[k] = v;
    },
  };
}

const KEY = "evt_TESTKEY";
const URL = "https://api.xnotify.ai/v2/save";
const noSleep = async () => {};

function tracker(opts: Partial<Parameters<typeof createTracker>[0]> = {}) {
  const f = opts.fetch ? { fetch: opts.fetch, calls: [] as Recorded[] } : makeFetch();
  const storage = (opts.storage as TrackerStorage) ?? makeStorage();
  const t = createTracker({
    fetch: f.fetch,
    saveUrl: URL,
    eventKey: KEY,
    storage,
    genId: () => "fixed-id-1234",
    sleep: noSleep,
    ...opts,
  });
  return { t, calls: (f as { calls: Recorded[] }).calls, storage };
}

/* 1 — header + body shape */
test("POSTs to /v2/save with x-event-key header and correct body", async () => {
  const { t, calls } = tracker();
  t.track("search", { query: "mercy" });
  await t.flush();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, URL);
  assert.equal(calls[0].headers["x-event-key"], KEY);
  assert.equal(calls[0].headers["Content-Type"], "application/json");
  const b = calls[0].body as Record<string, unknown>;
  assert.equal(b.event_name, "search");
  assert.equal(b.source, "mobile");
  assert.equal(b.distinct_id, "fixed-id-1234");
  assert.deepEqual(b.properties, { query: "mercy" });
});

/* 2 — anonymous distinct_id generated once + persisted + reused */
test("generates a stable distinct_id, persists it, and reuses it", async () => {
  const storage = makeStorage();
  const { t, calls } = tracker({ storage });
  t.track("a");
  t.track("b");
  await t.flush();
  assert.equal(storage.store["aq:analytics:distinct_id"], "fixed-id-1234");
  assert.equal((calls[0].body as Record<string, unknown>).distinct_id, "fixed-id-1234");
  assert.equal((calls[1].body as Record<string, unknown>).distinct_id, "fixed-id-1234");
});

/* 3 — a previously stored id is reused, not regenerated */
test("reuses an existing stored distinct_id", async () => {
  const storage = makeStorage({ "aq:analytics:distinct_id": "stored-99" });
  const { t, calls } = tracker({ storage, genId: () => "should-not-be-used" });
  t.track("x");
  await t.flush();
  assert.equal((calls[0].body as Record<string, unknown>).distinct_id, "stored-99");
});

/* 4 — disabled (no key) is a no-op */
test("no-op when no event key is configured", async () => {
  const f = makeFetch();
  const t = createTracker({
    fetch: f.fetch,
    saveUrl: URL,
    eventKey: "",
    storage: makeStorage(),
    genId: () => "id",
    sleep: noSleep,
  });
  assert.equal(t.enabled, false);
  t.track("search");
  await t.flush();
  assert.equal(f.calls.length, 0);
});

/* 5 — never throws on persistent network failure; event dropped */
test("swallows network failures and never throws", async () => {
  const f = makeFetchThrows(99);
  let observed = 0;
  const t = createTracker({
    fetch: f.fetch,
    saveUrl: URL,
    eventKey: KEY,
    storage: makeStorage(),
    genId: () => "id",
    sleep: noSleep,
    maxRetries: 1,
    onError: () => observed++,
  });
  assert.doesNotThrow(() => t.track("boom"));
  await t.flush();
  assert.equal(f.attempts(), 2); // initial + 1 retry
  assert.ok(observed >= 1);
});

/* 6 — baseProperties merged; explicit props win */
test("merges baseProperties, explicit properties override", async () => {
  const { t, calls } = tracker({
    baseProperties: () => ({ platform: "android", app_version: "1.0.8" }),
  });
  t.track("screen_view", { screen: "library", platform: "override" });
  await t.flush();
  assert.deepEqual((calls[0].body as Record<string, unknown>).properties, {
    platform: "override",
    app_version: "1.0.8",
    screen: "library",
  });
});

/* 7 — empty / whitespace event_name is ignored */
test("ignores empty event names", async () => {
  const { t, calls } = tracker();
  t.track("");
  t.track("   ");
  await t.flush();
  assert.equal(calls.length, 0);
});

/* 8 — retries a 5xx then succeeds */
test("retries on 5xx then succeeds", async () => {
  const f = makeFetch((call) => (call === 0 ? { ok: false, status: 503 } : { ok: true, status: 202 }));
  const { t } = tracker({ fetch: f.fetch });
  t.track("once");
  await t.flush();
  assert.equal(f.calls.length, 2);
});

/* 9 — 4xx is a permanent drop (no retry storm) */
test("does not retry a 4xx", async () => {
  const f = makeFetch(() => ({ ok: false, status: 403 }));
  const { t } = tracker({ fetch: f.fetch });
  t.track("badkey");
  await t.flush();
  assert.equal(f.calls.length, 1);
});

/* 10 — uuidv4 shape */
test("uuidv4 produces a v4-shaped id", () => {
  const id = uuidv4(() => 0.5);
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});
