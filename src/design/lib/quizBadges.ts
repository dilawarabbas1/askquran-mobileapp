// Quiz progression: badges + improvement tracking, derived purely from the local
// history of quiz results (no backend, no religious content). Kept side-effect-free
// so it can be unit-tested and reused by the start screen and the result screen.

export interface QuizResult {
  ts: number;        // epoch ms when completed
  category: string;  // "all" | stories | events | mentioned | themes
  difficulty: string;// "all" | basic | intermediate | advanced | expert
  score: number;
  total: number;
}

export interface BadgeDef {
  id: string;
  icon: string;
  test: (s: Stats) => boolean;
}

interface Stats {
  count: number;
  categories: Set<string>;   // specific categories played (excludes "all")
  difficulties: Set<string>; // specific tiers played (excludes "all")
  maxPct: number;
  perfectCount: number;      // quizzes with a full score (total > 0)
  expertPass: boolean;       // an expert-tier quiz at >= 80%
}

const CATS = ["stories", "events", "mentioned", "themes"];
const TIERS = ["basic", "intermediate", "advanced", "expert"];

export function pctOf(r: QuizResult): number {
  return r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
}

function computeStats(results: QuizResult[]): Stats {
  const categories = new Set<string>();
  const difficulties = new Set<string>();
  let maxPct = 0;
  let perfectCount = 0;
  let expertPass = false;
  for (const r of results) {
    if (r.category !== "all") categories.add(r.category);
    if (r.difficulty !== "all") difficulties.add(r.difficulty);
    const p = pctOf(r);
    if (p > maxPct) maxPct = p;
    if (r.total > 0 && r.score === r.total) perfectCount += 1;
    if (r.difficulty === "expert" && p >= 80) expertPass = true;
  }
  return { count: results.length, categories, difficulties, maxPct, perfectCount, expertPass };
}

// Ordered easiest → most prestigious (for stable display).
export const BADGES: BadgeDef[] = [
  { id: "first_step", icon: "check", test: (s) => s.count >= 1 },
  { id: "sharp", icon: "target", test: (s) => s.maxPct >= 90 },
  { id: "perfect", icon: "star", test: (s) => s.perfectCount >= 1 },
  { id: "explorer", icon: "grid", test: (s) => CATS.every((c) => s.categories.has(c)) },
  { id: "all_tiers", icon: "layers", test: (s) => TIERS.every((d) => s.difficulties.has(d)) },
  { id: "persistent", icon: "flame", test: (s) => s.count >= 10 },
  { id: "expert_mind", icon: "award", test: (s) => s.expertPass },
];

export function earnedBadgeIds(results: QuizResult[]): string[] {
  const s = computeStats(results);
  return BADGES.filter((b) => b.test(s)).map((b) => b.id);
}

/** Highest percentage ever scored (0 if no history). */
export function bestPct(results: QuizResult[]): number {
  return computeStats(results).maxPct;
}

export interface QuizOutcome {
  pct: number;
  prevBest: number;      // best % BEFORE this result
  isPersonalBest: boolean;
  newBadges: string[];   // badge ids unlocked by this result
}

/** Fold a fresh result into prior history, reporting improvement + newly-earned
 *  badges. Pure: returns the outcome; the caller persists the appended result. */
export function evaluateResult(prior: QuizResult[], fresh: QuizResult): QuizOutcome {
  const prevBest = bestPct(prior);
  const pct = pctOf(fresh);
  const before = new Set(earnedBadgeIds(prior));
  const after = earnedBadgeIds([fresh, ...prior]);
  return {
    pct,
    prevBest,
    isPersonalBest: prior.length > 0 && pct > prevBest,
    newBadges: after.filter((id) => !before.has(id)),
  };
}
