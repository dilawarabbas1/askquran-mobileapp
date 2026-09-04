// App shell ported from aq-app.jsx: per-screen app bar, bottom tab bar, screen
// router, and the splash → onboarding → app staging. The prototype's fake phone
// status bar / system nav are omitted — on a real device the OS provides those.

import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, View } from "react-native";
import { Text } from "./AppText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, type Screen, type Tab } from "./AQContext";
import { Mark, Wordmark } from "./atoms";
import { Icon } from "./Icon";
import { SearchBar } from "./SearchBar";
import { Splash, Onboarding, LangSheet } from "./screens/onboarding";
import { SearchHome, Results, Reader } from "./screens/core";
import { Recite, SurahSheet } from "./screens/recite";
import { Facts } from "./screens/facts";
import { Library, About } from "./screens/library";
import { Privacy, DataSafety } from "./screens/legal";
import { RefList } from "./RefList";
import { Passage } from "./screens/passage";
import { Saved } from "./screens/saved";
import { Settings } from "./screens/settings";
import { FontTest } from "./screens/fonttest";
import { Quiz } from "./screens/quiz";
import { COLLECTION_BY_ID } from "./refData";
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
// Title key + optional subtitle key per screen, resolved via t() at render.
const TITLE_KEYS: Record<string, [string, string | null]> = {
  reader: ["m.title.reader", null],
  recite: ["m.title.recite", "m.title.reciteSub"],
  facts: ["m.title.facts", "m.title.factsSub"],
  library: ["m.title.library", "m.title.librarySub"],
  about: ["m.title.about", null],
  privacy: ["m.title.privacy", null],
  dataSafety: ["m.title.dataSafety", null],
  saved: ["m.title.saved", null],
  settings: ["m.title.settings", null],
  quiz: ["m.quiz.title", null],
};

function AppBar({ screen }: { screen: Screen }) {
  const app = useApp();
  const { tokens } = app;

  if (screen === "searchHome") {
    // Pin the branding bar to LTR so the logo stays on the left and the
    // globe/bell actions on the right even under an RTL (Urdu) interface — the
    // wordmark is a fixed Latin brand lockup and shouldn't mirror.
    return (
      <View style={{ direction: "ltr", flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, backgroundColor: tokens.bg }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <Mark size={26} />
          <Wordmark size={18} />
        </View>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => app.openLangSheet()} style={chip(tokens)}>
          <Icon name="globe" size={18} color={tokens.text2} />
        </Pressable>
        <Pressable style={chip(tokens)}>
          <Icon name="bell" size={18} color={tokens.text2} />
        </Pressable>
      </View>
    );
  }
  if (screen === "results") return <ResultsBar />;

  // refList's title comes from the open collection (localized via i18n — names
  // uses its dedicated key), passage's from its target; else from TITLE_KEYS.
  const refColl = screen === "refList" && app.refCollection ? COLLECTION_BY_ID[app.refCollection] : undefined;
  const refTitle = refColl ? app.t(refColl.kind === "names" ? "names.title" : `${refColl.ns}.title`) : undefined;
  const passageTitle = screen === "passage" ? app.passageTarget?.title : undefined;
  const [titleKey, subKey] = TITLE_KEYS[screen] ?? [screen, null];
  const title = passageTitle ?? refTitle ?? (TITLE_KEYS[screen] ? app.t(titleKey) : screen);
  const sub = subKey ? app.t(subKey) : null;
  const pushed = screen === "reader" || screen === "refList" || screen === "passage" || screen === "about" || screen === "privacy" || screen === "dataSafety" || screen === "fonttest" || screen === "quiz";
  const showGlobe = screen === "facts" || screen === "recite" || screen === "refList" || screen === "passage";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, backgroundColor: tokens.bg, borderBottomWidth: pushed ? 1 : 0, borderBottomColor: tokens.lineSoft }}>
      {pushed ? (
        <Pressable onPress={app.back} style={chip(tokens)}>
          <Icon name="back" size={18} w={2.1} color={tokens.text2} />
        </Pressable>
      ) : null}
      <View style={{ flexShrink: 1 }}>
        <Text numberOfLines={1} style={{ fontFamily: FONTS.serif[500], fontSize: 21, color: tokens.text }}>{title}</Text>
        {sub ? <Text style={{ fontSize: 11.5, color: tokens.text2, marginTop: 1 }}>{sub}</Text> : null}
      </View>
      <View style={{ flex: 1 }} />
      {showGlobe ? (
        <Pressable onPress={() => app.openLangSheet()} style={chip(tokens)}>
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
    case "recite": return <Recite />;
    case "facts": return <Facts />;
    case "library": return <Library />;
    case "refList": return <RefList />;
    case "passage": return <Passage />;
    case "about": return <About />;
    case "privacy": return <Privacy />;
    case "dataSafety": return <DataSafety />;
    case "saved": return <Saved />;
    case "settings": return <Settings />;
    case "fonttest": return <FontTest />;
    case "quiz": return <Quiz />;
    default: return <SearchHome />;
  }
}

/* ---------- bottom tab bar ---------- */
const TABS: { id: Tab; labelKey: string; icon: string }[] = [
  { id: "search", labelKey: "m.tab.search", icon: "search" },
  { id: "recite", labelKey: "m.tab.recite", icon: "recite" },
  { id: "facts", labelKey: "m.tab.facts", icon: "grid" },
  { id: "library", labelKey: "m.tab.library", icon: "layers" },
  { id: "saved", labelKey: "m.tab.saved", icon: "bookmark" },
  { id: "settings", labelKey: "m.tab.settings", icon: "gear" },
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
            <Text numberOfLines={1} style={{ fontSize: 10.5, fontFamily: FONTS.sans[600], color: on ? tokens.brand : tokens.text3 }}>{app.t(t.labelKey)}</Text>
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
  if (app.surahSheetOpen) return <SurahSheet />;

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg }}>
      <AppBar screen={screen} />
      <Animated.View style={{ flex: 1, opacity: fade }}>
        <ScreenRouter screen={screen} />
      </Animated.View>
      {/* Hide the bottom tab bar while Recite audio plays — frees the maximum vertical
          room for long ayahs (owner request 2026-06-18). Restored the moment it pauses. */}
      {app.recitePlaying ? null : <TabBar />}
    </View>
  );
}

/* ---------- root: stage gating ---------- */
export function AppShell() {
  const app = useApp();
  const { tokens } = app;
  const insets = useSafeAreaInsets();

  // Only advance splash → onboarding once prefs are hydrated. If the user has
  // already onboarded, hydration sends them straight to the app (stage !== splash).
  useEffect(() => {
    if (app.stage === "splash" && app.hydrated) {
      const id = setTimeout(() => app.goOnboarding(), 1700);
      return () => clearTimeout(id);
    }
  }, [app.stage, app.hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg, paddingTop: insets.top }}>
      {app.stage === "splash" ? <Splash /> : null}
      {app.stage === "onboarding" ? <Onboarding /> : null}
      {app.stage === "app" ? <MainApp /> : null}
    </View>
  );
}
