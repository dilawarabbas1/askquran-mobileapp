// Reading-Plan daily reminder — a LOCAL repeating notification (no push server)
// that nudges the reader to complete today's portion. Scheduled while a plan is
// active and enabled; cancelled when the plan is abandoned or the reminder is
// switched off. Uses a native DAILY trigger so it repeats without a rolling window.

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { configureNotificationHandler } from "./dailyVerse";

export interface PlanReminderSettings {
  enabled: boolean;
  hour: number;   // 0–23, local
  minute: number; // 0–59
}

const CHANNEL_ID = "reading-plan";
const KIND = "planReminder";

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
    name: "Reading Plan",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/** Cancel only the reminders WE scheduled (data.kind === "planReminder"). */
async function cancelOurs(): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => (n.content?.data as { kind?: string } | undefined)?.kind === KIND)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/** Reconcile the reading-plan reminder with the current state. Scheduled only
 *  when a plan is active AND the reminder is enabled. Best-effort; never throws. */
export async function syncPlanReminder(
  opts: PlanReminderSettings & { hasPlan: boolean; title: string; body: string },
): Promise<void> {
  try {
    configureNotificationHandler();

    if (!opts.enabled || !opts.hasPlan) {
      await cancelOurs();
      return;
    }
    if (!(await ensurePermission())) return;
    await ensureChannel();

    await cancelOurs();
    await Notifications.scheduleNotificationAsync({
      content: { title: opts.title, body: opts.body, data: { kind: KIND } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: opts.hour,
        minute: opts.minute,
        channelId: CHANNEL_ID,
      },
    });
  } catch {
    /* best-effort scheduling */
  }
}
