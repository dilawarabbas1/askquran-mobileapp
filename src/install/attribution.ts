// Android install attribution. On first launch we read the Google Play Install
// Referrer (the `referrer` string Play captured when the user installed after
// tapping a volunteer's Play link, e.g. `…&referrer=utm_volunteer%3DABC123`),
// parse `utm_volunteer=<code>` out of it, and POST it to the backend so the
// install is credited to that volunteer. No referrer / no code = an organic
// (direct) install — we record nothing and just mark attribution as done.
//
// iOS has no deterministic install referrer, so this is Android-only.
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
  if (Platform.OS !== "android") return;

  try {
    if ((await AsyncStorage.getItem(ATTRIBUTED_KEY)) === "1") return;
  } catch {
    return; // storage unavailable — try again next launch
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
