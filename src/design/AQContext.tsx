// Central app state + theme, ported from the prototype's App()/useApp model in
// aq-app.jsx. Holds the navigation stack, search query, reader target, saved
// list, language, appearance and home-layout — every interaction in the design
// is driven through this context.

import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { RESULTS, type AyahItem } from "./data";
import { TOKENS, type Mode, type Tokens } from "./tokens";

export type Stage = "splash" | "onboarding" | "app";
export type Screen = "searchHome" | "results" | "reader" | "facts" | "saved" | "settings";
export type Tab = "search" | "facts" | "saved" | "settings";
export type Appearance = "light" | "dark" | "system";
export type HomeLayout = "Chips" | "Grid";

const ROOT: Record<Tab, Screen> = { search: "searchHome", facts: "facts", saved: "saved", settings: "settings" };

export interface AQApi {
  stage: Stage;
  current: Screen;
  navKey: number;
  query: string;
  readerItem: AyahItem;
  factTab: string;
  appearance: Appearance;
  homeLayout: HomeLayout;
  language: string;
  lang: "en" | "ur";
  langSheetOpen: boolean;
  activeTab: Tab;
  canBack: boolean;
  mode: Mode;
  tokens: Tokens;

  goOnboarding: () => void;
  finishOnboarding: () => void;
  goTab: (tab: Tab) => void;
  runSearch: (q: string) => void;
  openReader: (item: AyahItem) => void;
  back: () => void;
  setFactTab: (id: string) => void;
  setLanguage: (name: string) => void;
  openLangSheet: () => void;
  closeLangSheet: () => void;
  setAppearance: (v: Appearance) => void;
  setHomeLayout: (v: HomeLayout) => void;
  isSaved: (ref: string) => boolean;
  toggleSave: (item: AyahItem) => void;
  savedItems: AyahItem[];
}

const Ctx = createContext<AQApi | null>(null);
export const useApp = (): AQApi => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AQProvider");
  return v;
};

export function AQProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [stage, setStage] = useState<Stage>("splash");
  const [nav, setNav] = useState<{ screen: Screen }[]>([{ screen: "searchHome" }]);
  const [query, setQuery] = useState("Forgiveness");
  const [readerItem, setReaderItem] = useState<AyahItem>(RESULTS[0]);
  const [factTab, setFactTab] = useState("structure");
  const [appearance, setAppearance] = useState<Appearance>("light");
  const [savedList, setSavedList] = useState<AyahItem[]>([RESULTS[0], RESULTS[3]]);
  const [navKey, setNavKey] = useState(0);
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [language, setLanguageState] = useState("English");
  const [homeLayout, setHomeLayout] = useState<HomeLayout>("Chips");

  const lang: "en" | "ur" = language === "Urdu" ? "ur" : "en";
  const mode: Mode = appearance === "system" ? (system === "dark" ? "dark" : "light") : appearance;
  const tokens = TOKENS[mode];
  const current = nav[nav.length - 1].screen;
  const activeTab = (Object.keys(ROOT) as Tab[]).find((k) => ROOT[k] === nav[0].screen) ?? "search";
  const bump = () => setNavKey((k) => k + 1);

  const api: AQApi = useMemo(
    () => ({
      stage, current, navKey, query, readerItem, factTab, appearance, homeLayout,
      language, lang, langSheetOpen, activeTab, canBack: nav.length > 1, mode, tokens,
      goOnboarding: () => setStage("onboarding"),
      finishOnboarding: () => setStage("app"),
      goTab: (tab) => { setNav([{ screen: ROOT[tab] }]); bump(); },
      runSearch: (q) => { setQuery(q); setNav([{ screen: "searchHome" }, { screen: "results" }]); bump(); },
      openReader: (item) => { setReaderItem(item); setNav((n) => [...n, { screen: "reader" }]); bump(); },
      back: () => { setNav((n) => (n.length > 1 ? n.slice(0, -1) : n)); bump(); },
      setFactTab,
      setLanguage: (name) => setLanguageState(name),
      openLangSheet: () => setLangSheetOpen(true),
      closeLangSheet: () => setLangSheetOpen(false),
      setAppearance,
      setHomeLayout,
      isSaved: (ref) => savedList.some((s) => s.ref === ref),
      toggleSave: (item) =>
        setSavedList((list) => (list.some((s) => s.ref === item.ref) ? list.filter((s) => s.ref !== item.ref) : [item, ...list])),
      savedItems: savedList,
    }),
    [stage, query, readerItem, factTab, appearance, homeLayout, language, lang, langSheetOpen, navKey, savedList, mode, tokens, nav],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
