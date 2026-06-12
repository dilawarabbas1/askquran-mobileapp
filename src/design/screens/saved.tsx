// Saved / bookmarks screen ported from aq-facts.jsx (Saved). Shows saved ayah
// cards or an empty state with a call to action.

import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "../AppText";
import { useApp } from "../AQContext";
import { AyahCard } from "../atoms";
import { Icon } from "../Icon";
import { FONTS, mix } from "../tokens";

export function Saved() {
  const app = useApp();
  const { tokens } = app;
  const items = app.savedItems;
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 26 }} showsVerticalScrollIndicator={false}>
      {items.length ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 14, marginHorizontal: 2 }}>
            <Text style={{ fontSize: 14, fontFamily: FONTS.sans[700], color: tokens.text }}>{app.t("m.saved.heading")}</Text>
            <Text style={{ fontSize: 12, color: tokens.text3 }}>{app.t("m.saved.count", { n: items.length })}</Text>
          </View>
          <View style={{ gap: 16 }}>
            {items.map((d, i) => <AyahCard item={d} key={d.ref + i} />)}
          </View>
        </>
      ) : (
        <View style={{ alignItems: "center", paddingVertical: 50, paddingHorizontal: 24 }}>
          <View style={{ width: 58, height: 58, borderRadius: 17, marginBottom: 16, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.gold, 12, tokens.surface), borderWidth: 1, borderColor: tokens.line }}>
            <Icon name="bookmark" size={28} w={1.7} color={tokens.orn} />
          </View>
          <Text style={{ fontFamily: FONTS.serif[600], fontSize: 19, color: tokens.text, marginBottom: 6, textAlign: "center" }}>{app.t("m.saved.emptyTitle")}</Text>
          <Text style={{ fontSize: 13, lineHeight: 20.8, color: tokens.text2, textAlign: "center", maxWidth: 240 }}>{app.t("m.saved.emptyBody")}</Text>
          <Pressable onPress={() => app.goTab("search")} style={{ marginTop: 22, backgroundColor: tokens.brand, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 22 }}>
            <Text style={{ fontSize: 15.5, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>{app.t("m.saved.emptyCta")}</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
