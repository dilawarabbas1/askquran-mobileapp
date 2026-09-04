import { test } from "node:test";
import assert from "node:assert/strict";
import { planDailyVerseSchedule } from "../schedulePlan";

const DAY = 86400000;
// A fixed reference instant: 2026-03-10 at 09:00 local time.
const NOON_REF = new Date(2026, 2, 10, 9, 0, 0, 0).getTime();

test("schedules exactly `horizon` entries", () => {
  const plan = planDailyVerseSchedule(NOON_REF, 7, 0, 30, 30);
  assert.equal(plan.length, 30);
});

test("first fire is TOMORROW when the time has already passed today", () => {
  // now = 09:00, preferred time 07:00 → already passed → first fire tomorrow 07:00
  const plan = planDailyVerseSchedule(NOON_REF, 7, 0, 30, 30);
  const first = new Date(plan[0].fireAt);
  assert.equal(first.getHours(), 7);
  assert.equal(first.getMinutes(), 0);
  assert.equal(first.getDate(), 11); // day after the 10th
});

test("first fire is TODAY when the time is still upcoming", () => {
  // now = 09:00, preferred time 20:00 → still upcoming → first fire today 20:00
  const plan = planDailyVerseSchedule(NOON_REF, 20, 0, 30, 30);
  const first = new Date(plan[0].fireAt);
  assert.equal(first.getDate(), 10);
  assert.equal(first.getHours(), 20);
});

test("fires are consecutive calendar days, ~24h apart", () => {
  const plan = planDailyVerseSchedule(NOON_REF, 7, 0, 30, 5);
  for (let i = 1; i < plan.length; i++) {
    assert.equal(plan[i].fireAt - plan[i - 1].fireAt, DAY);
  }
});

test("verse index rotates in order and wraps at pool length", () => {
  const plan = planDailyVerseSchedule(NOON_REF, 7, 0, 3, 7);
  assert.deepEqual(plan.map((p) => p.verseIndex), [0, 1, 2, 0, 1, 2, 0]);
});

test("empty pool or non-positive horizon yields no notifications", () => {
  assert.equal(planDailyVerseSchedule(NOON_REF, 7, 0, 0, 30).length, 0);
  assert.equal(planDailyVerseSchedule(NOON_REF, 7, 0, 30, 0).length, 0);
});
