// API configuration. `EXPO_PUBLIC_API_BASE_URL` is the backend HOST ROOT (same
// semantics as the web app's VITE_API_BASE_URL) — the public client appends
// `/api/...` and the key-gated client appends `/api/v1`. Set it at build/start:
//
//   EXPO_PUBLIC_API_BASE_URL=https://your-backend npm start
//
// The API key is sent on every request (the public /api/* layer is authenticated
// by default, like the web bundle which ships VITE_API_KEY). It can be overridden
// at build/start via EXPO_PUBLIC_API_KEY (e.g. to rotate it or use an EAS secret);
// otherwise the bundled mobile client key below is used so the app works out of
// the box in dev and in builds. This is a client-embedded, read-only, rate-limited
// key — rotate it from Admin → API Credentials if needed.

const stripSlash = (u: string) => u.replace(/\/+$/, "");

/** Backend host root, e.g. https://api.askquran.co (web-style base URL). */
export const API_HOST = stripSlash(process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.askquran.co");

/** Public, no-key API base (search, suggested questions, translations, verses). */
export const PUBLIC_API_BASE_URL = `${API_HOST}/api`;

/** Key-gated v1 read API base. */
export const API_BASE_URL = `${API_HOST}/api/v1`;

/** The mobile app's API key — env override wins; otherwise the bundled default. */
export const API_KEY = process.env.EXPO_PUBLIC_API_KEY || "aq_live_tIhV-UT9fJl5mmL-CkDPRQ4JLKjmN4iDEgYVbbaU";

/** True when a key is configured; the UI can surface a config banner otherwise. */
export const HAS_API_KEY = API_KEY.trim().length > 0;
