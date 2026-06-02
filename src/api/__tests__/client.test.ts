// Unit tests for the AskQuran API client. Pure: a fake `fetch` is injected, so
// no network or native modules are touched. Run with `npm test`.

import assert from "node:assert/strict";
import { test } from "node:test";

import { createAqClient } from "../client";
import { AqError, mapStatusToError } from "../errors";
import type { FetchLike, FetchResponse } from "../request";

/* ---- fake fetch helper ---- */
interface FakeRes {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
}
type Handler = (url: string, call: number) => FakeRes;

interface Recorded {
  url: string;
  headers: Record<string, string>;
}

function makeFetch(handler: Handler): { fetch: FetchLike; calls: Recorded[] } {
  const calls: Recorded[] = [];
  const fetch: FetchLike = async (url, init) => {
    calls.push({ url, headers: init.headers });
    const { status = 200, body = {}, headers = {} } = handler(url, calls.length - 1);
    const res: FetchResponse = {
      ok: status >= 200 && status < 300,
      status,
      headers: { get: (n) => headers[n] ?? headers[n.toLowerCase()] ?? null },
      json: async () => body,
    };
    return res;
  };
  return { fetch, calls };
}

const KEY = "aq_live_TESTKEY";
const BASE = "https://api.askquran.co/api/v1";
const noSleep = async () => {};

function client(handler: Handler, calls?: Recorded[]) {
  const f = makeFetch(handler);
  if (calls) calls.push(...[]); // keep ref convenience
  return { c: createAqClient({ fetch: f.fetch, baseUrl: BASE, apiKey: KEY, sleep: noSleep }), calls: f.calls };
}

/* ---- 1. header injection ---- */
test("injects x-api-key header on every request", async () => {
  const { c, calls } = client(() => ({ body: { surahs: [], source: "Tanzil" } }));
  await c.getSurahs();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].headers["x-api-key"], KEY);
  assert.equal(calls[0].url, `${BASE}/quran/surahs`);
});

/* ---- 2. error mapping ---- */
test("maps HTTP status codes to typed AqError kinds", () => {
  assert.equal(mapStatusToError(400, "bad").kind, "validation");
  assert.equal(mapStatusToError(401, "").kind, "auth");
  assert.equal(mapStatusToError(403, "").kind, "forbidden");
  assert.equal(mapStatusToError(404, "").kind, "notFound");
  assert.equal(mapStatusToError(429, "").kind, "rateLimit");
  assert.equal(mapStatusToError(500, "").kind, "server");
  assert.equal(mapStatusToError(503, "").kind, "server");
  // config errors are flagged and non-retryable
  assert.equal(mapStatusToError(401, "").isConfigError, true);
  assert.equal(mapStatusToError(403, "").isConfigError, true);
  assert.equal(mapStatusToError(404, "").retryable, false);
});

test("a 404 surfaces as a notFound AqError (graceful empty state)", async () => {
  const { c } = client(() => ({ status: 404, body: { error: "Not found." } }));
  await assert.rejects(() => c.getAudio("2:255"), (e: unknown) => e instanceof AqError && e.kind === "notFound");
});

test("a 401 surfaces as a config (auth) error rather than crashing", async () => {
  const { c } = client(() => ({ status: 401, body: { error: "Missing or invalid API key." } }));
  await assert.rejects(() => c.getSurahs(), (e: unknown) => e instanceof AqError && e.isConfigError);
});

/* ---- 3. optional translation param on /quran/surah ---- */
test("omits ?translation when no edition is requested, includes it when given", async () => {
  const { c, calls } = client((url) =>
    url.includes("translation=")
      ? { body: { surah: 1, translationId: "en.sahih", translationName: "Sahih", verses: [], source: "s" } }
      : { body: { surah: 1, verses: [], source: "s" } },
  );
  await c.getSurah(1);
  await c.getSurah(1, "en.sahih");
  assert.equal(calls[0].url, `${BASE}/quran/surah/1`);
  assert.equal(calls[1].url, `${BASE}/quran/surah/1?translation=en.sahih`);
});

/* ---- 4. available=false tafsir ---- */
test("tafsir with available=false resolves gracefully with empty text (never fabricated)", async () => {
  const { c } = client(() => ({
    body: {
      verseKey: "1:1",
      editionId: "ibn_kathir_en",
      edition: { name: "Ibn Kathir", language: "en", source: "x", publisher: "y", complete: false },
      available: false,
      tafsir: "",
      source: "Ibn Kathir",
    },
  }));
  const r = await c.getTafsir("ibn_kathir_en", "1:1");
  assert.equal(r.available, false);
  assert.equal(r.tafsir, "");
  assert.equal(r.source, "Ibn Kathir");
});

/* ---- 5. 429 backoff + retry ---- */
test("retries after a 429 then succeeds, and captures rate-limit headers", async () => {
  let seen: { limit: number | null; remaining: number | null } | null = null;
  const f = makeFetch((_url, call): FakeRes =>
    call === 0
      ? { status: 429, body: { error: "Rate limited." }, headers: { "Retry-After": "1", "X-RateLimit-Limit": "60", "X-RateLimit-Remaining": "0" } }
      : { body: { surahs: [{ surah: 1, name_en: "Al-Fatihah", name_ar: "الفاتحة" }], source: "Tanzil" }, headers: { "X-RateLimit-Limit": "60", "X-RateLimit-Remaining": "59" } },
  );
  const c = createAqClient({ fetch: f.fetch, baseUrl: BASE, apiKey: KEY, sleep: noSleep, onRateLimit: (i) => (seen = i) });
  const r = await c.getSurahs();
  assert.equal(f.calls.length, 2, "should retry once after 429");
  assert.equal(r.surahs[0].name_en, "Al-Fatihah");
  assert.deepEqual(c.getRateLimit(), { limit: 60, remaining: 59 });
  assert.ok(seen, "onRateLimit fired");
});

/* ---- 6. pre-flight verse-key validation (no network) ---- */
test("invalid verse key throws validation locally without calling fetch", async () => {
  const { c, calls } = client(() => ({ body: {} }));
  await assert.rejects(() => c.getAyah("999:1"), (e: unknown) => e instanceof AqError && e.kind === "validation");
  await assert.rejects(() => c.getAyah("nonsense"), (e: unknown) => e instanceof AqError && e.kind === "validation");
  assert.equal(calls.length, 0, "no network call for invalid keys");
});

/* ---- 7. caching: static list fetched once, per-ayah memoised ---- */
test("caches the static surah list and memoises per-ayah reads", async () => {
  const { c, calls } = client(() => ({ body: { surahs: [], source: "s", verseKey: "1:1", surah: 1, ayah: 1, arabic: "بِسْمِ" } }));
  await c.getSurahs();
  await c.getSurahs(); // served from cache
  assert.equal(calls.filter((x) => x.url.endsWith("/quran/surahs")).length, 1, "surahs fetched once");
  await c.getAyah("1:1");
  await c.getAyah("1:1"); // served from LRU
  assert.equal(calls.filter((x) => x.url.endsWith("/quran/ayah/1:1")).length, 1, "ayah fetched once");
});
