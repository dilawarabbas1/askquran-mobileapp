// Mirrors the backend response shapes (kept minimal for the UI).

export interface ResultSources {
  arabic: string;
  translation: string;
  tafseer: string;
}

export interface AyahAudio {
  reciter: string;
  source: string;
  url: string;
}

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

export interface TafsirEditionMeta {
  id: string;
  name: string;
  source: string;
  publisher: string;
  language: string;
  sourceType: "tafsir" | "tafsir-style-explanation" | "translation-tafsir";
  complete: boolean;
  coverage: number;
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
  /** Languages that have a tafsir for THIS verse (for the "available in …" note). */
  tafseerAvailableLanguages?: string[];
  /** Source/edition metadata for the displayed tafsir. */
  tafseerEdition?: TafsirEditionMeta;
  relevanceScore: number;
  sources: ResultSources;
  context?: ResultContext;
  resultType?:
    | "ayah"
    | "context_passage"
    | "guidance_topic"
    | "topic_match"
    | "concept_answer"
    | "concept_reference";
  referenceRange?: string | null;
  verseKeys?: string[];
  topicId?: string;
  topicTitle?: string;
  reviewStatus?: string;
  sensitivity?: string;
  matchReasons?: string[];
}

export interface AskFilters {
  surah?: number;
  juz?: number;
  revelationPlace?: string;
}

export interface SearchExpansion {
  source: string;
  originalTerms: string[];
  matchedConcepts: string[];
  expandedTerms: string[];
}

export interface AskResponse {
  question: string;
  translationId: string;
  language?: string;
  count: number;
  results: AyahResult[];
  terms: string[];
  searchExpansion?: SearchExpansion;
  filters?: AskFilters;
  message?: string;
  tafsirAvailableLanguages?: string[];
}

export interface TranslationMeta {
  id: string;
  name: string;
  language: string;
}

export interface TafsirMeta {
  id: string;
  name: string;
  language: string;
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  conceptId?: string | null;
  priority?: number;
  /** Human-authored translations of `text`, keyed by English language name. */
  translations?: Record<string, string>;
}
export interface SuggestedGroup {
  id: string;
  title: string;
  priority?: number;
  questions: SuggestedQuestion[];
}

// --- Analytics (admin dashboard) ---
export interface QueryStats {
  total: number;
  sampled: number;
  topQuestions: { question: string; count: number }[];
  zeroResultQuestions: { question: string; count: number }[];
  byTranslation: { translationId: string; count: number }[];
  byLanguage: { language: string; count: number }[];
  byDay: { day: string; count: number }[];
}

export interface StoredQueryLog {
  id: string;
  ts: string;
  ip: string;
  question: string;
  requestedTranslation: string;
  translationId: string;
  count: number;
  response: AskResponse;
}
