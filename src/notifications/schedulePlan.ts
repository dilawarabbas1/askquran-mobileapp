// Pure scheduling math for the Daily Verse, split out from the expo-notifications
// side-effects so it can be unit-tested deterministically (no native module, no
// clock). Given "now" and a preferred time, it produces one entry per day for the
// horizon, each pointing at a verse index that rotates through the pool.

export interface PlannedNotification {
  /** Epoch ms when this notification should fire (local time). */
  fireAt: number;
  /** Index into the verse pool for this day (rotates, wrapping at pool length). */
  verseIndex: number;
}

/**
 * Build the rolling daily schedule.
 * - First fire is today at hh:mm, unless that moment has already passed → tomorrow.
 * - Then one per consecutive calendar day for `horizonDays` total.
 * - `verseIndex` walks the pool in order and wraps (i % verseCount).
 * Returns [] for a non-positive pool or horizon.
 */
export function planDailyVerseSchedule(
  nowMs: number,
  hour: number,
  minute: number,
  verseCount: number,
  horizonDays: number,
): PlannedNotification[] {
  if (verseCount <= 0 || horizonDays <= 0) return [];
  const first = new Date(nowMs);
  first.setHours(hour, minute, 0, 0);
  if (first.getTime() <= nowMs) first.setDate(first.getDate() + 1);

  const out: PlannedNotification[] = [];
  for (let i = 0; i < horizonDays; i++) {
    const d = new Date(first);
    d.setDate(first.getDate() + i); // preserves the hh:mm across DST via local setDate
    out.push({ fireAt: d.getTime(), verseIndex: i % verseCount });
  }
  return out;
}
