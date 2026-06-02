// Typed response models for the AskQuran public API (read-only, GET-only).
// https://api.askquran.co/api/v1 — every response carries an attribution
// `source` string; surface it in the UI where appropriate. No field here is
// ever AI-generated: Arabic is verbatim, translations/tafsir are stored, audio
// is a direct URL.

/** A "surah:ayah" string, e.g. "1:1", "2:255". Surah is 1–114. */
export type VerseKey = string;

/* 1. GET /quran/surahs */
export interface SurahMeta {
  surah: number;
  name_en: string;
  name_ar: string;
}
export interface SurahsResponse {
  surahs: SurahMeta[];
  source: string;
}

/* 2. GET /quran/ayah/{verseKey} */
export interface AyahResponse {
  verseKey: VerseKey;
  surah: number;
  ayah: number;
  arabic: string;
  source: string;
}

/* 3. GET /quran/surah/{surah}?translation={translationId} */
export interface SurahVerse {
  verseKey: VerseKey;
  ayah: number;
  arabic: string;
  /** Present only when a `translation` id was requested. */
  translation?: string;
}
export interface SurahVersesResponse {
  surah: number;
  /** Omitted by the API when no translation was requested. */
  translationId?: string;
  translationName?: string;
  verses: SurahVerse[];
  source: string;
}

/* 4. GET /translations */
export interface TranslationMeta {
  id: string;
  name: string;
  language: string;
}
export interface TranslationsResponse {
  translations: TranslationMeta[];
  source: string;
}

/* 5. GET /translations/{translationId}/ayah/{verseKey} */
export interface AyahTranslationResponse {
  verseKey: VerseKey;
  translationId: string;
  translationName: string;
  translation: string;
  source: string;
}

/* 6. GET /tafsirs */
export interface TafsirEditionMeta {
  id: string;
  name: string;
  language: string;
  source: string;
  publisher: string;
  /** Whether all 6236 ayahs are covered. */
  complete: boolean;
  /** Number of ayahs covered by this edition. */
  coverage: number;
}
export interface TafsirsResponse {
  editions: TafsirEditionMeta[];
  source: string;
}

/* 7. GET /tafsirs/{editionId}/ayah/{verseKey} */
export interface TafsirEdition {
  name: string;
  language: string;
  source: string;
  publisher: string;
  complete: boolean;
}
export interface TafsirResponse {
  verseKey: VerseKey;
  editionId: string;
  edition: TafsirEdition;
  /** When false, `tafsir` is "" — show a graceful "not available" state. */
  available: boolean;
  tafsir: string;
  source: string;
}

/* 8. GET /audio/{reciter}/ayah/{verseKey} */
export interface AudioResponse {
  verseKey: VerseKey;
  reciter: string;
  /** Direct MP3 URL. */
  url: string;
  source: string;
}

/** Parsed from the `X-RateLimit-*` response headers. */
export interface RateLimitInfo {
  limit: number | null;
  remaining: number | null;
}
