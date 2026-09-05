// Passage screen — opened from any Library reference card's "Read" button. Shows
// the card's full passage: verbatim Arabic + transliteration + chosen
// translation, grouped by surah, with per-ayah "View Tafsir" on request. The
// title is rendered by the app bar from `passageTarget.title`.

import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { Text } from "../AppText";
import { useApp } from "../AQContext";
import { AyahPassage } from "../AyahView";
import { FONTS } from "../tokens";
import { countAyahs } from "../lib/refs";
import { translationIdForLanguage } from "@/api";

export function Passage() {
  const app = useApp();
  const { tokens } = app;
  const target = app.passageTarget;

  const [translationId, setTranslationId] = useState<string>("");
  useEffect(() => {
    let alive = true;
    translationIdForLanguage(app.language)
      .then((id) => { if (alive) setTranslationId(id || "en.sahih"); })
      .catch(() => { if (alive) setTranslationId("en.sahih"); });
    return () => { alive = false; };
  }, [app.language]);

  if (!target) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: tokens.text3 }}>{app.t("more.noResults")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      {/* Header card — passage subtitle + ayah count. Each ayah below renders in
          its own card (AyahPassage), matching the search/list page pattern. */}
      <View style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 13 }, tokens.cardShadow]}>
        {target.subtitle ? (
          <Text style={{ fontSize: 13.5, lineHeight: 21, color: tokens.text2 }}>{target.subtitle}</Text>
        ) : null}
        <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[600], letterSpacing: 0.4, textTransform: "uppercase", color: tokens.text3, marginTop: target.subtitle ? 8 : 0 }}>
          {app.t("more.ayahCount", { n: countAyahs(target.refs) })}
        </Text>
      </View>

      {!translationId ? (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <ActivityIndicator color={tokens.brand} />
        </View>
      ) : (
        <AyahPassage
          refs={target.refs}
          mainRefs={target.mainRefs}
          translationId={translationId}
          showTafsir={target.showTafsir}
          mainBadge={!!target.mainBadge}
          tokens={tokens}
        />
      )}
    </ScrollView>
  );
}
