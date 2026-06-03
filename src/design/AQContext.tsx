// Central app state + theme, ported from the prototype's App()/useApp model in
// aq-app.jsx. Holds the navigation stack, search query, reader target, saved
// list, language, appearance and home-layout — every interaction in the design
// is driven through this context.

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RESULTS, type AyahItem } from "./data";
import { TOKENS, type Mode, type Tokens } from "./tokens";
import { isRTL } from "./lib/rtl";
import { translate } from "@/i18n";

const PREFS_KEY = "aq:prefs:v1";

export type Stage = "splash" | "onboarding" | "app";
export type Screen = "searchHome" | "results" | "reader" | "recite" | "facts" | "library" | "refList" | "about" | "saved" | "settings";
export type Tab = "search" | "recite" | "facts" | "library" | "saved" | "settings";
export type Appearance = "light" | "dark" | "system";
export type HomeLayout = "Chips" | "Grid";

const ROOT: Record<Tab, Screen> = { search: "searchHome", recite: "recite", facts: "facts", library: "library", saved: "saved", settings: "settings" };

export interface AQApi {
  stage: Stage;
  current: Screen;
  navKey: number;
  query: string;
  readerItem: AyahItem;
  factTab: string;
  appearance: Appearance;
  homeLayout: HomeLayout;
  /** Quran translation edition language (alias kept as `language` for callers). */
  language: string;
  appLanguage: string; // UI/interface language
  translationLanguage: string; // Quran translation edition language
  tafsirLanguage: string; // tafsir edition language (English fallback)
  lang: "en" | "ur";
  langSheetOpen: boolean;
  langSheetTarget: "app" | "translation" | "tafsir";
  surahSheetOpen: boolean;
  reciteSurah: number;
  refCollection: string | null;
  activeTab: Tab;
  canBack: boolean;
  hydrated: boolean;
  mode: Mode;
  tokens: Tokens;
  /** Translate an interface key in the current App language (English fallback). */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** True when the App (interface) language is right-to-left. */
  uiRTL: boolean;

  goOnboarding: () => void;
  finishOnboarding: () => void;
  goTab: (tab: Tab) => void;
  runSearch: (q: string) => void;
  openReader: (item: AyahItem) => void;
  openRef: (collectionId: string) => void;
  openAbout: () => void;
  back: () => void;
  setFactTab: (id: string) => void;
  setLanguage: (name: string) => void; // sets the translation language
  setAppLanguage: (name: string) => void;
  setTranslationLanguage: (name: string) => void;
  setTafsirLanguage: (name: string) => void;
  openLangSheet: (target?: "app" | "translation" | "tafsir") => void;
  closeLangSheet: () => void;
  openSurahSheet: () => void;
  closeSurahSheet: () => void;
  pickSurah: (n: number) => void;
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
  const [savedList, setSavedList] = useState<AyahItem[]>([]);
  const [navKey, setNavKey] = useState(0);
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [langSheetTarget, setLangSheetTarget] = useState<"app" | "translation" | "tafsir">("translation");
  const [surahSheetOpen, setSurahSheetOpen] = useState(false);
  const [reciteSurah, setReciteSurah] = useState(1);
  const [refCollection, setRefCollection] = useState<string | null>(null);
  // Three independent language preferences (all persisted).
  const [appLanguage, setAppLanguageState] = useState("English");
  const [translationLanguage, setTranslationLanguageState] = useState("English");
  const [tafsirLanguage, setTafsirLanguageState] = useState("English");
  const [homeLayout, setHomeLayout] = useState<HomeLayout>("Chips");
  const [hydrated, setHydrated] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  // Hydrate persisted preferences once on launch. While loading we stay on the
  // splash; if the user has onboarded before we go straight to the app.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFS_KEY);
        if (raw && alive) {
          const p = JSON.parse(raw) as Partial<{
            onboarded: boolean; language: string; appLanguage: string; translationLanguage: string; tafsirLanguage: string;
            appearance: Appearance; homeLayout: HomeLayout; savedList: AyahItem[];
          }>;
          // Migrate the old single `language` pref → translation language.
          const tr = p.translationLanguage ?? p.language;
          if (tr) setTranslationLanguageState(tr);
          if (p.appLanguage) setAppLanguageState(p.appLanguage);
          if (p.tafsirLanguage) setTafsirLanguageState(p.tafsirLanguage);
          else if (tr) setTafsirLanguageState(tr); // default tafsir → translation lang
          if (p.appearance) setAppearance(p.appearance);
          if (p.homeLayout) setHomeLayout(p.homeLayout);
          if (Array.isArray(p.savedList)) setSavedList(p.savedList);
          if (p.onboarded) { setOnboarded(true); setStage("app"); }
        }
      } catch {
        /* corrupt/empty prefs — start fresh */
      } finally {
        if (alive) setHydrated(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Persist preferences whenever they change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ onboarded, appLanguage, translationLanguage, tafsirLanguage, appearance, homeLayout, savedList })).catch(() => {});
  }, [hydrated, onboarded, appLanguage, translationLanguage, tafsirLanguage, appearance, homeLayout, savedList]);

  const language = translationLanguage; // alias: content callers use the translation language
  const lang: "en" | "ur" = translationLanguage === "Urdu" ? "ur" : "en";
  const mode: Mode = appearance === "system" ? (system === "dark" ? "dark" : "light") : appearance;
  const tokens = TOKENS[mode];
  const current = nav[nav.length - 1].screen;
  const activeTab = (Object.keys(ROOT) as Tab[]).find((k) => ROOT[k] === nav[0].screen) ?? "search";
  const bump = () => setNavKey((k) => k + 1);

  const api: AQApi = useMemo(
    () => ({
      stage, current, navKey, query, readerItem, factTab, appearance, homeLayout,
      language, appLanguage, translationLanguage, tafsirLanguage, lang, langSheetOpen, langSheetTarget, surahSheetOpen, reciteSurah, refCollection, activeTab, canBack: nav.length > 1, hydrated, mode, tokens,
      t: (key, vars) => translate(appLanguage, key, vars),
      uiRTL: isRTL(appLanguage),
      goOnboarding: () => setStage("onboarding"),
      finishOnboarding: () => { setOnboarded(true); setStage("app"); },
      goTab: (tab) => { setNav([{ screen: ROOT[tab] }]); bump(); },
      runSearch: (q) => { setQuery(q); setNav([{ screen: "searchHome" }, { screen: "results" }]); bump(); },
      openReader: (item) => { setReaderItem(item); setNav((n) => [...n, { screen: "reader" }]); bump(); },
      openRef: (collectionId) => { setRefCollection(collectionId); setNav((n) => [...n, { screen: "refList" }]); bump(); },
      openAbout: () => { setNav((n) => [...n, { screen: "about" }]); bump(); },
      back: () => { setNav((n) => (n.length > 1 ? n.slice(0, -1) : n)); bump(); },
      setFactTab,
      setLanguage: (name) => setTranslationLanguageState(name),
      setAppLanguage: (name) => setAppLanguageState(name),
      setTranslationLanguage: (name) => setTranslationLanguageState(name),
      setTafsirLanguage: (name) => setTafsirLanguageState(name),
      openLangSheet: (target = "translation") => { setLangSheetTarget(target); setLangSheetOpen(true); },
      closeLangSheet: () => setLangSheetOpen(false),
      openSurahSheet: () => setSurahSheetOpen(true),
      closeSurahSheet: () => setSurahSheetOpen(false),
      pickSurah: (n) => { setReciteSurah(n); setSurahSheetOpen(false); },
      setAppearance,
      setHomeLayout,
      isSaved: (ref) => savedList.some((s) => s.ref === ref),
      toggleSave: (item) =>
        setSavedList((list) => (list.some((s) => s.ref === item.ref) ? list.filter((s) => s.ref !== item.ref) : [item, ...list])),
      savedItems: savedList,
    }),
    [stage, query, readerItem, factTab, appearance, homeLayout, appLanguage, translationLanguage, tafsirLanguage, lang, langSheetOpen, langSheetTarget, surahSheetOpen, reciteSurah, refCollection, navKey, savedList, hydrated, onboarded, mode, tokens, nav],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
