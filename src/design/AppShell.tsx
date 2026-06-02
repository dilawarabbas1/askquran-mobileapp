// App shell ported from aq-app.jsx: per-screen app bar, bottom tab bar, screen
// router, and the splash → onboarding → app staging. The prototype's fake phone
// status bar / system nav are omitted — on a real device the OS provides those.

import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, type Screen, type Tab } from "./AQContext";
import { Mark, Wordmark } from "./atoms";
import { Icon } from "./Icon";
import { SearchBar } from "./SearchBar";
import { Splash, Onboarding, LangSheet } from "./screens/onboarding";
import { SearchHome, Results, Reader } from "./screens/core";
import { Facts } from "./screens/facts";
import { Saved } from "./screens/saved";
import { Settings } from "./screens/settings";
import { FONTS, mix } from "./tokens";

/* ---------- results app bar (editable, pinned search) ---------- */
function ResultsBar() {
  const app = useApp();
  const { tokens } = app;
  const [q, setQ] = useState(app.query);
  useEffect(() => { setQ(app.query); }, [app.query]);
  const submit = () => { if (q.trim()) app.runSearch(q.trim()); };
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: tokens.lineSoft, backgroundColor: tokens.bg }}>
      <Pressable onPress={app.back} style={{ width: 36, height: 36, borderRadius: 11, borderWidth: 1, borderColor: tokens.line, backgroundColor: tokens.surface2, alignItems: "center", justifyContent: "center" }}>
        <Icon name="back" size={18} w={2.1} color={tokens.text2} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder="Search the Quran…" onSubmit={submit} compact />
      </View>
      <Pressable style={{ width: 36, height: 36, borderRadius: 11, borderWidth: 1, borderColor: tokens.line, backgroundColor: tokens.surface2, alignItems: "center", justifyContent: "center" }}>
        <Icon name="filter" size={18} color={tokens.text2} />
      </Pressable>
    </View>
  );
}

/* ---------- per-screen app bar ---------- */
const TITLES: Record<string, [string, string | null]> = {
  reader: ["Reader", null],
  facts: ["Quran Facts", "Source-backed structural facts"],
  saved: ["Saved", null],
  settings: ["Settings", null],
};

function AppBar({ screen }: { screen: Screen }) {
  const app = useApp();
  const { tokens } = app;

  if (screen === "searchHome") {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, backgroundColor: tokens.bg }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <Mark size={26} />
          <Wordmark size={18} />
        </View>
        <View style={{ flex: 1 }} />
        <Pressable onPress={app.openLangSheet} style={chip(tokens)}>
          <Icon name="globe" size={18} color={tokens.text2} />
        </Pressable>
        <Pressable style={chip(tokens)}>
          <Icon name="bell" size={18} color={tokens.text2} />
        </Pressable>
      </View>
    );
  }
  if (screen === "results") return <ResultsBar />;

  const [title, sub] = TITLES[screen] ?? [screen, null];
  const pushed = screen === "reader";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, backgroundColor: tokens.bg, borderBottomWidth: pushed ? 1 : 0, borderBottomColor: tokens.lineSoft }}>
      {pushed ? (
        <Pressable onPress={app.back} style={chip(tokens)}>
          <Icon name="back" size={18} w={2.1} color={tokens.text2} />
        </Pressable>
      ) : null}
      <View>
        <Text style={{ fontFamily: FONTS.serif[500], fontSize: 21, color: tokens.text }}>{title}</Text>
        {sub ? <Text style={{ fontSize: 11.5, color: tokens.text2, marginTop: 1 }}>{sub}</Text> : null}
      </View>
      <View style={{ flex: 1 }} />
      {screen === "facts" ? (
        <Pressable onPress={app.openLangSheet} style={chip(tokens)}>
          <Icon name="globe" size={18} color={tokens.text2} />
        </Pressable>
      ) : null}
      {screen === "reader" ? (
        <Pressable style={chip(tokens)}>
          <Icon name="share" size={18} color={tokens.text2} />
        </Pressable>
      ) : null}
    </View>
  );
}

function chip(tokens: ReturnType<typeof useApp>["tokens"]) {
  return { width: 36, height: 36, borderRadius: 11, borderWidth: 1, borderColor: tokens.line, backgroundColor: tokens.surface2, alignItems: "center" as const, justifyContent: "center" as const };
}

/* ---------- screen router ---------- */
function ScreenRouter({ screen }: { screen: Screen }) {
  switch (screen) {
    case "searchHome": return <SearchHome />;
    case "results": return <Results />;
    case "reader": return <Reader />;
    case "facts": return <Facts />;
    case "saved": return <Saved />;
    case "settings": return <Settings />;
    default: return <SearchHome />;
  }
}

/* ---------- bottom tab bar ---------- */
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "search", label: "Search", icon: "search" },
  { id: "facts", label: "Facts", icon: "grid" },
  { id: "saved", label: "Saved", icon: "bookmark" },
  { id: "settings", label: "Settings", icon: "gear" },
];

function TabBar() {
  const app = useApp();
  const { tokens } = app;
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flexDirection: "row", paddingTop: 7, paddingHorizontal: 8, paddingBottom: 4 + insets.bottom, backgroundColor: tokens.bg, borderTopWidth: 1, borderTopColor: tokens.lineSoft }}>
      {TABS.map((t) => {
        const on = app.activeTab === t.id;
        const savedActive = t.id === "saved" && on;
        return (
          <Pressable key={t.id} onPress={() => app.goTab(t.id)} style={{ flex: 1, alignItems: "center", gap: 4, paddingVertical: 6 }}>
            <View>
              <Icon name={savedActive ? "bookmarkFill" : t.icon} size={23} w={on ? 2.1 : 1.9} color={on ? tokens.brand : tokens.text3} />
              {t.id === "saved" && app.savedItems.length ? (
                <View style={{ position: "absolute", top: -2, right: -6, minWidth: 15, height: 15, paddingHorizontal: 4, borderRadius: 999, backgroundColor: tokens.mode === "dark" ? tokens.gold : tokens.goldDeep, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 9, fontFamily: FONTS.sans[700], color: tokens.mode === "dark" ? "#06241b" : "#fff" }}>{app.savedItems.length}</Text>
                </View>
              ) : null}
            </View>
            <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[600], color: on ? tokens.brand : tokens.text3 }}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- main app (post-onboarding) ---------- */
function MainApp() {
  const app = useApp();
  const { tokens } = app;
  const screen = app.current;
  // fade screens in on navigation (mirrors the design's slide/fade transition)
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, [app.navKey, fade]);

  if (app.langSheetOpen) return <LangSheet />;

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg }}>
      <AppBar screen={screen} />
      <Animated.View style={{ flex: 1, opacity: fade }}>
        <ScreenRouter screen={screen} />
      </Animated.View>
      <TabBar />
    </View>
  );
}

/* ---------- root: stage gating ---------- */
export function AppShell() {
  const app = useApp();
  const { tokens } = app;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (app.stage === "splash") {
      const id = setTimeout(() => app.goOnboarding(), 1700);
      return () => clearTimeout(id);
    }
  }, [app.stage]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg, paddingTop: insets.top }}>
      {app.stage === "splash" ? <Splash /> : null}
      {app.stage === "onboarding" ? <Onboarding /> : null}
      {app.stage === "app" ? <MainApp /> : null}
    </View>
  );
}
