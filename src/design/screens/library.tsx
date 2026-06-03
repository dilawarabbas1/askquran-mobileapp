// Library — the mobile home for the "More from the Quran" reference collections
// (Quranic Duas, Prophet Stories, Parables, Commands & Prohibitions, Warnings,
// Ethical Character Map, Legal & Ruling References) plus About. Mirrors the web
// portal's "More" navigation; each entry opens a source-backed reference page.

import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useApp } from "../AQContext";
import { BlockTitle, SegLabel } from "../atoms";
import { Icon, RawIcon } from "../Icon";
import { FONTS, mix } from "../tokens";
import { COLLECTIONS } from "../refData";

export function Library() {
  const app = useApp();
  const { tokens } = app;
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <SegLabel>From the Quran</SegLabel>
      <BlockTitle style={{ marginTop: 8, marginBottom: 6 }}>Library</BlockTitle>
      <Text style={{ fontSize: 13.5, lineHeight: 21, color: tokens.text2, marginBottom: 16 }}>
        Curated, Quran-backed reference collections. Every passage loads its verbatim Arabic and a stored translation from the source — nothing here is generated.
      </Text>

      <View style={{ gap: 11 }}>
        {COLLECTIONS.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => app.openRef(c.id)}
            style={[{ flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 14 }, tokens.cardShadow]}
          >
            <View style={{ width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
              <RawIcon inner={c.icon} size={22} color={tokens.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.serif[600], fontSize: 17, color: tokens.text }}>{c.title}</Text>
              <Text style={{ fontSize: 12, lineHeight: 17, color: tokens.text2, marginTop: 2 }}>{c.subtitle}</Text>
              <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[600], letterSpacing: 0.3, textTransform: "uppercase", color: tokens.text3, marginTop: 4 }}>{c.items.length} entries</Text>
            </View>
            <Icon name="chevR" size={17} color={tokens.text3} />
          </Pressable>
        ))}

        <Pressable
          onPress={app.openAbout}
          style={[{ flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 14 }, tokens.cardShadow]}
        >
          <View style={{ width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
            <Icon name="info" size={22} color={tokens.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.serif[600], fontSize: 17, color: tokens.text }}>About AskQuran</Text>
            <Text style={{ fontSize: 12, lineHeight: 17, color: tokens.text2, marginTop: 2 }}>How the app works and our source-integrity guarantee.</Text>
          </View>
          <Icon name="chevR" size={17} color={tokens.text3} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const ABOUT_POINTS: { title: string; body: string }[] = [
  { title: "Source-backed, never generated", body: "Every result serves verbatim Quran Arabic (Tanzil), stored translations, and stored tafsir only. The app never writes religious explanation and never alters source text." },
  { title: "Ask and get references", body: "Search assembles matching ayahs deterministically from the index — you receive referenced source material, not an authored answer." },
  { title: "Tafsir as stored", body: "Tafsir is shown exactly as stored and is never machine-translated or silently substituted across languages." },
  { title: "Traceable", body: "Each ayah carries its sources — Arabic, translation, and (when shown) tafsir attribution — so everything can be traced back." },
];

export function About() {
  const app = useApp();
  const { tokens } = app;
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <SegLabel>About</SegLabel>
      <BlockTitle style={{ marginTop: 8, marginBottom: 6 }}>Ask Quran</BlockTitle>
      <Text style={{ fontSize: 13.5, lineHeight: 21, color: tokens.text2, marginBottom: 16 }}>
        A source-grounded way to explore the Quran: references, translation, and tafsir — presented unchanged.
      </Text>

      <View style={{ gap: 12 }}>
        {ABOUT_POINTS.map((p) => (
          <View key={p.title} style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 15, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 13 }, tokens.cardShadow]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 7 }}>
              <View style={{ width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 12) }}>
                <Icon name="check" size={15} w={2.3} color={tokens.brand} />
              </View>
              <Text style={{ flex: 1, fontFamily: FONTS.serif[600], fontSize: 16, color: tokens.text }}>{p.title}</Text>
            </View>
            <Text style={{ fontSize: 13, lineHeight: 20.5, color: tokens.text2 }}>{p.body}</Text>
          </View>
        ))}
      </View>

      <Text style={{ fontSize: 11.5, lineHeight: 17.5, color: tokens.text3, textAlign: "center", marginTop: 22 }}>
        Source-backed Quran search · references, translation &amp; tafsir
      </Text>
    </ScrollView>
  );
}
