// Unit tests for the PUBLIC AskQuran client (src/api/public.ts) — the layer the
// app uses for search, suggested questions, translations, verses and the
// reference-page passages/tafsir. A fake global `fetch` is injected, so no
// network is touched. Run with `npm test`.

import assert from "node:assert/strict";
import { test } from "node:test";

import { ask, getVerses, getTranslations, getSuggestedQuestions } from "../public";
import { AqError } from "../errors";

const HOST = "https://api.askquran.co/api"; // PUBLIC_API_BASE_URL (default base)

interface Recorded {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}
interface FakeRes {
  status?: number;
  body?: unknown;
}

/** Replace global.fetch with a recording stub; returns the captured calls. */
function installFetch(handler: (url: string, call: number) => FakeRes): Recorded[] {
  const calls: Recorded[] = [];
  (globalThis as { fetch: unknown }).fetch = async (url: string, init?: Record<string, unknown>) => {
    const headers = (init?.headers ?? {}) as Record<string, string>;
    calls.push({ url, method: (init?.method as string) ?? "GET", headers, body: init?.body as string | undefined });
    const { status = 200, body = {} } = handler(url, calls.length - 1);
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    };
  };
  return calls;
}

/* ---- ask(): POST /api/ask with the right body ---- */
test("ask() posts to /api/ask with question + options and returns the response", async () => {
  const payload = { question: "patience", translationId: "en.sahih", count: 1, results: [], terms: ["patience"] };
  const calls = installFetch(() => ({ body: payload }));
  const res = await ask("patience", { language: "English", translation: "en.sahih", tafsir: "en.ibnkathir" });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${HOST}/ask`);
  assert.equal(calls[0].method, "POST");
  assert.equal(calls[0].headers["Content-Type"], "application/json");
  const sent = JSON.parse(calls[0].body!);
  assert.equal(sent.question, "patience");
  assert.equal(sent.language, "English");
  assert.equal(sent.translation, "en.sahih");
  assert.equal(sent.tafsir, "en.ibnkathir");
  assert.deepEqual(res.terms, ["patience"]);
});

test("ask() omits optional fields when not provided", async () => {
  const calls = installFetch(() => ({ body: { question: "x", translationId: "en.sahih", count: 0, results: [], terms: [] } }));
  await ask("x");
  const sent = JSON.parse(calls[0].body!);
  assert.equal(sent.question, "x");
  assert.equal("translation" in sent, false);
  assert.equal("language" in sent, false);
  assert.equal("tafsir" in sent, false);
});

/* ---- getVerses(): GET /api/verses, optional tafsir ---- */
test("getVerses() builds refs+translation query and returns verses[]", async () => {
  const verses = [{ verseKey: "2:255", arabic: "…", translation: "Allah…" }];
  const calls = installFetch(() => ({ body: { verses } }));
  const out = await getVerses(["2:255", "2:30-39"], "en.sahih");

  assert.equal(calls.length, 1);
  const url = decodeURIComponent(calls[0].url);
  assert.ok(url.startsWith(`${HOST}/verses?`));
  assert.ok(url.includes("refs=2:255,2:30-39"), `refs joined: ${url}`);
  assert.ok(url.includes("translation=en.sahih"));
  assert.ok(!url.includes("tafsir="), "no tafsir param when omitted");
  assert.equal(out.length, 1);
  assert.equal(out[0].verseKey, "2:255");
});

test("getVerses() adds the tafsir param when requested (reference-page 'Show tafsir')", async () => {
  const calls = installFetch(() => ({ body: { verses: [] } }));
  await getVerses(["24:35"], "en.sahih", "1");
  const url = decodeURIComponent(calls[0].url);
  assert.ok(url.includes("tafsir=1"), `tafsir param present: ${url}`);
});

/* ---- error mapping ---- */
test("getVerses() maps a non-OK status to a typed AqError", async () => {
  installFetch(() => ({ status: 429, body: { error: "Rate limited." } }));
  await assert.rejects(
    () => getVerses(["2:255"], "en.sahih"),
    (e: unknown) => e instanceof AqError && e.kind === "rateLimit" && e.retryable,
  );
});

test("ask() surfaces a network failure as AqError(network)", async () => {
  (globalThis as { fetch: unknown }).fetch = async () => { throw new Error("offline"); };
  await assert.rejects(
    () => ask("q"),
    (e: unknown) => e instanceof AqError && e.kind === "network",
  );
});

/* ---- in-memory caching of the static-ish lists ---- */
test("getTranslations() caches after the first successful fetch", async () => {
  const calls = installFetch(() => ({ body: { default: "en.sahih", translations: [{ id: "en.sahih", name: "Sahih", language: "English" }] } }));
  const a = await getTranslations();
  const b = await getTranslations();
  assert.equal(calls.length, 1, "second call served from cache");
  assert.equal(a.default, "en.sahih");
  assert.equal(b, a, "same cached object");
});

test("getSuggestedQuestions() caches after the first successful fetch", async () => {
  const calls = installFetch(() => ({ body: { groups: [{ id: "g1", title: "Faith", questions: [] }] } }));
  const a = await getSuggestedQuestions();
  await getSuggestedQuestions();
  assert.equal(calls.length, 1, "second call served from cache");
  assert.equal(a[0].id, "g1");
});
