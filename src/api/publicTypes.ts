// Response models for the PUBLIC AskQuran backend (the same surface the web app
// uses — no API key). Mirrors askquran/frontend/src/types.ts exactly so the
// mobile app consumes identical shapes.

export interface AyahAudio { reciter: string; source: string; url: string }
export interface ResultSources { arabic: string; translation: string; tafseer: string }
export interface ContextVerse {
  verse_key: string;
  arabic: string;
  translation: string;
  isMatch: boolean;
  transliteration?: string;
  audio?: AyahAudio;
}
export interface ResultContext {
  strategy: string;
  confidence: string;
  label: string;
  reason: string;
  verse_keys: string[];
  verses: ContextVerse[];
}
export interface AyahResult {
  rank: number;
  surah: number;
  ayah: number;
  juz: number;
  verseKey: string;
  surahNameEn: string;
  surahNameAr: string;
  revelationPlace: string;
  arabic: string;
  transliteration?: string;
  audio?: AyahAudio;
  translationId: string;
  translation: string;
  tafseer: string;
  tafseerAvailable: boolean;
  relevanceScore: number;
  sources: ResultSources;
  context?: ResultContext;
  resultType?: string;
  referenceRange?: string | null;
}
export interface AskResponse {
  question: string;
  translationId: string;
  language?: string;
  count: number;
  results: AyahResult[];
  terms: string[];
  message?: string;
}

export interface TranslationMeta { id: string; name: string; language: string }

export interface SuggestedQuestion {
  id: string;
  text: string;
  conceptId?: string | null;
  priority?: number;
  translations?: Record<string, string>;
}
export interface SuggestedGroup {
  id: string;
  title: string;
  priority?: number;
  questions: SuggestedQuestion[];
}
