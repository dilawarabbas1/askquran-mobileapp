// App-wired AskQuran client singleton: real AsyncStorage for the persistent
// static-list cache, the platform `fetch`, and the env-injected key/base URL.
// Import `aq` anywhere in the app; import from "./client" directly in tests.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAqClient } from "./client";
import { API_BASE_URL, API_KEY } from "./config";
import type { FetchLike } from "./request";

export const aq = createAqClient({
  fetch: fetch as unknown as FetchLike,
  baseUrl: API_BASE_URL,
  apiKey: API_KEY,
  storage: AsyncStorage,
});

export * from "./types";
export { AqError } from "./errors";
export type { AqErrorKind } from "./errors";
export { isValidVerseKey } from "./client";
export { HAS_API_KEY } from "./config";

// Public (no-key) backend client — search + suggested questions, like the web.
export { ask, getSuggestedQuestions, getTranslations, getVerses, translationIdForLanguage, type AskOptions } from "./public";
export type { AskResponse, AyahResult, SuggestedGroup, SuggestedQuestion, TranslationMeta } from "./publicTypes";
