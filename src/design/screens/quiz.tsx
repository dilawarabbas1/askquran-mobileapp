// Test Your Knowledge — a source-grounded quiz. Questions come from the backend
// (/api/quiz), each tied to a verse reference; nothing is generated. Categories:
// Stories · Events · Laws · Mentioned in the Quran · Themes.

import React, { useEffect, useState } from "react";
import { ScrollView, View, Pressable, ActivityIndicator } from "react-native";
import { Text } from "../AppText";
import { useApp } from "../AQContext";
import { BlockTitle, FieldLabel, OrnDivider } from "../atoms";
import { FONTS, mix } from "../tokens";
import { getQuiz, getQuizCategories, type QuizQuestion } from "@/api";

type Phase = "start" | "loading" | "playing" | "done";

const CAT_LABEL: Record<string, string> = {
  all: "All",
  stories: "Stories",
  events: "Events",
  laws: "Laws",
  mentioned: "In the Quran?",
  themes: "Themes",
};

const OK = "#1C7A68";
const NO = "#B3261E";

export function Quiz() {
  const app = useApp();
  const { tokens } = app;

  const [phase, setPhase] = useState<Phase>("start");
  const [cats, setCats] = useState<string[]>([]);
  const [cat, setCat] = useState<string>("all");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    getQuizCategories().then((c) => { if (alive) setCats(c); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  async function start() {
    setPhase("loading");
    setError("");
    try {
      const qs = await getQuiz(10, cat);
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
    else setPhase("done");
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

        {error ? <Text style={{ color: NO, fontSize: 13, marginTop: 16 }}>{error}</Text> : null}

        <Pressable onPress={start} disabled={phase === "loading"} style={[{ marginTop: 26, backgroundColor: tokens.brand, borderRadius: 14, paddingVertical: 15, alignItems: "center" }, tokens.cardShadow]}>
          {phase === "loading"
            ? <ActivityIndicator color={tokens.onBrand} />
            : <Text style={{ fontSize: 16, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>{app.t("m.quiz.start")}</Text>}
        </Pressable>
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
          <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[600], color: tokens.text3 }}>{app.t("m.quiz.reference", { ref: q.ref })}</Text>
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
