// Daily Verse — LOCAL scheduled notifications (no push server, no remote token,
// no APNs entitlement). We pre-schedule a rolling window of one-per-day
// notifications, each carrying a different curated ayah fetched verbatim from the
// backend in the user's translation language. Re-synced on launch and on every
// foreground so the window keeps rolling and picks up a language change.

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { getVerses, translationIdForLanguage } from "@/api";
import { DAILY_VERSE_REFS } from "@/design/data/dailyVersePool";
import { planDailyVerseSchedule } from "./schedulePlan";

export interface DailyVerseSettings {
  enabled: boolean;
  hour: number;   // 0–23, local time
  minute: number; // 0–59
}

const CHANNEL_ID = "daily-verse";
const KIND = "dailyVerse";
// iOS caps *pending* local notifications at 64; keep a comfortable margin.
const HORIZON_DAYS = 30;

let handlerSet = false;
/** Foreground presentation: show a banner + list entry, silent, no badge. */
export function configureNotificationHandler(): void {
  if (handlerSet) return;
  handlerSet = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (current.canAskAgain === false) return false;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Daily Verse",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/** Cancel only the notifications WE scheduled (data.kind === "dailyVerse"), so we
 *  never touch anything another feature might schedule later. */
async function cancelOurs(): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => (n.content?.data as { kind?: string } | undefined)?.kind === KIND)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/** Reconcile scheduled Daily-Verse notifications with the current settings.
 *  Safe to call repeatedly; never throws (failures are swallowed so startup and
 *  foregrounding are never blocked). */
export async function syncDailyVerse(opts: DailyVerseSettings & { translationLanguage: string }): Promise<void> {
  try {
    configureNotificationHandler();

    if (!opts.enabled) {
      await cancelOurs();
      return;
    }

    if (!(await ensurePermission())) return; // user declined — leave nothing scheduled
    await ensureChannel();

    const translationId = await translationIdForLanguage(opts.translationLanguage);
    if (!translationId) return;
    const verses = await getVerses(DAILY_VERSE_REFS, translationId);
    if (!verses.length) return;

    await cancelOurs();

    const plan = planDailyVerseSchedule(Date.now(), opts.hour, opts.minute, verses.length, HORIZON_DAYS);
    for (const { fireAt, verseIndex } of plan) {
      const v = verses[verseIndex];
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${v.surahNameEn} · ${v.verseKey}`,
          body: v.translation,
          data: { kind: KIND, verseKey: v.verseKey },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(fireAt), channelId: CHANNEL_ID },
      });
    }
  } catch {
    /* scheduling is best-effort; never surface a crash for a missed notification */
  }
}
