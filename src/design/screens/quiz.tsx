// Test Your Knowledge — a source-grounded quiz. Questions come from the backend
// (/api/quiz), each tied to a verse reference; nothing is generated. Categories:
// Stories · Events · Laws · Mentioned in the Quran · Themes.

import React, { useEffect, useState } from "react";
import { ScrollView, View, Pressable, ActivityIndicator, Modal } from "react-native";
import { Text } from "../AppText";
import { useApp } from "../AQContext";
import { BlockTitle, FieldLabel, OrnDivider } from "../atoms";
import { Icon } from "../Icon";
import { FONTS, mix } from "../tokens";
import { getQuiz, getQuizSummary, type QuizQuestion } from "@/api";
import { BADGES, earnedBadgeIds, bestPct, quizStats, type QuizOutcome } from "../lib/quizBadges";

type Phase = "start" | "loading" | "playing" | "done";

const BADGE_ICON: Record<string, string> = Object.fromEntries(BADGES.map((b) => [b.id, b.icon]));

const CAT_LABEL: Record<string, string> = {
  all: "All",
  stories: "Stories",
  events: "Events",
  laws: "Laws",
  mentioned: "In the Quran?",
  themes: "Themes",
};

const DIFFS = ["all", "basic", "intermediate", "advanced", "expert"] as const;

const OK = "#1C7A68";
const NO = "#B3261E";

export function Quiz() {
  const app = useApp();
  const { tokens } = app;

  const [phase, setPhase] = useState<Phase>("start");
  const [cats, setCats] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, Record<string, number>>>({});
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [cat, setCat] = useState<string>("all");
  const [diff, setDiff] = useState<string>("all");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);

  useEffect(() => {
    let alive = true;
    getQuizSummary().then((s) => { if (alive) { setCats(s.categories); setCounts(s.counts); } }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const available = counts[cat]?.[diff] ?? null; // null until summary loads
  const quizCount = available === null ? 10 : Math.min(10, available);

  async function start() {
    setPhase("loading");
    setError("");
    try {
      const qs = await getQuiz(10, cat, diff, app.appLanguage);
      if (qs.length === 0) { setError("No questions available yet."); setPhase("start"); return; }
      setQuestions(qs);
      setIdx(0); setChosen(null); setScore(0);
      setPhase("playing");
    } catch {
      setError("Couldn't load the quiz. Please check your connection.");
      setPhase("start");
    }
  }

  function choose(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    if (i === questions[idx].answer) setScore((s) => s + 1);
  }

  function next() {
    if (idx < questions.length - 1) { setIdx((n) => n + 1); setChosen(null); }
    else {
      // Final answer already folded into `score` by choose(); record + capture
      // improvement/badges for the result screen.
      setOutcome(app.recordQuizResult(cat, diff, score, questions.length));
      setPhase("done");
    }
  }

  /* ---------- start ---------- */
  if (phase === "start" || phase === "loading") {
    const options = ["all", ...cats];
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center", marginBottom: 6 }}>
          <BlockTitle>{app.t("m.quiz.title")}</BlockTitle>
        </View>
        <Text style={{ fontSize: 13.5, lineHeight: 21, color: tokens.text2, textAlign: "center", marginTop: 4, paddingHorizontal: 8 }}>
          {app.t("m.quiz.lede")}
        </Text>
        <OrnDivider />

        {app.quizResults.length > 0 ? (() => {
          const st = quizStats(app.quizResults);
          const TIERS: Array<"basic" | "intermediate" | "advanced" | "expert"> = ["basic", "intermediate", "advanced", "expert"];
          return (
            <View style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, padding: 16, marginBottom: 4 }, tokens.cardShadow]}>
              <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[700], letterSpacing: 0.4, textTransform: "uppercase", color: tokens.text3 }}>{app.t("m.quiz.yourProgress")}</Text>
                <Text style={{ fontSize: 12.5, color: tokens.text2 }}>{app.t("m.quiz.quizzesTaken", { n: st.count })}</Text>
              </View>

              {/* best / average + a mini trend of recent scores */}
              <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 10 }}>
                <View style={{ marginRight: 22 }}>
                  <Text style={{ fontFamily: FONTS.serif[600], fontSize: 26, color: tokens.brand }}>{st.bestPct}%</Text>
                  <Text style={{ fontSize: 11.5, color: tokens.text3 }}>{app.t("m.quiz.personalBest")}</Text>
                </View>
                <View style={{ marginRight: 22 }}>
                  <Text style={{ fontFamily: FONTS.serif[600], fontSize: 26, color: tokens.text }}>{st.avgPct}%</Text>
                  <Text style={{ fontSize: 11.5, color: tokens.text3 }}>{app.t("m.quiz.average")}</Text>
                </View>
                {st.recent.length >= 2 ? (
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3, height: 34 }}>
                      {st.recent.map((p, i) => (
                        <View key={i} style={{ width: 7, height: Math.max(4, Math.round((p / 100) * 34)), borderRadius: 2, backgroundColor: i === st.recent.length - 1 ? tokens.brand : mix(tokens.brand, 35, tokens.surface) }} />
                      ))}
                    </View>
                    <Text style={{ fontSize: 10.5, color: tokens.text3, marginTop: 4 }}>{app.t("m.quiz.recentTrend")}</Text>
                  </View>
                ) : null}
              </View>

              {/* best per difficulty tier */}
              <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                {TIERS.map((t) => (
                  <View key={t} style={{ flex: 1, alignItems: "center", backgroundColor: mix(tokens.brand, 6, tokens.surface), borderRadius: 10, paddingVertical: 8 }}>
                    <Text style={{ fontSize: 13, fontFamily: FONTS.sans[700], color: st.perTierBest[t] === null ? tokens.text3 : tokens.text }}>{st.perTierBest[t] === null ? "—" : `${st.perTierBest[t]}%`}</Text>
                    <Text style={{ fontSize: 9.5, color: tokens.text3, marginTop: 2 }}>{app.t(`m.quiz.tierShort.${t}`)}</Text>
                  </View>
                ))}
              </View>

              {/* badges summary + gallery entry */}
              <Pressable onPress={() => setGalleryOpen(true)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: tokens.lineSoft }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ flexDirection: "row" }}>
                    {BADGES.filter((b) => earnedBadgeIds(app.quizResults).includes(b.id)).slice(0, 4).map((b, i) => (
                      <View key={b.id} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: mix(tokens.gold, 16, tokens.surface), borderWidth: 1.5, borderColor: tokens.surface, alignItems: "center", justifyContent: "center", marginLeft: i === 0 ? 0 : -7 }}>
                        <Icon name={b.icon} size={13} w={2} color={tokens.goldDeep} />
                      </View>
                    ))}
                  </View>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.sans[600], color: tokens.text2 }}>{app.t("m.quiz.badgesEarned", { earned: st.earned, total: st.totalBadges })}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.sans[600], color: tokens.brand }}>{app.t("m.quiz.viewAll")}</Text>
                  <Icon name="chevR" size={15} w={2.1} color={tokens.brand} />
                </View>
              </Pressable>
            </View>
          );
        })() : null}

        <FieldLabel>{app.t("m.quiz.category")}</FieldLabel>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 9 }}>
          {options.map((c) => {
            const on = cat === c;
            return (
              <Pressable key={c} onPress={() => setCat(c)} style={[{ borderWidth: 1, borderColor: on ? tokens.brand : tokens.line, backgroundColor: on ? tokens.brand : tokens.surface, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 15 }, on ? null : tokens.cardShadow]}>
                <Text style={{ fontSize: 13.5, fontFamily: FONTS.sans[600], color: on ? tokens.onBrand : tokens.text }}>{CAT_LABEL[c] ?? c}</Text>
              </Pressable>
            );
          })}
        </View>

        <FieldLabel>{app.t("m.quiz.difficulty")}</FieldLabel>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 9 }}>
          {DIFFS.map((d) => {
            const on = diff === d;
            return (
              <Pressable key={d} onPress={() => setDiff(d)} style={[{ borderWidth: 1, borderColor: on ? tokens.brand : tokens.line, backgroundColor: on ? tokens.brand : tokens.surface, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 15 }, on ? null : tokens.cardShadow]}>
                <Text style={{ fontSize: 13.5, fontFamily: FONTS.sans[600], color: on ? tokens.onBrand : tokens.text }}>{app.t(`m.quiz.tier.${d}`)}</Text>
              </Pressable>
            );
          })}
        </View>

        {error ? <Text style={{ color: NO, fontSize: 13, marginTop: 16 }}>{error}</Text> : null}
        {available === 0 ? <Text style={{ color: tokens.text2, fontSize: 13, marginTop: 16, textAlign: "center" }}>{app.t("m.quiz.noneInCombo")}</Text> : null}

        <Pressable onPress={start} disabled={phase === "loading" || available === 0} style={[{ marginTop: available === 0 ? 12 : 26, backgroundColor: available === 0 ? tokens.line : tokens.brand, borderRadius: 14, paddingVertical: 15, alignItems: "center" }, available === 0 ? null : tokens.cardShadow]}>
          {phase === "loading"
            ? <ActivityIndicator color={tokens.onBrand} />
            : <Text style={{ fontSize: 16, fontFamily: FONTS.sans[700], color: available === 0 ? tokens.text3 : tokens.onBrand }}>{available === 0 ? app.t("m.quiz.start") : app.t("m.quiz.startCount", { n: quizCount })}</Text>}
        </Pressable>

        {/* Badge gallery — earned + locked, so there's always something to chase. */}
        <Modal visible={galleryOpen} animationType="slide" transparent onRequestClose={() => setGalleryOpen(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: tokens.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 34, maxHeight: "82%" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <BlockTitle>{app.t("m.quiz.badgesTitle")}</BlockTitle>
                <Pressable onPress={() => setGalleryOpen(false)} style={{ width: 34, height: 34, borderRadius: 11, borderWidth: 1, borderColor: tokens.line, backgroundColor: tokens.surface2, alignItems: "center", justifyContent: "center" }}>
                  <Icon name="close" size={17} w={2.1} color={tokens.text2} />
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 6 }}>
                {(() => {
                  const earned = new Set(earnedBadgeIds(app.quizResults));
                  return BADGES.map((b) => {
                    const got = earned.has(b.id);
                    return (
                      <View key={b.id} style={{ flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: tokens.surface, borderWidth: 1, borderColor: got ? mix(tokens.gold, 34, tokens.line) : tokens.lineSoft, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, opacity: got ? 1 : 0.6 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: got ? mix(tokens.gold, 16, tokens.surface) : tokens.surface2 }}>
                          <Icon name={got ? b.icon : "lock"} size={19} w={1.9} color={got ? tokens.goldDeep : tokens.text3} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: FONTS.serif[600], fontSize: 15, color: got ? tokens.text : tokens.text2 }}>{app.t(`m.quiz.badge.${b.id}`)}</Text>
                          <Text style={{ fontSize: 12, color: tokens.text3, marginTop: 1 }}>{app.t(`m.quiz.badgeDesc.${b.id}`)}</Text>
                        </View>
                        {got ? <Icon name="check" size={17} w={2.2} color={tokens.goldDeep} /> : null}
                      </View>
                    );
                  });
                })()}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }

  /* ---------- done ---------- */
  if (phase === "done") {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 40, alignItems: "center" }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontFamily: FONTS.ar, fontSize: 20, color: tokens.orn, marginBottom: 14 }}>﷽</Text>
        <Text style={{ fontSize: 44, fontFamily: FONTS.serif[600], color: tokens.brand }}>{score}<Text style={{ fontSize: 22, color: tokens.text3 }}>/{questions.length}</Text></Text>
        <BlockTitle style={{ marginTop: 8 }}>{app.t(pct >= 70 ? "m.quiz.great" : "m.quiz.keepGoing")}</BlockTitle>

        {/* Improvement — new personal best, or how this compares to your best. */}
        {outcome?.isPersonalBest ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginTop: 12, backgroundColor: mix(tokens.gold, 14, tokens.surface), borderWidth: 1, borderColor: mix(tokens.gold, 30, tokens.line), borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14 }}>
            <Icon name="flame" size={15} w={1.9} color={tokens.goldDeep} />
            <Text style={{ fontSize: 13, fontFamily: FONTS.sans[700], color: tokens.goldDeep }}>{app.t("m.quiz.newBest", { prev: outcome.prevBest })}</Text>
          </View>
        ) : (
          <Text style={{ fontSize: 13, color: tokens.text2, marginTop: 10 }}>{app.t("m.quiz.bestSoFar", { pct: bestPct(app.quizResults) })}</Text>
        )}

        {/* Newly-earned badges from this attempt. */}
        {outcome && outcome.newBadges.length > 0 ? (
          <View style={{ alignSelf: "stretch", marginTop: 16, gap: 10 }}>
            <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[700], letterSpacing: 0.4, textTransform: "uppercase", color: tokens.text3, textAlign: "center" }}>{app.t("m.quiz.newBadges")}</Text>
            {outcome.newBadges.map((id) => (
              <View key={id} style={[{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: mix(tokens.gold, 34, tokens.line), borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14 }, tokens.cardShadow]}>
                <View style={{ width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.gold, 16, tokens.surface) }}>
                  <Icon name={BADGE_ICON[id] ?? "star"} size={19} w={1.9} color={tokens.goldDeep} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.serif[600], fontSize: 15, color: tokens.text }}>{app.t(`m.quiz.badge.${id}`)}</Text>
                  <Text style={{ fontSize: 12, color: tokens.text2, marginTop: 1 }}>{app.t(`m.quiz.badgeDesc.${id}`)}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <OrnDivider />
        <Pressable onPress={start} style={[{ marginTop: 8, backgroundColor: tokens.brand, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, alignItems: "center" }, tokens.cardShadow]}>
          <Text style={{ fontSize: 15, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>{app.t("m.quiz.again")}</Text>
        </Pressable>
        <Pressable onPress={() => setPhase("start")} style={{ marginTop: 14, paddingVertical: 10 }}>
          <Text style={{ fontSize: 14, fontFamily: FONTS.sans[600], color: tokens.text2 }}>{app.t("m.quiz.categories")}</Text>
        </Pressable>
      </ScrollView>
    );
  }

  /* ---------- playing ---------- */
  const q = questions[idx];
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <FieldLabel>{app.t("m.quiz.progress", { n: idx + 1, total: questions.length })}</FieldLabel>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: tokens.lineSoft, marginBottom: 18 }}>
        <View style={{ height: 4, borderRadius: 2, width: `${((idx + 1) / questions.length) * 100}%`, backgroundColor: tokens.brand }} />
      </View>

      <Text style={{ fontSize: 19, lineHeight: 27, fontFamily: FONTS.serif[500], color: tokens.text, marginBottom: 18 }}>{q.q}</Text>

      <View style={{ gap: 11 }}>
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answer;
          const isChosen = chosen === i;
          let bg = tokens.surface; let border = tokens.line; let fg = tokens.text;
          if (chosen !== null) {
            if (isCorrect) { bg = mix(OK, 12, tokens.surface); border = OK; fg = OK; }
            else if (isChosen) { bg = mix(NO, 12, tokens.surface); border = NO; fg = NO; }
          }
          return (
            <Pressable key={i} onPress={() => choose(i)} style={[{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: bg, borderWidth: 1.5, borderColor: border, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16 }, chosen === null ? tokens.cardShadow : null]}>
              <Text style={{ flex: 1, fontSize: 15, fontFamily: FONTS.sans[600], color: fg }}>{opt}</Text>
              {chosen !== null && isCorrect ? <Text style={{ fontSize: 16, color: OK }}>✓</Text> : null}
              {chosen !== null && isChosen && !isCorrect ? <Text style={{ fontSize: 16, color: NO }}>✕</Text> : null}
            </Pressable>
          );
        })}
      </View>

      {chosen !== null ? (
        <View style={{ marginTop: 18 }}>
          {/* Learning moment — right or wrong, explain from the verse. */}
          {(() => {
            const correct = chosen === q.answer;
            const accent = correct ? OK : NO;
            return (
              <View style={{ backgroundColor: mix(accent, 8, tokens.surface), borderWidth: 1, borderColor: mix(accent, 30, tokens.line), borderRadius: 14, padding: 14 }}>
                <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[700], color: accent, marginBottom: 6 }}>
                  {correct ? app.t("m.quiz.correct") : app.t("m.quiz.incorrect")}
                </Text>
                {q.explanation ? (
                  <Text style={{ fontSize: 14, lineHeight: 21, color: tokens.text }}>{q.explanation}</Text>
                ) : null}
                <Text style={{ fontSize: 12, fontFamily: FONTS.sans[600], color: tokens.text3, marginTop: 8 }}>{app.t("m.quiz.reference", { ref: q.ref })}</Text>
              </View>
            );
          })()}
          <Pressable onPress={next} style={[{ marginTop: 16, backgroundColor: tokens.brand, borderRadius: 14, paddingVertical: 15, alignItems: "center" }, tokens.cardShadow]}>
            <Text style={{ fontSize: 16, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>
              {idx < questions.length - 1 ? app.t("m.quiz.next") : app.t("m.quiz.finish")}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}
