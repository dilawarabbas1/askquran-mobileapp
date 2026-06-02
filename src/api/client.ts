// AskQuran API client. Wraps the requester with typed endpoint methods,
// pre-flight verse-key validation, on-device caching of the static lists, and
// an in-memory LRU for per-ayah reads. Read-only and source-grounded: text is
// returned verbatim from the API, never generated here.

import { Lru, TtlCache, createMemoryStorage, type Storage } from "./cache";
import { AqError } from "./errors";
import { createRequester, type FetchLike, type Requester } from "./request";
import type {
  AudioResponse,
  AyahResponse,
  AyahTranslationResponse,
  RateLimitInfo,
  SurahVersesResponse,
  SurahsResponse,
  TafsirResponse,
  TafsirsResponse,
  TranslationsResponse,
  VerseKey,
} from "./types";

export interface AqClientDeps {
  fetch: FetchLike;
  baseUrl: string;
  apiKey: string;
  /** Persistent KV for the static lists. Defaults to in-memory. */
  storage?: Storage;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  onRateLimit?: (info: RateLimitInfo) => void;
  /** TTL for the static lists (default 7 days). */
  staticTtlMs?: number;
  /** Per-ayah LRU capacity (default 300). */
  lruSize?: number;
}

const VKEY_RE = /^(\d{1,3}):(\d{1,4})$/;

/** True for a well-formed "surah:ayah" with surah 1–114 and ayah ≥ 1. */
export function isValidVerseKey(vk: string): boolean {
  const m = VKEY_RE.exec(vk);
  if (!m) return false;
  const s = Number(m[1]);
  const a = Number(m[2]);
  return s >= 1 && s <= 114 && a >= 1;
}

/** Throw a typed validation error (no network round-trip) for a bad key. */
function assertVerseKey(vk: string): void {
  if (!isValidVerseKey(vk)) {
    throw new AqError("validation", `Invalid verse key "${vk}" (expected "surah:ayah", surah 1–114).`);
  }
}

function assertSurah(surah: number): void {
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) {
    throw new AqError("validation", `Invalid surah number ${surah} (expected 1–114).`);
  }
}

const CACHE_KEYS = {
  surahs: "aq:v1:surahs",
  translations: "aq:v1:translations",
  tafsirs: "aq:v1:tafsirs",
};

export interface AqClient {
  /** 1. 114 surah names. Cached aggressively (call on launch to warm). */
  getSurahs(): Promise<SurahsResponse>;
  /** 2. Verbatim Arabic for a single ayah. */
  getAyah(verseKey: VerseKey): Promise<AyahResponse>;
  /** 3. A whole surah; pass `translationId` to include a stored translation. */
  getSurah(surah: number, translationId?: string): Promise<SurahVersesResponse>;
  /** 4. Available translation editions. Cached. */
  getTranslations(): Promise<TranslationsResponse>;
  /** 5. A single ayah's translation in one edition. */
  getAyahTranslation(translationId: string, verseKey: VerseKey): Promise<AyahTranslationResponse>;
  /** 6. Available tafsir editions. Cached. */
  getTafsirs(): Promise<TafsirsResponse>;
  /** 7. Tafsir for one ayah/edition; `available:false` means none stored. */
  getTafsir(editionId: string, verseKey: VerseKey): Promise<TafsirResponse>;
  /** 8. Audio recitation URL for one ayah (reciter "default" unless picking). */
  getAudio(verseKey: VerseKey, reciter?: string): Promise<AudioResponse>;
  /** Last seen rate-limit headers, or null. */
  getRateLimit(): RateLimitInfo | null;
  /** Clear all caches (static lists + per-ayah LRU). */
  clearCache(): Promise<void>;
}

export function createAqClient(deps: AqClientDeps): AqClient {
  const storage = deps.storage ?? createMemoryStorage();
  const requester: Requester = createRequester({
    fetch: deps.fetch,
    baseUrl: deps.baseUrl,
    apiKey: deps.apiKey,
    sleep: deps.sleep,
    onRateLimit: deps.onRateLimit,
  });
  const ttl = new TtlCache(storage, deps.now);
  const staticTtl = deps.staticTtlMs ?? 7 * 24 * 60 * 60 * 1000;
  const ayahLru = new Lru<AyahResponse>(deps.lruSize ?? 300);
  const surahLru = new Lru<SurahVersesResponse>(50);
  const trLru = new Lru<AyahTranslationResponse>(deps.lruSize ?? 300);
  const tafLru = new Lru<TafsirResponse>(deps.lruSize ?? 300);
  const audioLru = new Lru<AudioResponse>(deps.lruSize ?? 300);

  const seg = (s: string) => encodeURIComponent(s);

  return {
    getSurahs() {
      return ttl.get(CACHE_KEYS.surahs, staticTtl, () => requester.get<SurahsResponse>("/quran/surahs"));
    },

    async getAyah(verseKey) {
      assertVerseKey(verseKey);
      return ayahLru.remember(verseKey, () => requester.get<AyahResponse>(`/quran/ayah/${verseKey}`));
    },

    async getSurah(surah, translationId) {
      assertSurah(surah);
      const key = `${surah}|${translationId ?? ""}`;
      return surahLru.remember(key, () => {
        const qs = translationId ? `?translation=${seg(translationId)}` : "";
        return requester.get<SurahVersesResponse>(`/quran/surah/${surah}${qs}`);
      });
    },

    getTranslations() {
      return ttl.get(CACHE_KEYS.translations, staticTtl, () =>
        requester.get<TranslationsResponse>("/translations"),
      );
    },

    async getAyahTranslation(translationId, verseKey) {
      assertVerseKey(verseKey);
      const key = `${translationId}|${verseKey}`;
      return trLru.remember(key, () =>
        requester.get<AyahTranslationResponse>(`/translations/${seg(translationId)}/ayah/${verseKey}`),
      );
    },

    getTafsirs() {
      return ttl.get(CACHE_KEYS.tafsirs, staticTtl, () => requester.get<TafsirsResponse>("/tafsirs"));
    },

    async getTafsir(editionId, verseKey) {
      assertVerseKey(verseKey);
      const key = `${editionId}|${verseKey}`;
      return tafLru.remember(key, () =>
        requester.get<TafsirResponse>(`/tafsirs/${seg(editionId)}/ayah/${verseKey}`),
      );
    },

    async getAudio(verseKey, reciter = "default") {
      assertVerseKey(verseKey);
      const key = `${reciter}|${verseKey}`;
      return audioLru.remember(key, () =>
        requester.get<AudioResponse>(`/audio/${seg(reciter)}/ayah/${verseKey}`),
      );
    },

    getRateLimit: () => requester.lastRateLimit(),

    async clearCache() {
      await ttl.clear(Object.values(CACHE_KEYS));
      ayahLru.clear();
      surahLru.clear();
      trLru.clear();
      tafLru.clear();
      audioLru.clear();
    },
  };
}
