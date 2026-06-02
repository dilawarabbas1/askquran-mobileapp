// Settings screen ported from aq-facts.jsx (Settings): Reading (language sheet,
// Arabic + tajweed toggles), Appearance (theme), Notifications, About + footer.

import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
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
  const [notif, setNotif] = useState(true);
  const [tajweed, setTajweed] = useState(false);

  const chev = <Icon name="chevR" size={16} color={tokens.text3} />;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 26 }} showsVerticalScrollIndicator={false}>
      <Group label="Reading" tokens={tokens}>
        <Row
          tokens={tokens} icon="globe" title="Language" sub="For translation & tafsir · 44 available"
          onPress={app.openLangSheet}
          right={
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[600], color: tokens.text2 }}>{app.language}</Text>
              {chev}
            </View>
          }
        />
        <Row tokens={tokens} icon="type" title="Show Arabic text" sub="Uthmani script" right={<Switch on={arOn} onPress={() => setArOn((v) => !v)} />} />
        <Row tokens={tokens} icon="type" title="Tajweed colouring" sub="Highlight recitation rules" last right={<Switch on={tajweed} onPress={() => setTajweed((v) => !v)} />} />
      </Group>

      <Group label="Appearance" tokens={tokens}>
        <Row
          tokens={tokens} icon={app.mode === "dark" ? "moon" : "sun"} title="Theme" sub="Light, dark, or follow system" last
          right={
            <View style={{ flexDirection: "row", backgroundColor: tokens.surface2, borderWidth: 1, borderColor: tokens.line, borderRadius: 9, padding: 2, gap: 2 }}>
              {([["light", "Light"], ["dark", "Dark"], ["system", "Auto"]] as [Appearance, string][]).map(([v, l]) => {
                const on = app.appearance === v;
                return (
                  <Pressable key={v} onPress={() => app.setAppearance(v)} style={{ paddingHorizontal: 11, paddingVertical: 5, borderRadius: 7, backgroundColor: on ? (tokens.mode === "dark" ? tokens.bg : tokens.surface) : "transparent" }}>
                    <Text style={{ fontSize: 11.5, fontFamily: FONTS.sans[600], color: on ? tokens.brand : tokens.text2 }}>{l}</Text>
                  </Pressable>
                );
              })}
            </View>
          }
        />
      </Group>

      <Group label="Notifications" tokens={tokens}>
        <Row tokens={tokens} icon="bell" title="Daily verse" sub="A verse of the day each morning" last right={<Switch on={notif} onPress={() => setNotif((v) => !v)} />} />
      </Group>

      <Group label="Home screen" tokens={tokens}>
        <Row
          tokens={tokens} icon="grid" title="Topics layout" sub="How suggested topics appear on Search" last
          right={
            <View style={{ flexDirection: "row", backgroundColor: tokens.surface2, borderWidth: 1, borderColor: tokens.line, borderRadius: 9, padding: 2, gap: 2 }}>
              {(["Chips", "Grid"] as const).map((v) => {
                const on = app.homeLayout === v;
                return (
                  <Pressable key={v} onPress={() => app.setHomeLayout(v)} style={{ paddingHorizontal: 11, paddingVertical: 5, borderRadius: 7, backgroundColor: on ? (tokens.mode === "dark" ? tokens.bg : tokens.surface) : "transparent" }}>
                    <Text style={{ fontSize: 11.5, fontFamily: FONTS.sans[600], color: on ? tokens.brand : tokens.text2 }}>{v}</Text>
                  </Pressable>
                );
              })}
            </View>
          }
        />
      </Group>

      <Group label="About" tokens={tokens}>
        <Row tokens={tokens} icon="shield" title="Sources & integrity" onPress={() => {}} right={chev} />
        <Row tokens={tokens} icon="info" title="About AskQuran" onPress={() => {}} right={chev} />
        <Row tokens={tokens} icon="share" title="Share the app" onPress={() => {}} last right={chev} />
      </Group>

      {/* Footer — matches the web app's Footer verbatim. */}
      <View style={{ alignItems: "center", paddingTop: 24, paddingBottom: 8, paddingHorizontal: 18 }}>
        <Text style={{ fontFamily: FONTS.ar, fontSize: 19, color: tokens.orn, marginBottom: 12 }}>صدق الله العظيم</Text>
        <Text style={{ fontFamily: FONTS.serif.italic, fontStyle: "italic", fontSize: 14, lineHeight: 22, color: tokens.text, textAlign: "center" }}>
          Built by <Text style={{ fontFamily: FONTS.sans[600], fontStyle: "normal", color: tokens.brand }}>Dilawar Abbas</Text> with the support of <Text style={{ fontFamily: FONTS.sans[600], fontStyle: "normal", color: tokens.text }}>Ghazala Zafar</Text> as Sadaqah Jariyah.
        </Text>
        <Text style={{ fontSize: 12, lineHeight: 19.2, color: tokens.text2, marginTop: 12, maxWidth: 280, textAlign: "center" }}>
          <Text style={{ fontFamily: FONTS.sans[700], color: tokens.text }}>AskQuran is free, ad-free, and always will be.</Text> It does not ask for donations. Its answers are based only on the Quran, authentic translations, and tafsir, with no generated religious text.
        </Text>
        <Text style={{ fontSize: 12, lineHeight: 18, color: tokens.text2, marginTop: 12, maxWidth: 280, textAlign: "center", fontStyle: "italic" }}>
          May Allah accept this effort, make it beneficial, and forgive any shortcomings.
        </Text>
        <Text style={{ fontSize: 10.5, lineHeight: 15, color: tokens.text3, marginTop: 14, maxWidth: 280, textAlign: "center" }}>
          Source text from Tanzil · Translations & tafsir presented unaltered with full attribution
        </Text>
      </View>
    </ScrollView>
  );
}
