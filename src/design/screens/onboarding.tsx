// Splash, Onboarding carousel, and the shared language picker (LangList) +
// full-screen language sheet. Onboarding now sets three independent languages —
// App (interface), Translation, and Tafsir — all saved to preferences; the
// sheet edits whichever target was opened. Quran/translation/tafsir text stays
// verbatim; the App language only affects the interface.

import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "../AppText";
import { useApp } from "../AQContext";
import { Mark, Wordmark } from "../atoms";
import { Icon, RawIcon } from "../Icon";
import { SearchBar } from "../SearchBar";
import { LANGUAGES } from "../data";
import { FONTS, mix, type Tokens } from "../tokens";
import { getTafsirLanguages } from "@/api";

/* ---------- SPLASH ---------- */
export function Splash() {
  const { tokens, t } = useApp();
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
        {t("m.splash.tagline")}
      </Text>
    </View>
  );
}

/* ---------- ONBOARDING ---------- */
const ONB = [
  { art: '<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>', titleKey: "m.onb.s1t", bodyKey: "m.onb.s1b", lang: false },
  { art: '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>', titleKey: "m.onb.s2t", bodyKey: "m.onb.s2b", lang: false },
  { art: null, lang: true, titleKey: "m.onb.s3t", bodyKey: "m.onb.s3b" },
];

type Target = "app" | "translation" | "tafsir";

/* A selector row showing the current value for one language target. */
function LangRow({ label, value, onPress, tokens }: { label: string; value: string; onPress: () => void; tokens: Tokens }) {
  return (
    <Pressable onPress={onPress} style={[{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 14 }, tokens.cardShadow]}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[700], letterSpacing: 0.6, textTransform: "uppercase", color: tokens.text3 }}>{label}</Text>
        <Text style={{ fontSize: 15, fontFamily: FONTS.sans[600], color: tokens.text, marginTop: 3 }}>{value}</Text>
      </View>
      <Icon name="chevR" size={17} color={tokens.text3} />
    </Pressable>
  );
}

export function Onboarding() {
  const app = useApp();
  const { tokens } = app;
  const [step, setStep] = useState(0);
  const [q, setQ] = useState("");
  const [picking, setPicking] = useState<Target | null>(null);
  const [tafLangs, setTafLangs] = useState<string[] | null>(null);
  const last = step === ONB.length - 1;
  const slide = ONB[step];
  const next = () => (last ? app.finishOnboarding() : setStep(step + 1));

  useEffect(() => { getTafsirLanguages().then(setTafLangs).catch(() => {}); }, []);

  const valueFor = (t: Target) => (t === "app" ? app.appLanguage : t === "tafsir" ? app.tafsirLanguage : app.translationLanguage);
  const selectFor = (t: Target, n: string) => {
    if (t === "app") app.setAppLanguage(n);
    else if (t === "tafsir") app.setTafsirLanguage(n);
    else app.setTranslationLanguage(n);
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg }}>
      {/* top bar */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 22, paddingTop: 18, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <Mark size={24} />
          <Wordmark size={17} />
        </View>
        <Pressable onPress={app.finishOnboarding}>
          <Text style={{ fontSize: 13, fontFamily: FONTS.sans[600], color: tokens.text2 }}>{app.t("m.onb.skip")}</Text>
        </Pressable>
      </View>

      {/* body */}
      {slide.lang ? (
        <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 6 }}>
          {picking ? (
            <>
              <Pressable onPress={() => { setPicking(null); setQ(""); }} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 }}>
                <Icon name="back" size={18} w={2.1} color={tokens.text2} />
                <Text style={{ fontSize: 14, fontFamily: FONTS.sans[600], color: tokens.text2 }}>
                  {app.t(picking === "app" ? "m.set.appLang" : picking === "tafsir" ? "m.set.tafLang" : "m.set.transLang")}
                </Text>
              </Pressable>
              <LangList
                selected={valueFor(picking)}
                onSelect={(n) => { selectFor(picking, n); setPicking(null); setQ(""); }}
                q={q}
                setQ={setQ}
                filterLangs={picking === "tafsir" ? tafLangs ?? undefined : undefined}
              />
            </>
          ) : (
            <>
              <Text style={{ fontFamily: FONTS.serif[600], fontSize: 22, lineHeight: 26.4, color: tokens.text, marginTop: 6 }}>{app.t(slide.titleKey)}</Text>
              <Text style={{ fontSize: 13, lineHeight: 19.5, color: tokens.text2, marginTop: 8 }}>{app.t(slide.bodyKey)}</Text>
              <View style={{ gap: 11, marginTop: 18 }}>
                <LangRow label={app.t("m.set.appLang")} value={app.appLanguage} onPress={() => setPicking("app")} tokens={tokens} />
                <LangRow label={app.t("m.set.transLang")} value={app.translationLanguage} onPress={() => setPicking("translation")} tokens={tokens} />
                <LangRow label={app.t("m.set.tafLang")} value={app.tafsirLanguage} onPress={() => setPicking("tafsir")} tokens={tokens} />
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 }}>
          <View style={{ width: 184, height: 184, borderRadius: 34, alignItems: "center", justifyContent: "center", marginBottom: 30, overflow: "hidden", backgroundColor: mix(tokens.brand, 9, tokens.surface), borderWidth: 1, borderColor: tokens.line }}>
            <RawIcon inner={slide.art as string} size={78} w={1.5} color={tokens.brand} />
          </View>
          <Text style={{ fontFamily: FONTS.serif[600], fontSize: 25, color: tokens.text, textAlign: "center" }}>{app.t(slide.titleKey)}</Text>
          <Text style={{ fontSize: 14.5, lineHeight: 24, color: tokens.text2, marginTop: 12, maxWidth: 280, textAlign: "center" }}>{app.t(slide.bodyKey)}</Text>
        </View>
      )}

      {/* footer (hidden while actively picking a language so the list gets full height) */}
      {picking ? null : (
        <View style={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 24, gap: 12 }}>
          <View style={{ flexDirection: "row", gap: 7, justifyContent: "center", marginBottom: 2 }}>
            {ONB.map((_, i) => (
              <View key={i} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: i === step ? tokens.brand : tokens.line }} />
            ))}
          </View>
          <Pressable onPress={next} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, backgroundColor: tokens.brand, borderRadius: 14, paddingVertical: 15 }}>
            <Text style={{ fontSize: 15.5, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>{app.t(last ? "m.onb.enter" : "m.onb.continue")}</Text>
            <Icon name="chevR" size={17} w={2.4} color={tokens.onBrand} />
          </Pressable>
          {step > 0 ? (
            <Pressable onPress={() => setStep(step - 1)} style={{ alignItems: "center", paddingVertical: 4 }}>
              <Text style={{ fontSize: 14, fontFamily: FONTS.sans[600], color: tokens.text2 }}>{app.t("m.onb.back")}</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

/* ---------- shared language list (optionally filtered to a subset) ---------- */
export function LangList({ selected, onSelect, q, setQ, filterLangs }: { selected: string; onSelect: (n: string) => void; q: string; setQ: (s: string) => void; filterLangs?: string[] }) {
  const { tokens, t: tr } = useApp();
  const base = filterLangs ? LANGUAGES.filter((l) => filterLangs.includes(l.name)) : LANGUAGES;
  const t = (q || "").trim().toLowerCase();
  const list = base.filter((l) => !t || l.name.toLowerCase().includes(t) || l.native.toLowerCase().includes(t) || l.code.includes(t));
  const ordered = [...list].sort((a, b) => (a.name === "English" ? -1 : b.name === "English" ? 1 : 0));

  return (
    <View style={{ flex: 1, marginTop: 0 }}>
      <View style={{ marginVertical: 12 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder={tr("m.lang.searchPlaceholder", { n: base.length })} small />
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
          <Text style={{ textAlign: "center", color: tokens.text3, fontSize: 13, padding: 24 }}>{tr("m.lang.noMatch", { q })}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

/* ---------- full-screen language sheet (edits the opened target) ---------- */
export function LangSheet() {
  const app = useApp();
  const { tokens } = app;
  const [q, setQ] = useState("");
  const target = app.langSheetTarget;
  const [tafLangs, setTafLangs] = useState<string[] | null>(null);

  useEffect(() => {
    if (target !== "tafsir") return;
    let alive = true;
    getTafsirLanguages().then((l) => { if (alive) setTafLangs(l); }).catch(() => {});
    return () => { alive = false; };
  }, [target]);

  const selected = target === "app" ? app.appLanguage : target === "tafsir" ? app.tafsirLanguage : app.translationLanguage;
  const onSelect = (n: string) => {
    if (target === "app") app.setAppLanguage(n);
    else if (target === "tafsir") app.setTafsirLanguage(n);
    else app.setTranslationLanguage(n);
    app.closeLangSheet();
  };
  const title = target === "app" ? app.t("m.set.appLang") : target === "tafsir" ? app.t("m.set.tafLang") : app.t("m.set.transLang");
  const sub = target === "app" ? app.t("m.set.appLangSub") : target === "tafsir" ? app.t("m.set.tafLangSub") : app.t("m.set.transLangSub");

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: tokens.lineSoft }}>
        <Pressable onPress={app.closeLangSheet} style={{ width: 36, height: 36, borderRadius: 11, borderWidth: 1, borderColor: tokens.line, backgroundColor: tokens.surface2, alignItems: "center", justifyContent: "center" }}>
          <Icon name="back" size={18} w={2.1} color={tokens.text2} />
        </Pressable>
        <View>
          <Text style={{ fontFamily: FONTS.serif[500], fontSize: 19, color: tokens.text }}>{title}</Text>
          <Text style={{ fontSize: 11.5, color: tokens.text2, marginTop: 1 }}>{sub}</Text>
        </View>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 4 }}>
        <LangList selected={selected} onSelect={onSelect} q={q} setQ={setQ} filterLangs={target === "tafsir" ? tafLangs ?? undefined : undefined} />
      </View>
    </View>
  );
}
