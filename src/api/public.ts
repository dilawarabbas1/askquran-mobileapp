// Public AskQuran backend client (no API key) — the same endpoints the web app
// uses. Search posts to /api/ask; suggested questions, translations and verses
// are plain GETs. All text is returned verbatim by the backend; nothing here is
// generated.

import { AqError, mapStatusToError } from "./errors";
import { PUBLIC_API_BASE_URL } from "./config";
import type { AskResponse, AyahResult, SuggestedGroup, TranslationMeta } from "./publicTypes";

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    throw new AqError("network", (e as Error)?.message || "Network request failed.");
  }
  if (!res.ok) {
    let message = "";
    try {
      const body = (await res.json()) as { error?: string };
      message = typeof body?.error === "string" ? body.error : "";
    } catch {
      /* non-JSON error body */
    }
    throw mapStatusToError(res.status, message);
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new AqError("parse", "Could not parse server response.");
  }
}

export interface AskOptions {
  /** Translation edition id (optional; backend defaults by language). */
  translation?: string;
  /** UI language name, e.g. "English" / "Urdu" — backend picks a matching edition. */
  language?: string;
  /** Tafsir edition id (optional). */
  tafsir?: string;
}

/**
 * POST /api/ask — the deterministic, source-grounded search. Returns the full
 * response: matched ayahs (Arabic, translation, tafsir, context), terms, and a
 * `message` when nothing matched.
 */
export async function ask(question: string, opts: AskOptions = {}): Promise<AskResponse> {
  return getJson<AskResponse>(`${PUBLIC_API_BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      question,
      ...(opts.translation ? { translation: opts.translation } : {}),
      ...(opts.language ? { language: opts.language } : {}),
      ...(opts.tafsir ? { tafsir: opts.tafsir } : {}),
    }),
  });
}

// Translation editions (static-ish); cached in memory.
let translationsCache: { default: string; translations: TranslationMeta[] } | null = null;

/** GET /api/translations — available editions + the default id. */
export async function getTranslations(): Promise<{ default: string; translations: TranslationMeta[] }> {
  if (translationsCache) return translationsCache;
  const data = await getJson<{ default: string; translations: TranslationMeta[] }>(
    `${PUBLIC_API_BASE_URL}/translations`,
    { headers: { Accept: "application/json" } },
  );
  translationsCache = { default: data.default, translations: data.translations ?? [] };
  return translationsCache;
}

/** Resolve a translation edition id for a UI language name ("English"/"Urdu"…). */
export async function translationIdForLanguage(language: string): Promise<string | undefined> {
  try {
    const { default: def, translations } = await getTranslations();
    const want = language.toLowerCase();
    const match = translations.find((t) => t.language?.toLowerCase().includes(want));
    return match?.id ?? def;
  } catch {
    return undefined;
  }
}

/**
 * GET /api/verses?refs=…&translation=…[&tafsir=…] — verbatim Arabic + chosen
 * translation for single keys or single-surah ranges (e.g. "2:1-2:286"), in
 * Quran order. Pass `tafsir` ("1" = default Ibn Kathir, or an edition id) to
 * include stored tafsir per ayah — used by the reference pages' "Show tafsir".
 */
export async function getVerses(refs: string[], translationId: string, tafsir?: string): Promise<AyahResult[]> {
  const qs = new URLSearchParams({ refs: refs.join(","), translation: translationId });
  if (tafsir) qs.set("tafsir", tafsir);
  const data = await getJson<{ verses: AyahResult[] }>(`${PUBLIC_API_BASE_URL}/verses?${qs.toString()}`, {
    headers: { Accept: "application/json" },
  });
  return data.verses ?? [];
}

// Suggested questions are static-ish; cache the first successful fetch in memory.
let questionsCache: SuggestedGroup[] | null = null;

/** GET /api/suggested-questions — saved template questions grouped by topic. */
export async function getSuggestedQuestions(): Promise<SuggestedGroup[]> {
  if (questionsCache) return questionsCache;
  const data = await getJson<{ groups: SuggestedGroup[] }>(`${PUBLIC_API_BASE_URL}/suggested-questions`, {
    headers: { Accept: "application/json" },
  });
  questionsCache = data.groups ?? [];
  return questionsCache;
}
