// API configuration. `EXPO_PUBLIC_API_BASE_URL` is the backend HOST ROOT (same
// semantics as the web app's VITE_API_BASE_URL) — the public client appends
// `/api/...` and the key-gated client appends `/api/v1`. Set it at build/start:
//
//   EXPO_PUBLIC_API_BASE_URL=https://your-backend npm start
//
// The API key (only needed for the v1 key-gated endpoints) is read from
// EXPO_PUBLIC_API_KEY and never hard-coded; keep it in a gitignored `.env` or an
// EAS secret. The public endpoints (search, suggested questions, translations,
// verses) need no key — that is how the web app talks to the backend.

const stripSlash = (u: string) => u.replace(/\/+$/, "");

/** Backend host root, e.g. https://api.askquran.co (web-style base URL). */
export const API_HOST = stripSlash(process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.askquran.co");

/** Public, no-key API base (search, suggested questions, translations, verses). */
export const PUBLIC_API_BASE_URL = `${API_HOST}/api`;

/** Key-gated v1 read API base. */
export const API_BASE_URL = `${API_HOST}/api/v1`;

export const API_KEY = process.env.EXPO_PUBLIC_API_KEY || "";

/** True when a key is configured; the UI can surface a config banner otherwise. */
export const HAS_API_KEY = API_KEY.trim().length > 0;
