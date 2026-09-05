// xNotify Event Tracking configuration. Read by Expo at build/start via
// EXPO_PUBLIC_* env vars. The Event Key is a CREDENTIAL — it is never hardcoded
// here; supply it via `.env` (gitignored) or an EAS secret. When unset, the
// tracker becomes a silent no-op so dev/builds work without analytics wired.
//
//   EXPO_PUBLIC_XNOTIFY_EVENT_KEY=<your event key> npm start
//
// Events are POSTed to xNotify's ingest API `<base>/v2/save` with the key sent
// in the `x-event-key` header (verified against the Event service route +
// middleware: /v2/save → verifyEventKey reads x-event-key; controller requires
// event_name + properties; contact_no optional; distinct_id used for anonymous).

const stripSlash = (u: string) => u.replace(/\/+$/, "");

/** xNotify event ingest host root. Defaults to the EventService host.
 *
 * IMPORTANT: this is `event.xnotify.ai`, NOT `api.xnotify.ai`. The latter is an
 * upstream API gateway that authenticates with `x-api-key` and rejects the Event
 * Key with 401 "Missing API key" / 403 "Invalid API key". The EventService that
 * reads our `x-event-key` header (verifyEventKey → Redis hash `customer_event`)
 * lives at `event.xnotify.ai`. Verified live 2026-06-05: POST /v2/save → HTTP 202
 * {"success":true,"message":"Event queued for insertion"}. (DA-BUG-0341) */
export const EVENT_API_HOST = stripSlash(
  process.env.EXPO_PUBLIC_XNOTIFY_EVENT_API_URL || "https://event.xnotify.ai",
);

/** Full ingest endpoint: POST <host>/v2/save. */
export const EVENT_SAVE_URL = `${EVENT_API_HOST}/v2/save`;

/** The product's Event Key. Empty unless injected via env — never committed. */
export const EVENT_KEY = (process.env.EXPO_PUBLIC_XNOTIFY_EVENT_KEY || "").trim();

/** Analytics is active only when an Event Key is configured. */
export const ANALYTICS_ENABLED = EVENT_KEY.length > 0;

/** Tags every event's `source` so xNotify attributes it to the mobile surface. */
export const EVENT_SOURCE = "mobile";
