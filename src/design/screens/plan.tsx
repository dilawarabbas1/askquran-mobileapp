// Reading Plan / Khatm tracker. Pick a pace (30 / 60 / 365 days), then track a
// full reading of the Quran by juzʼ — with a daily streak, an on-track indicator,
// and a "Continue reading" jump that opens Recite at the next unread juzʼ.

import React from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Text } from "../AppText";
import { useApp, type KhatmKind } from "../AQContext";
import { BlockTitle, FieldLabel, OrnDivider } from "../atoms";
import { Icon } from "../Icon";
import { FONTS, mix } from "../tokens";
import { JUZ_COUNT } from "../lib/juz";

const PLANS: { kind: KhatmKind; days: number }[] = [
  { kind: "30", days: 30 },
  { kind: "60", days: 60 },
  { kind: "365", days: 365 },
];
const TOTAL_PAGES = 604;

export function Plan() {
  const app = useApp();
  const { tokens } = app;
  const k = app.khatm;

  /* ---------- no active plan → pace picker ---------- */
  if (!k) {
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center" }}>
          <BlockTitle>{app.t("m.plan.title")}</BlockTitle>
        </View>
        <Text style={{ fontSize: 13.5, lineHeight: 21, color: tokens.text2, textAlign: "center", marginTop: 4, paddingHorizontal: 8 }}>
          {app.t("m.plan.lede")}
        </Text>
        <OrnDivider />
        <FieldLabel>{app.t("m.plan.choosePace")}</FieldLabel>
        <View style={{ gap: 12 }}>
          {PLANS.map((p) => {
            const pages = Math.ceil(TOTAL_PAGES / p.days);
            return (
              <Pressable key={p.kind} onPress={() => app.startKhatm(p.kind)} style={[{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 16 }, tokens.cardShadow]}>
                <View style={{ width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11), borderWidth: 1, borderColor: mix(tokens.brand, 22, tokens.line) }}>
                  <Icon name="book" size={20} w={1.9} color={tokens.brand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.serif[600], fontSize: 16.5, color: tokens.text }}>{app.t(`m.plan.days${p.kind}`)}</Text>
                  <Text style={{ fontSize: 12.5, color: tokens.text2, marginTop: 2 }}>{app.t(`m.plan.pace${p.kind}`)} · {app.t("m.plan.perDayPages", { n: pages })}</Text>
                </View>
                <Icon name="chevR" size={16} w={2.1} color={tokens.text3} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  /* ---------- active plan → progress ---------- */
  const done = k.completedJuz.length;
  const pct = Math.round((done / JUZ_COUNT) * 100);
  const planDays = Number(k.kind);
  const elapsedDays = Math.floor((Date.now() - k.startedAt) / 86400000) + 1; // day 1 on start day
  const expected = Math.min(JUZ_COUNT, Math.ceil((elapsedDays * JUZ_COUNT) / planDays));
  const diff = done - expected;
  const complete = done >= JUZ_COUNT;

  const statusText = complete
    ? app.t("m.plan.done")
    : diff >= 0
      ? (diff === 0 ? app.t("m.plan.onTrack") : app.t("m.plan.ahead", { n: diff }))
      : app.t("m.plan.behind", { n: -diff });
  const statusColor = complete ? tokens.brand : diff >= 0 ? tokens.brand : tokens.goldDeep;

  const confirmReset = () => {
    Alert.alert(app.t("m.plan.title"), app.t("m.plan.resetConfirm"), [
      { text: app.t("m.plan.cancel"), style: "cancel" },
      { text: app.t("m.plan.reset"), style: "destructive", onPress: () => app.resetKhatm() },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 18, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      {/* streak + pace */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONTS.serif[600], fontSize: 18, color: tokens.text }}>{app.t(`m.plan.days${k.kind}`)}</Text>
          <Text style={{ fontSize: 12.5, color: tokens.text2, marginTop: 2 }}>{app.t(`m.plan.pace${k.kind}`)}</Text>
        </View>
        {k.streak > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: mix(tokens.gold, 16, tokens.surface), borderWidth: 1, borderColor: mix(tokens.gold, 34, tokens.line) }}>
            <Icon name="flame" size={15} w={1.9} color={tokens.goldDeep} />
            <Text style={{ fontSize: 13, fontFamily: FONTS.sans[700], color: tokens.goldDeep }}>{app.t("m.plan.streak", { n: k.streak })}</Text>
          </View>
        ) : null}
      </View>

      {/* progress */}
      <View style={{ marginTop: 18 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontFamily: FONTS.serif[600], fontSize: 26, color: tokens.brand }}>
            {done}<Text style={{ fontSize: 16, color: tokens.text3 }}> / {JUZ_COUNT} {app.t("m.plan.juzUnit")}</Text>
          </Text>
          <Text style={{ fontFamily: FONTS.sans[700], fontSize: 15, color: statusColor }}>{pct}%</Text>
        </View>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: tokens.lineSoft }}>
          <View style={{ height: 8, borderRadius: 4, width: `${pct}%`, backgroundColor: tokens.brand }} />
        </View>
        <Text style={{ fontSize: 13, fontFamily: FONTS.sans[600], color: statusColor, marginTop: 10 }}>{statusText}</Text>
      </View>

      {/* continue */}
      <Pressable onPress={() => app.continueKhatm()} style={[{ marginTop: 18, backgroundColor: tokens.brand, borderRadius: 14, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 }, tokens.cardShadow]}>
        <Icon name="recite" size={18} w={2} color={tokens.onBrand} />
        <Text style={{ fontSize: 16, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>{app.t("m.plan.continue")}</Text>
      </Pressable>

      <OrnDivider />

      {/* juzʼ grid */}
      <FieldLabel>{app.t("m.plan.juzGrid")}</FieldLabel>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {Array.from({ length: JUZ_COUNT }, (_, i) => i + 1).map((n) => {
          const on = k.completedJuz.includes(n);
          return (
            <Pressable key={n} onPress={() => app.toggleJuzRead(n)} style={{ width: 52, height: 52, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: on ? tokens.brand : tokens.surface, borderWidth: 1, borderColor: on ? tokens.brand : tokens.line }}>
              <Text style={{ fontSize: 15, fontFamily: FONTS.sans[700], color: on ? tokens.onBrand : tokens.text2 }}>{n}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* footer */}
      <Pressable onPress={confirmReset} style={{ marginTop: 24, alignItems: "center", paddingVertical: 10 }}>
        <Text style={{ fontSize: 14, fontFamily: FONTS.sans[600], color: tokens.text3 }}>{app.t("m.plan.reset")}</Text>
      </Pressable>
    </ScrollView>
  );
}
