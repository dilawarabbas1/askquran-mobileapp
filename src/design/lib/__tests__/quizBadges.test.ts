import { test } from "node:test";
import assert from "node:assert/strict";
import { earnedBadgeIds, bestPct, evaluateResult, pctOf, type QuizResult } from "../quizBadges";

const r = (o: Partial<QuizResult>): QuizResult => ({ ts: 0, category: "all", difficulty: "all", score: 5, total: 10, ...o });

test("pctOf handles zero-total safely", () => {
  assert.equal(pctOf(r({ score: 0, total: 0 })), 0);
  assert.equal(pctOf(r({ score: 7, total: 10 })), 70);
});

test("first_step unlocks on the first quiz", () => {
  assert.deepEqual(earnedBadgeIds([]), []);
  assert.ok(earnedBadgeIds([r({})]).includes("first_step"));
});

test("sharp needs >=90%, perfect needs a full score", () => {
  assert.ok(!earnedBadgeIds([r({ score: 8, total: 10 })]).includes("sharp"));
  assert.ok(earnedBadgeIds([r({ score: 9, total: 10 })]).includes("sharp"));
  assert.ok(earnedBadgeIds([r({ score: 10, total: 10 })]).includes("perfect"));
});

test("explorer needs all four specific categories (not 'all')", () => {
  const allCat = ["stories", "events", "mentioned", "themes"].map((c) => r({ category: c }));
  assert.ok(earnedBadgeIds(allCat).includes("explorer"));
  assert.ok(!earnedBadgeIds([r({ category: "all" }), r({ category: "stories" })]).includes("explorer"));
});

test("all_tiers needs each difficulty; expert_mind needs an expert quiz >=80%", () => {
  const allTiers = ["basic", "intermediate", "advanced", "expert"].map((d) => r({ difficulty: d, score: 9, total: 10 }));
  assert.ok(earnedBadgeIds(allTiers).includes("all_tiers"));
  assert.ok(earnedBadgeIds([r({ difficulty: "expert", score: 8, total: 10 })]).includes("expert_mind"));
  assert.ok(!earnedBadgeIds([r({ difficulty: "expert", score: 7, total: 10 })]).includes("expert_mind"));
});

test("persistent unlocks at 10 quizzes", () => {
  const nine = Array.from({ length: 9 }, () => r({}));
  assert.ok(!earnedBadgeIds(nine).includes("persistent"));
  assert.ok(earnedBadgeIds([...nine, r({})]).includes("persistent"));
});

test("bestPct is the max across history", () => {
  assert.equal(bestPct([r({ score: 4, total: 10 }), r({ score: 8, total: 10 }), r({ score: 6, total: 10 })]), 80);
});

test("evaluateResult reports personal best + newly earned badges", () => {
  const prior = [r({ score: 6, total: 10 })];
  const out = evaluateResult(prior, r({ score: 10, total: 10 }));
  assert.equal(out.pct, 100);
  assert.equal(out.prevBest, 60);
  assert.ok(out.isPersonalBest);
  assert.ok(out.newBadges.includes("perfect"));
  assert.ok(out.newBadges.includes("sharp"));
});

test("evaluateResult: first-ever quiz is not flagged a personal best", () => {
  const out = evaluateResult([], r({ score: 10, total: 10 }));
  assert.equal(out.isPersonalBest, false);
  assert.ok(out.newBadges.includes("first_step"));
});
