// Install attribution. On first launch we credit the referring volunteer.
//
// • Android (deterministic): read the Google Play Install Referrer (e.g.
//   `…&referrer=utm_volunteer%3DABC123`), parse `utm_volunteer=<code>`, and POST
//   /r/<code>/install. No code = organic install → record nothing.
// • iOS (estimated): Apple gives no install referrer, so the app can't know its
//   code. It just pings POST /install {platform:"ios"} and the backend matches the
//   request IP to a recent `?to=ios` touch (probabilistic). No native code needed.
//
// Best-effort throughout: it must never crash or block app startup.

import { NativeModules, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PUBLIC_API_BASE_URL } from "@/api/config";
import { parseVolunteerCode } from "./parseReferrer";

const ATTRIBUTED_KEY = "aq_install_attributed_v1";

type InstallReferrerNative = { getInstallReferrer(): Promise<string | null> };

/**
 * Run install attribution exactly once per install. Safe to call on every launch:
 * it short-circuits once attribution has been resolved. The done-flag is only set
 * when there is nothing left to retry (organic install, a successful POST, or a
 * 404 unknown-code) — transient network/5xx failures leave it unset so the next
 * launch tries again while the referrer is still readable.
 */
export async function attributeInstallOnce(): Promise<void> {
  if (Platform.OS !== "android" && Platform.OS !== "ios") return;

  try {
    if ((await AsyncStorage.getItem(ATTRIBUTED_KEY)) === "1") return;
  } catch {
    return; // storage unavailable — try again next launch
  }

  if (Platform.OS === "ios") {
    await attributeIos();
    return;
  }

  const native = NativeModules.AQInstallReferrer as InstallReferrerNative | undefined;
  if (!native?.getInstallReferrer) return; // module absent (e.g. pre-attribution build)

  let referrer: string | null = null;
  try {
    referrer = await native.getInstallReferrer();
  } catch {
    referrer = null;
  }

  const code = parseVolunteerCode(referrer);
  if (!code) {
    // Organic / direct install — nothing to attribute, never retry.
    await AsyncStorage.setItem(ATTRIBUTED_KEY, "1").catch(() => {});
    return;
  }

  try {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/r/${encodeURIComponent(code)}/install`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-App-Source": "mobile" },
      body: JSON.stringify({ platform: "android" }),
    });
    // 2xx = recorded; 404 = code will never resolve → stop either way.
    if (res.ok || res.status === 404) {
      await AsyncStorage.setItem(ATTRIBUTED_KEY, "1").catch(() => {});
    }
    // Otherwise (5xx): leave the flag unset to retry next launch.
  } catch {
    // Network error — retry next launch.
  }
}

/**
 * iOS attribution: codeless ping. The backend matches our request IP to a recent
 * `?to=ios` referral touch and credits that volunteer (estimated). We send no code
 * (the app has none on iOS). A 2xx (matched or not) means the attempt is resolved;
 * transient failures leave the flag unset to retry next launch (within the touch
 * window). 4xx (bad request) is terminal — stop retrying.
 */
async function attributeIos(): Promise<void> {
  try {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/install`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-App-Source": "mobile" },
      body: JSON.stringify({ platform: "ios" }),
    });
    if (res.ok || (res.status >= 400 && res.status < 500)) {
      await AsyncStorage.setItem(ATTRIBUTED_KEY, "1").catch(() => {});
    }
    // 5xx → leave unset, retry next launch.
  } catch {
    // Network error — retry next launch.
  }
}
