import Constants from "expo-constants";

/**
 * Runtime config. Values come from app.json `extra` (overridable per build /
 * env). The app talks to the Ask Quran backend; the key-gated external API
 * (`/api/v1/*`) needs an API key, while the search endpoint (`/api/ask`) is
 * public. On a physical device, `localhost` will NOT reach your dev machine —
 * set apiBaseUrl to your machine's LAN IP (e.g. http://192.168.1.10:4000).
 */
const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiBaseUrl?: string;
  apiKey?: string;
};

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? extra.apiBaseUrl ?? "http://localhost:4000";

/** API key sent as `x-api-key` to the key-gated `/api/v1/*` endpoints. */
export const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? extra.apiKey ?? "";

/** Default translation edition used when none is selected. */
export const DEFAULT_TRANSLATION = "en.sahih";

/** Fixed, non-generated message returned when nothing matches (mirrors backend). */
export const NO_MATCH_MESSAGE = "No matching Quran reference found";
