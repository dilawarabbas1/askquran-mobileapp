// Centralized request layer. One place injects the `x-api-key` header, parses
// the `{ error }` envelope, maps status codes to typed AqErrors, captures the
// rate-limit headers, retries 429 (exponential backoff) and 5xx (once), and
// coalesces concurrent identical GETs so caching stays well under 60 req/min.

import { AqError, mapStatusToError } from "./errors";
import type { RateLimitInfo } from "./types";

/** Minimal shape of the fetch we depend on (so tests can inject a fake). */
export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string> },
) => Promise<FetchResponse>;

export interface FetchResponse {
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
  json(): Promise<unknown>;
}

export interface RequesterDeps {
  fetch: FetchLike;
  baseUrl: string;
  apiKey: string;
  /** Injectable so tests don't actually wait. Defaults to real setTimeout. */
  sleep?: (ms: number) => Promise<void>;
  /** Called whenever rate-limit headers are seen. */
  onRateLimit?: (info: RateLimitInfo) => void;
  /** Max retries on HTTP 429 (default 4). */
  maxRetries429?: number;
  /** Base backoff for 429 in ms (default 1000 → 1s, 2s, 4s, 8s). */
  baseBackoffMs?: number;
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function num(v: string | null): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export interface Requester {
  /** GET `path` (relative to baseUrl) and parse JSON into T. */
  get<T>(path: string): Promise<T>;
  lastRateLimit(): RateLimitInfo | null;
}

export function createRequester(deps: RequesterDeps): Requester {
  const sleep = deps.sleep ?? defaultSleep;
  const maxRetries429 = deps.maxRetries429 ?? 4;
  const baseBackoff = deps.baseBackoffMs ?? 1000;
  const inflight = new Map<string, Promise<unknown>>();
  let rateLimit: RateLimitInfo | null = null;

  async function parseErrorMessage(res: FetchResponse): Promise<string> {
    try {
      const body = (await res.json()) as { error?: string };
      return typeof body?.error === "string" ? body.error : "";
    } catch {
      return "";
    }
  }

  function captureRateLimit(res: FetchResponse): void {
    const info: RateLimitInfo = {
      limit: num(res.headers.get("X-RateLimit-Limit")),
      remaining: num(res.headers.get("X-RateLimit-Remaining")),
    };
    if (info.limit !== null || info.remaining !== null) {
      rateLimit = info;
      deps.onRateLimit?.(info);
    }
  }

  function backoffMs(res: FetchResponse, attempt: number): number {
    const retryAfter = num(res.headers.get("Retry-After"));
    if (retryAfter !== null) return retryAfter * 1000;
    const base = baseBackoff * 2 ** attempt; // 1s, 2s, 4s, 8s
    return base + Math.floor(Math.random() * 250); // small jitter
  }

  async function attempt<T>(path: string): Promise<T> {
    const url = deps.baseUrl.replace(/\/$/, "") + path;
    // X-App-Source tags every request as mobile so the backend attributes it to
    // the mobile surface (not "api") in analytics — same as the public client.
    const headers = { "x-api-key": deps.apiKey, Accept: "application/json", "X-App-Source": "mobile" };

    let retried429 = 0;
    let retried5xx = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let res: FetchResponse;
      try {
        res = await deps.fetch(url, { method: "GET", headers });
      } catch (e) {
        // transport failure — retry once like a 5xx, then surface
        if (retried5xx < 1) {
          retried5xx++;
          await sleep(baseBackoff);
          continue;
        }
        throw new AqError("network", (e as Error)?.message || "Network request failed.");
      }

      captureRateLimit(res);

      if (res.ok) {
        try {
          return (await res.json()) as T;
        } catch {
          throw new AqError("parse", "Could not parse server response.");
        }
      }

      const message = await parseErrorMessage(res);

      if (res.status === 429 && retried429 < maxRetries429) {
        await sleep(backoffMs(res, retried429));
        retried429++;
        continue;
      }
      if (res.status >= 500 && retried5xx < 1) {
        retried5xx++;
        await sleep(backoffMs(res, 0));
        continue;
      }
      throw mapStatusToError(res.status, message);
    }
  }

  return {
    get<T>(path: string): Promise<T> {
      // Coalesce concurrent identical GETs into one in-flight request.
      const existing = inflight.get(path);
      if (existing) return existing as Promise<T>;
      const p = attempt<T>(path).finally(() => inflight.delete(path));
      inflight.set(path, p);
      return p;
    },
    lastRateLimit: () => rateLimit,
  };
}
