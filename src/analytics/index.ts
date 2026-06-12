// App-wired analytics singleton: the platform `fetch`, real AsyncStorage for the
// persistent anonymous id, env-injected Event Key/URL, and common properties
// (platform + app version) merged into every event. Import `analytics` / `track`
// anywhere; import from "./tracker" directly in tests (this file pulls in native
// modules and is excluded from the test build).

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createTracker, uuidv4, type Tracker, type TrackerFetch } from "./tracker";
import { EVENT_KEY, EVENT_SAVE_URL, EVENT_SOURCE, ANALYTICS_ENABLED } from "./config";
import appJson from "../../app.json";

const APP_VERSION: string = (appJson as { expo?: { version?: string } })?.expo?.version ?? "";

// Adapt RN fetch (Response) to the tracker's minimal {ok,status} contract.
const trackerFetch: TrackerFetch = async (url, init) => {
  const res = await fetch(url, {
    method: init.method,
    headers: init.headers,
    body: init.body,
  });
  return { ok: res.ok, status: res.status };
};

export const analytics: Tracker = createTracker({
  fetch: trackerFetch,
  saveUrl: EVENT_SAVE_URL,
  eventKey: EVENT_KEY,
  storage: AsyncStorage,
  genId: () => uuidv4(),
  source: EVENT_SOURCE,
  baseProperties: () => ({
    // The xNotify "Channel" attribute — every event from this app is tagged
    // "Mobile" so it can be segmented apart from web/other channels.
    channel: "Mobile",
    platform: Platform.OS,
    app_version: APP_VERSION,
  }),
});

/** Convenience: enqueue an event. No-op when no Event Key is configured. */
export function track(eventName: string, properties?: Record<string, unknown>): void {
  analytics.track(eventName, properties);
}

export { ANALYTICS_ENABLED };
export type { Tracker } from "./tracker";
