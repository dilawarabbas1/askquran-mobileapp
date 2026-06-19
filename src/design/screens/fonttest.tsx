// TEMPORARY decision-gate spike (not a shipped feature). Renders mark-heavy
// Uthmani words in Amiri (current FONTS.ar) vs UthmanicHafs (KFGQPC HAFS single
// font) so we can judge on-device whether the single KFGQPC font shapes combining
// marks correctly (silent-alif, dagger-alif, madda, hamza forms, waqf marks). If
// marks render cleanly → bundle one font, skip the per-page QPC V2 system. If
// broken → build per-page QPC V2. Remove once the decision is made.

import React from "react";
import { ScrollView, View } from "react-native";
import { Text } from "../AppText";
import { useApp } from "../AQContext";
import { FONTS } from "../tokens";
import { QuranText } from "../../quran/QuranText";

// Each case isolates a hard shaping feature of Uthmani orthography.
const CASES: { label: string; ar: string }[] = [
  { label: "Bismillah (hamzat-wasl ٱ + dagger-alif ٰ)", ar: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" },
  { label: "Muqatta'at الٓمٓ (madda ٓ over isolated letters)", ar: "الٓمٓ" },
  { label: "Silent alif وَقُولُوا۟ (small high rounded zero ۟)", ar: "وَقُولُوا۟" },
  { label: "Dagger alif ٱلرَّحْمَٰن (superscript alif ٰ)", ar: "ٱلرَّحْمَٰنِ" },
  { label: "Hamza forms ء أ إ ؤ ئ", ar: "ءَ أَ إِ ؤُ ئِ" },
  { label: "Waqf marks ۖ ۗ ۚ ۛ ۘ", ar: "فِيهِ ۛ هُدًى ۖ لِّلْمُتَّقِينَ ۚ" },
  { label: "Qul Huwa Allah (112:1)", ar: "قُلْ هُوَ ٱللَّهُ أَحَدٌ" },
  { label: "Maddah آ + tanwin (آلْـٰٔنَ)", ar: "ءَآلْـَٔـٰنَ وَقَدْ" },
  { label: "Tatweel-free ligature lam-alif لَآ", ar: "لَآ إِلَٰهَ إِلَّا هُوَ" },
];

function Row({ label, ar }: { label: string; ar: string }) {
  const { tokens } = useApp();
  return (
    <View style={{ borderWidth: 1, borderColor: tokens.line, borderRadius: 12, padding: 12, gap: 8, backgroundColor: tokens.surface }}>
      <Text style={{ fontSize: 11, color: tokens.text3 }}>{label}</Text>
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 9.5, color: tokens.brand, fontFamily: FONTS.sans[700] }}>AMIRI (current)</Text>
        <Text style={{ fontFamily: FONTS.ar, fontSize: 30, lineHeight: 64, color: tokens.arColor, textAlign: "right", writingDirection: "rtl" }}>{ar}</Text>
      </View>
      <View style={{ gap: 4, borderTopWidth: 1, borderTopColor: tokens.lineSoft, paddingTop: 6 }}>
        <Text style={{ fontSize: 9.5, color: "#c0392b", fontFamily: FONTS.sans[700] }}>UTHMANIC HAFS (KFGQPC candidate)</Text>
        <Text style={{ fontFamily: "UthmanicHafs", fontSize: 30, lineHeight: 64, color: tokens.arColor, textAlign: "right", writingDirection: "rtl" }}>{ar}</Text>
      </View>
    </View>
  );
}

export function FontTest() {
  const { tokens } = useApp();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, gap: 12 }}>
      <Text style={{ fontSize: 12, color: tokens.text3 }}>
        Compare combining-mark attachment. UthmanicHafs is correct only if every mark
        sits on the right base letter with no dotted/broken placeholder boxes.
      </Text>
      {CASES.map((c) => <Row key={c.label} {...c} />)}

      {/* QPC V2 per-page render check (download -> cache -> register -> render) */}
      <Text style={{ fontSize: 13, fontFamily: FONTS.sans[700], color: tokens.text, marginTop: 8 }}>QPC V2 (per-page glyphs)</Text>
      <Text style={{ fontSize: 11, color: tokens.text3 }}>
        Authentic only if RTL order is correct (first word rightmost), medallion encloses
        the number, and 1:1 vs 112:1 differ despite identical codepoints.
      </Text>
      {([
        { s: 1, a: 1, label: "1:1 Bismillah (page 1)" },
        { s: 1, a: 7, label: "1:7 (page 1)" },
        { s: 112, a: 1, label: "112:1 Al-Ikhlas (page 604)" },
        { s: 114, a: 6, label: "114:6 An-Nas (page 604)" },
        { s: 2, a: 255, label: "2:255 Ayat al-Kursi (mid)" },
      ] as const).map((x) => (
        <View key={x.label} style={{ borderWidth: 1, borderColor: tokens.line, borderRadius: 12, padding: 12, gap: 6, backgroundColor: tokens.surface }}>
          <Text style={{ fontSize: 10, color: tokens.text3 }}>{x.label}</Text>
          <QuranText surah={x.s} ayah={x.a} color={tokens.arColor} fontSize={30} lineHeight={66} />
        </View>
      ))}
    </ScrollView>
  );
}
