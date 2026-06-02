// Splash, Onboarding carousel, and the shared 44-language picker (LangList) +
// full-screen language sheet, ported from aq-ui.jsx. Reflects the final design:
// bismillah sits above the logo on splash; English is pinned first/selected.

import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useApp } from "../AQContext";
import { Mark, Wordmark } from "../atoms";
import { Icon, RawIcon } from "../Icon";
import { SearchBar } from "../SearchBar";
import { LANGUAGES } from "../data";
import { FONTS, mix } from "../tokens";

/* ---------- SPLASH ---------- */
export function Splash() {
  const { tokens } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ position: "absolute", top: 64, fontFamily: FONTS.ar, fontSize: 18, color: tokens.orn }}>
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </Text>
      <Mark size={84} />
      <Text style={{ marginTop: 20, fontSize: 40, color: tokens.brand, letterSpacing: -1.2 }}>
        <Text style={{ fontFamily: FONTS.sans[500] }}>Ask </Text>
        <Text style={{ fontFamily: FONTS.sans[800] }}>Quran</Text>
      </Text>
      <Text style={{ fontFamily: FONTS.serif.italic, fontStyle: "italic", fontSize: 14, color: tokens.brand2, marginTop: 10 }}>
        Search the Quran. Read only referenced sources.
      </Text>
    </View>
  );
}

/* ---------- ONBOARDING ---------- */
const ONB = [
  {
    art: '<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>',
    title: "Ask a question, get the source",
    body: "Type any topic, theme, or question. AskQuran returns the relevant ayahs — Arabic, translation, and tafsir — quoted directly from indexed sources.",
    lang: false,
  },
  {
    art: '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>',
    title: "Nothing is generated",
    body: "Every answer is referenced and unaltered. No AI-written religious text, no opinions — only the Quran, authentic translations, and attributed tafsir.",
    lang: false,
  },
  { art: null, lang: true, title: "Choose your language for Translation and Tafsir", body: "Pick the language you’re most comfortable reading in. You can change it anytime in Settings." },
];

export function Onboarding() {
  const app = useApp();
  const { tokens } = app;
  const [step, setStep] = useState(0);
  const [q, setQ] = useState("");
  const last = step === ONB.length - 1;
  const slide = ONB[step];
  const next = () => (last ? app.finishOnboarding() : setStep(step + 1));

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg }}>
      {/* top bar */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 22, paddingTop: 18, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <Mark size={24} />
          <Wordmark size={17} />
        </View>
        <Pressable onPress={app.finishOnboarding}>
          <Text style={{ fontSize: 13, fontFamily: FONTS.sans[600], color: tokens.text2 }}>Skip</Text>
        </Pressable>
      </View>

      {/* body */}
      {slide.lang ? (
        <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 6 }}>
          <Text style={{ fontFamily: FONTS.serif[600], fontSize: 22, lineHeight: 26.4, color: tokens.text, marginTop: 6 }}>{slide.title}</Text>
          <Text style={{ fontSize: 13, lineHeight: 19.5, color: tokens.text2, marginTop: 8 }}>{slide.body}</Text>
          <LangList selected={app.language} onSelect={app.setLanguage} q={q} setQ={setQ} />
        </View>
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 }}>
          <View style={{ width: 184, height: 184, borderRadius: 34, alignItems: "center", justifyContent: "center", marginBottom: 30, overflow: "hidden", backgroundColor: mix(tokens.brand, 9, tokens.surface), borderWidth: 1, borderColor: tokens.line }}>
            <RawIcon inner={slide.art as string} size={78} w={1.5} color={tokens.brand} />
          </View>
          <Text style={{ fontFamily: FONTS.serif[600], fontSize: 25, color: tokens.text, textAlign: "center" }}>{slide.title}</Text>
          <Text style={{ fontSize: 14.5, lineHeight: 24, color: tokens.text2, marginTop: 12, maxWidth: 280, textAlign: "center" }}>{slide.body}</Text>
        </View>
      )}

      {/* footer */}
      <View style={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 24, gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 7, justifyContent: "center", marginBottom: 2 }}>
          {ONB.map((_, i) => (
            <View key={i} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: i === step ? tokens.brand : tokens.line }} />
          ))}
        </View>
        <Pressable onPress={next} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, backgroundColor: tokens.brand, borderRadius: 14, paddingVertical: 15 }}>
          <Text style={{ fontSize: 15.5, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>{last ? "Enter AskQuran" : "Continue"}</Text>
          <Icon name="chevR" size={17} w={2.4} color={tokens.onBrand} />
        </Pressable>
        {step > 0 ? (
          <Pressable onPress={() => setStep(step - 1)} style={{ alignItems: "center", paddingVertical: 4 }}>
            <Text style={{ fontSize: 14, fontFamily: FONTS.sans[600], color: tokens.text2 }}>Back</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/* ---------- shared 44-language list ---------- */
export function LangList({ selected, onSelect, q, setQ }: { selected: string; onSelect: (n: string) => void; q: string; setQ: (s: string) => void }) {
  const { tokens } = useApp();
  const t = (q || "").trim().toLowerCase();
  const list = LANGUAGES.filter((l) => !t || l.name.toLowerCase().includes(t) || l.native.toLowerCase().includes(t) || l.code.includes(t));
  const ordered = [...list].sort((a, b) => (a.name === "English" ? -1 : b.name === "English" ? 1 : 0));

  return (
    <View style={{ flex: 1, marginTop: 0 }}>
      <View style={{ marginVertical: 12 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder="Search 44 languages…" small />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8, gap: 8 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {ordered.map((l) => {
          const on = selected === l.name;
          return (
            <Pressable key={l.code} onPress={() => onSelect(l.name)} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 11, borderWidth: 1, borderColor: on ? tokens.brand : tokens.line, backgroundColor: on ? mix(tokens.brand, 7, tokens.surface) : tokens.surface }}>
              <Text numberOfLines={1} style={{ flex: 1, textAlign: "left", fontSize: 14, fontFamily: FONTS.sans[700], color: tokens.text }}>{l.name}</Text>
              <Text numberOfLines={1} style={{ maxWidth: "52%", textAlign: "right", fontSize: 13.5, fontFamily: FONTS.sans[500], color: on ? tokens.brand2 : tokens.text2 }}>{l.native}</Text>
              <View style={{ width: 16, height: 16, alignItems: "center", justifyContent: "center", opacity: on ? 1 : 0 }}>
                <Icon name="check" size={16} w={2.6} color={tokens.brand} />
              </View>
            </Pressable>
          );
        })}
        {list.length === 0 ? (
          <Text style={{ textAlign: "center", color: tokens.text3, fontSize: 13, padding: 24 }}>No language matches “{q}”.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

/* ---------- full-screen language sheet ---------- */
export function LangSheet() {
  const app = useApp();
  const { tokens } = app;
  const [q, setQ] = useState("");
  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: tokens.lineSoft }}>
        <Pressable onPress={app.closeLangSheet} style={{ width: 36, height: 36, borderRadius: 11, borderWidth: 1, borderColor: tokens.line, backgroundColor: tokens.surface2, alignItems: "center", justifyContent: "center" }}>
          <Icon name="back" size={18} w={2.1} color={tokens.text2} />
        </Pressable>
        <View>
          <Text style={{ fontFamily: FONTS.serif[500], fontSize: 19, color: tokens.text }}>Language</Text>
          <Text style={{ fontSize: 11.5, color: tokens.text2, marginTop: 1 }}>For translation & tafsir</Text>
        </View>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 4 }}>
        <LangList selected={app.language} onSelect={(n) => { app.setLanguage(n); app.closeLangSheet(); }} q={q} setQ={setQ} />
      </View>
    </View>
  );
}
