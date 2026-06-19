// Public AskQuran backend client — the same endpoints the web app uses. Search
// posts to /api/ask; suggested questions, translations and verses are GETs. All
// text is returned verbatim by the backend; nothing here is generated.
//
// The public /api/* layer is authenticated by default (PUBLIC_API_REQUIRE_KEY).
// Exactly like the web bundle (which ships VITE_API_KEY), we send `x-api-key` on
// every request when a key is configured (EXPO_PUBLIC_API_KEY). A portal-issued
// key works on both /api/* and /api/v1; the first-party Website key works on
// /api/*. With no key set, loopback dev still works.

import { AqError, mapStatusToError } from "./errors";
import { PUBLIC_API_BASE_URL, API_KEY } from "./config";
import { TtlCache, createMemoryStorage, type Storage } from "./cache";
import type { AskResponse, AyahResult, SuggestedGroup, TranslationMeta, TafsirMeta } from "./publicTypes";

/**
 * Headers for public /api calls — adds x-api-key when a key is configured and
 * always tags the request surface with `X-App-Source: mobile`. The backend's
 * /api/ask route reads this header (web → "web", mobile → "mobile", anything
 * else → "api") to attribute search logs to the right client. Mirrors the web
 * frontend's apiHeaders(), which sends "X-App-Source": "web".
 */
function publicHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    Accept: "application/json",
    "X-App-Source": "mobile",
    ...(API_KEY ? { "x-api-key": API_KEY } : {}),
    ...(extra ?? {}),
  };
}

/* ---------- persistent (AsyncStorage) read-through cache ----------
 * Static-ish reads (surah verses, tafsir, editions, suggested questions) are
 * cached on-device so Recite, the reference pages, and pickers load instantly,
 * work briefly offline, and stay well under the rate limit. `initPublicCache`
 * is called once at app start with AsyncStorage; tests use in-memory storage.
 * Search (POST /api/ask) is never cached — it stays live. Failed fetches are
 * never cached (the error propagates without storing). */
let cache = new TtlCache(createMemoryStorage());
export function initPublicCache(storage: Storage): void {
  cache = new TtlCache(storage);
}
const DAY = 86_400_000;
const TTL = { verses: 30 * DAY, tafsir: 30 * DAY, editions: 7 * DAY, questions: DAY };

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
    headers: publicHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      question,
      ...(opts.translation ? { translation: opts.translation } : {}),
      ...(opts.language ? { language: opts.language } : {}),
      ...(opts.tafsir ? { tafsir: opts.tafsir } : {}),
    }),
  });
}

/** GET /api/translations — translation + tafsir editions + the default id (cached). */
export async function getTranslations(): Promise<{ default: string; translations: TranslationMeta[]; tafsirs: TafsirMeta[] }> {
  return cache.get("pub:translations", TTL.editions, async () => {
    const data = await getJson<{ default: string; translations: TranslationMeta[]; tafsirs?: TafsirMeta[] }>(
      `${PUBLIC_API_BASE_URL}/translations`,
      { headers: publicHeaders() },
    );
    return { default: data.default, translations: data.translations ?? [], tafsirs: data.tafsirs ?? [] };
  });
}

/** Unique language names that have a tafsir edition — powers the Tafsir picker. */
export async function getTafsirLanguages(): Promise<string[]> {
  try {
    const { tafsirs } = await getTranslations();
    const langs = [...new Set(tafsirs.map((t) => t.language).filter(Boolean))];
    return langs.length ? langs : ["English"];
  } catch {
    return ["English"];
  }
}

// A language can have several editions (Urdu ships 8). Where the owner has a
// preferred default, pin it by id; we still fall back to the first matching
// edition if that id isn't in the catalog. Keyed by lowercased language name.
const PREFERRED_EDITION: Record<string, string> = {
  urdu: "ur.maududi", // ابوالاعلی مودودی
};

/** Resolve a translation edition id for a UI language name ("English"/"Urdu"…). */
export async function translationIdForLanguage(language: string): Promise<string | undefined> {
  try {
    const { default: def, translations } = await getTranslations();
    const want = language.toLowerCase();
    const preferredId = PREFERRED_EDITION[want];
    if (preferredId && translations.some((t) => t.id === preferredId)) return preferredId;
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
  const key = `pub:verses:${translationId}:${tafsir ?? ""}:${refs.join(",")}`;
  return cache.get(key, TTL.verses, async () => {
    const qs = new URLSearchParams({ refs: refs.join(","), translation: translationId });
    if (tafsir) qs.set("tafsir", tafsir);
    const data = await getJson<{ verses: AyahResult[] }>(`${PUBLIC_API_BASE_URL}/verses?${qs.toString()}`, {
      headers: publicHeaders(),
    });
    return data.verses ?? [];
  });
}

export interface TafsirItem {
  verseKey: string;
  available: boolean;
  tafsir: string;
  edition: { id: string; name: string; language: string } | null;
}

/**
 * GET /api/tafsir?refs=…&language=… — lean, on-demand tafsir (text + edition
 * attribution only) for one or more ayahs, in the chosen language. Verbatim
 * from stored sources; never machine-translated or generated. Used by Recite's
 * per-ayah "View tafsir".
 */
export async function getTafsir(
  refs: string[],
  language?: string,
  tafsir?: string,
): Promise<{ language: string; editionId: string; edition: { id: string; name: string; language: string } | null; items: TafsirItem[] }> {
  const key = `pub:tafsir:${language ?? ""}:${tafsir ?? ""}:${refs.join(",")}`;
  return cache.get(key, TTL.tafsir, async () => {
    const qs = new URLSearchParams({ refs: refs.join(",") });
    if (language) qs.set("language", language);
    if (tafsir) qs.set("tafsir", tafsir);
    return getJson(`${PUBLIC_API_BASE_URL}/tafsir?${qs.toString()}`, { headers: publicHeaders() });
  });
}

/** GET /api/suggested-questions — saved template questions grouped by topic (cached). */
export async function getSuggestedQuestions(): Promise<SuggestedGroup[]> {
  return cache.get("pub:suggested", TTL.questions, async () => {
    const data = await getJson<{ groups: SuggestedGroup[] }>(`${PUBLIC_API_BASE_URL}/suggested-questions`, {
      headers: publicHeaders(),
    });
    return data.groups ?? [];
  });
}
