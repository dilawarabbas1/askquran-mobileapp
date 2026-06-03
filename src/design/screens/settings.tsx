// Settings screen ported from aq-facts.jsx (Settings): Reading (language sheet,
// Arabic + tajweed toggles), Appearance (theme), Home screen, About + footer.

import React, { useState } from "react";
import { Pressable, ScrollView, Share, Text, View } from "react-native";
import { useApp } from "../AQContext";
import { Switch } from "../atoms";
import { Icon } from "../Icon";
import { FONTS, mix, type Tokens } from "../tokens";
import type { Appearance } from "../AQContext";

function Group({ label, tokens, children }: { label: string; tokens: Tokens; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[700], letterSpacing: 1.35, textTransform: "uppercase", color: tokens.text3, marginHorizontal: 4, marginBottom: 9 }}>{label}</Text>
      <View style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 15, overflow: "hidden" }, tokens.cardShadow]}>{children}</View>
    </View>
  );
}

function Row({
  tokens, icon, title, sub, right, onPress, last,
}: { tokens: Tokens; icon: string; title: string; sub?: string; right?: React.ReactNode; onPress?: () => void; last?: boolean }) {
  const Wrap: any = onPress ? Pressable : View;
  return (
    <Wrap onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 15, paddingVertical: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: tokens.lineSoft }}>
      <View style={{ width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 10) }}>
        <Icon name={icon} size={17} color={tokens.brand} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontFamily: FONTS.sans[600], color: tokens.text }}>{title}</Text>
        {sub ? <Text style={{ fontSize: 11.5, color: tokens.text2, marginTop: 1 }}>{sub}</Text> : null}
      </View>
      {right}
    </Wrap>
  );
}

export function Settings() {
  const app = useApp();
  const { tokens } = app;
  const [arOn, setArOn] = useState(true);
  const [tajweed, setTajweed] = useState(false);

  const shareApp = () =>
    Share.share({
      message: "Ask Quran — source-backed Quran search: references, translation & tafsir, with no generated religious text.",
    }).catch(() => {});

  const chev = <Icon name="chevR" size={16} color={tokens.text3} />;
  const val = (v: string) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[600], color: tokens.text2 }}>{v}</Text>
      {chev}
    </View>
  );

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 26 }} showsVerticalScrollIndicator={false}>
      <Group label={app.t("m.set.reading")} tokens={tokens}>
        <Row tokens={tokens} icon="globe" title={app.t("m.set.appLang")} sub={app.t("m.set.appLangSub")} onPress={() => app.openLangSheet("app")} right={val(app.appLanguage)} />
        <Row tokens={tokens} icon="type" title={app.t("m.set.transLang")} sub={app.t("m.set.transLangSub")} onPress={() => app.openLangSheet("translation")} right={val(app.translationLanguage)} />
        <Row tokens={tokens} icon="info" title={app.t("m.set.tafLang")} sub={app.t("m.set.tafLangSub")} onPress={() => app.openLangSheet("tafsir")} right={val(app.tafsirLanguage)} />
        <Row tokens={tokens} icon="type" title={app.t("m.set.arabic")} sub={app.t("m.set.arabicSub")} right={<Switch on={arOn} onPress={() => setArOn((v) => !v)} />} />
        <Row tokens={tokens} icon="type" title={app.t("m.set.tajweed")} sub={app.t("m.set.tajweedSub")} last right={<Switch on={tajweed} onPress={() => setTajweed((v) => !v)} />} />
      </Group>

      <Group label={app.t("m.set.appearance")} tokens={tokens}>
        <Row
          tokens={tokens} icon={app.mode === "dark" ? "moon" : "sun"} title={app.t("m.set.theme")} sub={app.t("m.set.themeSub")} last
          right={
            <View style={{ flexDirection: "row", backgroundColor: tokens.surface2, borderWidth: 1, borderColor: tokens.line, borderRadius: 9, padding: 2, gap: 2 }}>
              {([["light", "m.set.light"], ["dark", "m.set.dark"], ["system", "m.set.auto"]] as [Appearance, string][]).map(([v, l]) => {
                const on = app.appearance === v;
                return (
                  <Pressable key={v} onPress={() => app.setAppearance(v)} style={{ paddingHorizontal: 11, paddingVertical: 5, borderRadius: 7, backgroundColor: on ? (tokens.mode === "dark" ? tokens.bg : tokens.surface) : "transparent" }}>
                    <Text style={{ fontSize: 11.5, fontFamily: FONTS.sans[600], color: on ? tokens.brand : tokens.text2 }}>{app.t(l)}</Text>
                  </Pressable>
                );
              })}
            </View>
          }
        />
      </Group>

      <Group label={app.t("m.set.home")} tokens={tokens}>
        <Row
          tokens={tokens} icon="grid" title={app.t("m.set.topicsLayout")} sub={app.t("m.set.topicsLayoutSub")} last
          right={
            <View style={{ flexDirection: "row", backgroundColor: tokens.surface2, borderWidth: 1, borderColor: tokens.line, borderRadius: 9, padding: 2, gap: 2 }}>
              {(["Chips", "Grid"] as const).map((v) => {
                const on = app.homeLayout === v;
                return (
                  <Pressable key={v} onPress={() => app.setHomeLayout(v)} style={{ paddingHorizontal: 11, paddingVertical: 5, borderRadius: 7, backgroundColor: on ? (tokens.mode === "dark" ? tokens.bg : tokens.surface) : "transparent" }}>
                    <Text style={{ fontSize: 11.5, fontFamily: FONTS.sans[600], color: on ? tokens.brand : tokens.text2 }}>{app.t(v === "Chips" ? "m.set.chips" : "m.set.grid")}</Text>
                  </Pressable>
                );
              })}
            </View>
          }
        />
      </Group>

      <Group label={app.t("m.set.aboutGroup")} tokens={tokens}>
        <Row tokens={tokens} icon="shield" title={app.t("m.set.sources")} sub={app.t("m.set.sourcesSub")} onPress={() => { app.setFactTab("sources"); app.goTab("facts"); }} right={chev} />
        <Row tokens={tokens} icon="info" title={app.t("m.set.about")} sub={app.t("m.set.aboutSub")} onPress={app.openAbout} right={chev} />
        <Row tokens={tokens} icon="share" title={app.t("m.set.share")} onPress={shareApp} last right={chev} />
      </Group>

      {/* Footer — matches the web app's Footer verbatim. */}
      <View style={{ alignItems: "center", paddingTop: 24, paddingBottom: 8, paddingHorizontal: 18 }}>
        <Text style={{ fontFamily: FONTS.ar, fontSize: 19, color: tokens.orn, marginBottom: 12 }}>صدق الله العظيم</Text>
        <Text style={{ fontFamily: FONTS.serif.italic, fontStyle: "italic", fontSize: 14, lineHeight: 22, color: tokens.text, textAlign: "center" }}>
          {app.t("m.foot.builtBy")}
        </Text>
        <Text style={{ fontSize: 12, lineHeight: 19.2, color: tokens.text2, marginTop: 12, maxWidth: 280, textAlign: "center" }}>
          {app.t("m.foot.free")}
        </Text>
        <Text style={{ fontSize: 12, lineHeight: 18, color: tokens.text2, marginTop: 12, maxWidth: 280, textAlign: "center", fontStyle: "italic" }}>
          {app.t("m.foot.dua")}
        </Text>
        <Text style={{ fontSize: 10.5, lineHeight: 15, color: tokens.text3, marginTop: 14, maxWidth: 280, textAlign: "center" }}>
          {app.t("m.foot.src")}
        </Text>
      </View>
    </ScrollView>
  );
}
