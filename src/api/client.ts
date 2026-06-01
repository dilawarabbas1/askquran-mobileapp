import { API_BASE_URL, API_KEY, DEFAULT_TRANSLATION } from "@/config";
import { compareAyahRefs, expandRefs } from "@/lib/refs";
import type {
  AskFilters,
  AskResponse,
  AyahResult,
  SuggestedGroup,
  TafsirMeta,
  TranslationMeta,
} from "@/types";

/**
 * Ask Quran API client.
 *
 * Reads go through the key-gated external API (`/api/v1/*`, authenticated with
 * `x-api-key`). Search has no v1 equivalent, so it uses the public `POST
 * /api/ask`. When no API key is configured, read calls fall back to the public
 * `/api/*` endpoints so the app still runs out of the box (documented in README).
 *
 * No text is ever generated here — every field is rendered verbatim from what
 * the backend returns.
 */

const hasKey = API_KEY.trim().length > 0;

function v1Headers(): HeadersInit {
  return hasKey ? { "x-api-key": API_KEY } : {};
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { error?: string });
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/* ------------------------------------------------------------------ search */

/**
 * POST /api/ask — the deterministic source-grounded search (public endpoint).
 * Returns the full rich response: ayahs, context passages, transliteration,
 * audio, tafsir, sources, and match reasons.
 */
export async function ask(
  question: string,
  translation?: string,
  filters?: AskFilters,
  language?: string,
  tafsir?: string,
): Promise<AskResponse> {
  return getJson<AskResponse>(`${API_BASE_URL}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      translation,
      language,
      ...(tafsir ? { tafsir } : {}),
      ...filters,
    }),
  });
}

/* ------------------------------------------------------ translations + tafsirs */

/**
 * Editions for the Language → Translation → Tafsir selectors. Prefers the
 * key-gated v1 endpoints; falls back to the public ones when no key is set.
 */
export async function fetchTranslations(): Promise<{
  default: string;
  translations: TranslationMeta[];
  tafsirs: TafsirMeta[];
}> {
  if (hasKey) {
    try {
      const [tr, tf] = await Promise.all([
        getJson<{ translations: TranslationMeta[] }>(`${API_BASE_URL}/api/v1/translations`, {
          headers: v1Headers(),
        }),
        getJson<{ editions: (TafsirMeta & Record<string, unknown>)[] }>(
          `${API_BASE_URL}/api/v1/tafsirs`,
          { headers: v1Headers() },
        ),
      ]);
      return {
        default: DEFAULT_TRANSLATION,
        translations: tr.translations,
        tafsirs: tf.editions.map((e) => ({ id: e.id, name: e.name, language: e.language })),
      };
    } catch {
      /* fall through to the public endpoint */
    }
  }
  const data = await getJson<{
    default: string;
    translations: TranslationMeta[];
    tafsirs?: TafsirMeta[];
  }>(`${API_BASE_URL}/api/translations`);
  return { default: data.default, translations: data.translations, tafsirs: data.tafsirs ?? [] };
}

/* ------------------------------------------------- suggested (template) questions */

export async function fetchSuggestedQuestions(): Promise<SuggestedGroup[]> {
  try {
    const data = await getJson<{ groups: SuggestedGroup[] }>(
      `${API_BASE_URL}/api/suggested-questions`,
    );
    return data.groups ?? [];
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------ verse ranges */

// Per-surah cache so reference pages that share surahs don't refetch them.
const surahCache = new Map<string, AyahResult[]>();

async function fetchSurahV1(surah: number, translation: string): Promise<AyahResult[]> {
  const key = `${surah}|${translation}`;
  const cached = surahCache.get(key);
  if (cached) return cached;
  const qs = new URLSearchParams({ translation });
  const data = await getJson<{
    verses: { verseKey: string; ayah: number; arabic: string; translation?: string }[];
  }>(`${API_BASE_URL}/api/v1/quran/surah/${surah}?${qs}`, { headers: v1Headers() });
  const verses: AyahResult[] = data.verses.map((v, i) => ({
    rank: i + 1,
    surah,
    ayah: v.ayah,
    juz: 0,
    verseKey: v.verseKey,
    surahNameEn: "",
    surahNameAr: "",
    revelationPlace: "",
    arabic: v.arabic,
    translationId: translation,
    translation: v.translation ?? "",
    tafseer: "",
    tafseerAvailable: false,
    relevanceScore: 0,
    sources: { arabic: "Tanzil", translation: "", tafseer: "" },
  }));
  surahCache.set(key, verses);
  return verses;
}

/**
 * Verbatim Arabic + chosen translation for the given refs (single keys or
 * single-surah ranges), expanded and returned in Quran order. Used by the
 * reference pages (Prophet Stories, Parables, Duas, …). Prefers v1 (per-surah
 * fetch + slice); falls back to the public `/api/verses` when no key is set.
 */
export async function fetchVerses(
  refs: string[],
  translation: string,
  tafsir?: string,
): Promise<{ verses: AyahResult[]; missing: string[] }> {
  const wantKeys = expandRefs(refs);

  if (!hasKey) {
    // Public fallback: one call covers multi-surah ranges + optional tafsir.
    const qs = new URLSearchParams({ refs: refs.join(","), translation });
    if (tafsir) qs.set("tafsir", tafsir);
    const data = await getJson<{ verses: AyahResult[]; missing: string[] }>(
      `${API_BASE_URL}/api/verses?${qs}`,
    );
    return { verses: data.verses, missing: data.missing ?? [] };
  }

  // v1 path: group needed keys by surah, fetch each surah once, then pick.
  const wanted = new Set(wantKeys);
  const surahs = [...new Set(wantKeys.map((k) => Number(k.split(":")[0])))];
  const bySurah = await Promise.all(surahs.map((s) => fetchSurahV1(s, translation)));
  const picked: AyahResult[] = [];
  for (const list of bySurah) for (const v of list) if (wanted.has(v.verseKey)) picked.push(v);
  picked.sort((a, b) => compareAyahRefs(a.verseKey, b.verseKey));

  // Tafsir (lazy, per ayah) when requested.
  if (tafsir) {
    const edition = tafsir === "1" ? "ibn_kathir_en" : tafsir;
    await Promise.all(
      picked.map(async (v) => {
        try {
          const t = await getJson<{ available: boolean; tafsir: string; edition: { name: string } }>(
            `${API_BASE_URL}/api/v1/tafsirs/${encodeURIComponent(edition)}/ayah/${v.verseKey}`,
            { headers: v1Headers() },
          );
          if (t.available) {
            v.tafseer = t.tafsir;
            v.tafseerAvailable = true;
            v.sources = { ...v.sources, tafseer: t.edition?.name ?? "" };
          }
        } catch {
          /* leave tafsir unavailable */
        }
      }),
    );
  }

  const found = new Set(picked.map((v) => v.verseKey));
  const missing = wantKeys.filter((k) => !found.has(k));
  return { verses: picked, missing };
}
