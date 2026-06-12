// xNotify Push (react-native-xpush) bootstrap — subscriber registration only.
//
// AskQuran registers ANONYMOUSLY: the native SDK accepts a subscriber id with no
// phone number, so we reuse the analytics anonymous install id (a stable
// per-install UUID) as the subscriber id and pass the env-injected Push SDK Key
// (propertyId) as the second argument to `initialize(subscriberId, propertyId)`.
//
// Scope: this wires push delivery + subscriber registration ONLY. The SDK's
// in-app notification list / inbox is intentionally NOT surfaced in the UI.
//
// Everything here is defensively guarded: the native `PushModule` is absent in
// Expo Go, on iOS until that side is wired, and on any build where the SDK didn't
// link. In those cases every export is a silent no-op so the app still runs.

import { NativeModules, PermissionsAndroid, Platform } from "react-native";
import { analytics } from "../analytics";
import { PUSH_PROPERTY_ID, PUSH_CONFIGURED } from "../analytics/config";

/**
 * The native `PushModule` is provided by `react-native-xpush` (its index.js is a
 * thin re-export of `NativeModules.PushModule`). We read straight off
 * `NativeModules` so a bundle still builds where the module isn't linked.
 * `initialize` and `logoutAndDisconnect` are bridged `@ReactMethod`s; `initialize`
 * returns a Promise that resolves once the WebSocket + FCM registration settle.
 */
interface XpushModule {
  initialize(subscriberId: string, propertyId: string): Promise<unknown>;
  logoutAndDisconnect(): void;
}
const Xpush: XpushModule | undefined = (
  NativeModules as { PushModule?: XpushModule }
).PushModule;

/** The native module is only present in a dev/release build with the SDK linked. */
const NATIVE_AVAILABLE = Xpush != null && typeof Xpush.initialize === "function";

/** Push is live only when a Push SDK Key is configured AND the native module linked. */
export const PUSH_ENABLED = PUSH_CONFIGURED && NATIVE_AVAILABLE;

let initialized = false;

/** Ask for the Android 13+ runtime notification permission. Pre-13 grants implicitly. */
async function ensureNotificationPermission(): Promise<void> {
  if (Platform.OS !== "android" || Platform.Version < 33) return;
  try {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  } catch {
    // Permission flow failed — registration still proceeds; the OS just won't
    // display notifications until the user grants it from settings.
  }
}

/**
 * Register this install for push. Idempotent and never throws. Call once after
 * the app is interactive. A short delay is applied per the SDK guidance so the
 * native activity + FCM token have time to settle.
 */
export function initPush(delayMs = 1000): void {
  if (!PUSH_ENABLED || !Xpush || initialized) return;
  initialized = true;
  const sdk = Xpush;

  setTimeout(() => {
    void (async () => {
      try {
        await ensureNotificationPermission();
        // First arg is the subscriber identity (phone OR anonymous id); we pass
        // the anonymous install id since AskQuran registers without a phone.
        const subscriberId = await analytics.distinctId();
        await sdk.initialize(subscriberId, PUSH_PROPERTY_ID);
      } catch {
        // Native init failed (e.g. no current activity / Firebase) — allow a
        // later retry rather than latching the failed state.
        initialized = false;
      }
    })();
  }, delayMs);
}

/** Stop the socket, clear the session and unsubscribe this device. */
export function logoutPush(): void {
  if (!PUSH_ENABLED || !Xpush) return;
  try {
    Xpush.logoutAndDisconnect();
  } catch {
    /* ignore */
  }
}
