// API configuration. The key is NEVER hard-coded here — it is read from a
// build-time env var that Expo inlines into the bundle (EXPO_PUBLIC_*), so it
// stays out of source control. Provide it at build/start time, e.g.:
//
//   EXPO_PUBLIC_API_KEY=aq_live_xxx npm start
//
// or via EAS "secrets" / a `.env` that is gitignored. For a hardened setup,
// point EXPO_PUBLIC_API_BASE_URL at a thin server-side proxy that holds the key
// (the app then needs no key at all) — see README "Security".

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.askquran.co/api/v1";

export const API_KEY = process.env.EXPO_PUBLIC_API_KEY || "";

/** True when a key is configured; the UI can surface a config banner otherwise. */
export const HAS_API_KEY = API_KEY.trim().length > 0;
