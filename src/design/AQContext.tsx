// Central app state + theme, ported from the prototype's App()/useApp model in
// aq-app.jsx. Holds the navigation stack, search query, reader target, saved
// list, language, appearance and home-layout — every interaction in the design
// is driven through this context.

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppState, DevSettings, I18nManager, useColorScheme } from "react-native";
import * as Updates from "expo-updates";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RESULTS, type AyahItem } from "./data";
import { TOKENS, type Mode, type Tokens } from "./tokens";
import { isRTL } from "./lib/rtl";
import { pageStartRef, QPC_PAGE_COUNT } from "../quran/qpcIndex";
import { syncDailyVerse, type DailyVerseSettings } from "@/notifications/dailyVerse";
import { evaluateResult, type QuizResult, type QuizOutcome } from "./lib/quizBadges";
import { setUiIsUrdu } from "./lib/uiType";
import { translate } from "@/i18n";
import { track } from "@/analytics";
import { screenName, surahName } from "@/analytics/events";

const PREFS_KEY = "aq:prefs:v1";

export type Stage = "splash" | "onboarding" | "app";
export type Screen = "searchHome" | "results" | "reader" | "recite" | "facts" | "library" | "refList" | "passage" | "about" | "privacy" | "dataSafety" | "saved" | "settings" | "fonttest" | "quiz" | "plan";

/** A reference card's passage opened as its own page (Arabic + transliteration +
 *  translation, with per-ayah tafsir on request). `refs` are S:A-B ranges. */
export interface PassageTarget {
  refs: string[];
  mainRefs?: string[];
  title: string;
  subtitle?: string;
  showTafsir: boolean;
  mainBadge?: boolean;
}
export type Tab = "search" | "recite" | "facts" | "library" | "saved" | "settings";
export type Appearance = "light" | "dark" | "system";
export type HomeLayout = "Chips" | "Grid";
/** Recite reading mode: "list" = By Ayah (cards), "flow" = By Surah (mushaf). */
export type ReciteView = "list" | "flow";
/** Last recitation spot — restored on return so the user resumes where they left. */
export interface RecitePosition { surah: number; ayah: number; }

/** A read-the-whole-Quran plan (khatm), tracked by PAGE of the 604-page Madinah
 *  mushaf. `pagesRead` is a contiguous cursor from page 1; the daily target is
 *  `pagesPerDay` (from a preset or a custom amount). The streak counts consecutive
 *  calendar days with any reading. */
export interface KhatmPlan {
  startedAt: number;          // epoch ms when the plan was started
  pagesPerDay: number;        // daily target (1..604)
  pagesRead: number;          // pages completed so far (0..604), contiguous from p1
  lastReadDay: string | null; // local "YYYY-MM-DD" of the last reading (for streak)
  streak: number;             // consecutive-day streak
}

export type { DailyVerseSettings } from "@/notifications/dailyVerse";
export type { QuizResult, QuizOutcome } from "./lib/quizBadges";
const DEFAULT_DAILY_VERSE: DailyVerseSettings = { enabled: false, hour: 7, minute: 0 };
const QUIZ_HISTORY_CAP = 200;

/** Local calendar day as "YYYY-MM-DD" (used for the reading streak). */
function dayStr(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dd}`;
}

const ROOT: Record<Tab, Screen> = { search: "searchHome", recite: "recite", facts: "facts", library: "library", saved: "saved", settings: "settings" };

/** Align the native layout direction with the App (interface) language. RN only
 *  mirrors the whole view tree when the JS bundle (re)initialises, so flipping
 *  `I18nManager.forceRTL` writes the native pref but has NO visible effect on the
 *  already-rendered session — it applies on the next (re)launch.
 *
 *  Whenever we detect a mismatch (`I18nManager.isRTL !== isRTL(appLanguage)`) the
 *  current session is therefore rendering the WRONG direction, and we relaunch to
 *  apply the flip. This covers both triggers identically:
 *    • active switch: the user changed language — relaunch now.
 *    • cold-start hydration: the persisted language disagreed with the native
 *      direction (e.g. a previous switch was killed before its relaunch landed).
 *      Skipping the reload here left the whole session mirrored-wrong (Urdu text
 *      but LTR container) — the bug this self-heals.
 *
 *  `reloadAsync` performs a REAL native restart even when remote updates are
 *  disabled (`EXUpdatesEnabled=false`) — it only rejects under a dev/Metro
 *  client — so the relaunch works in any release build on both iOS and Android.
 *  In dev we skip it; a manual app restart applies the (now-set) flag there.
 *  Content direction (Arabic/translation/tafsir) is handled per-element already. */
function applyUiDirection(appLanguage: string): void {
  setUiIsUrdu(appLanguage === "Urdu"); // chrome Nastaliq hint for <AppText>
  const rtl = isRTL(appLanguage);
  if (I18nManager.isRTL === rtl) return; // already aligned — nothing to do
  try {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(rtl);
  } catch {
    return; // no-op on web (no native I18nManager)
  }
  // A real relaunch applies the flip and self-heals: after the restart
  // `isRTL === rtl`, so the top guard returns early — no loop, and aligned cold
  // starts never reach here. The normal persist effect runs asynchronously AFTER
  // this turn, which would race the reload and bring the app back in the OLD
  // language — so we persist the new app language synchronously (read-modify-
  // write) BEFORE reloading.
  void (async () => {
    try {
      const raw = await AsyncStorage.getItem(PREFS_KEY);
      const prev = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ ...prev, appLanguage }));
    } catch {
      /* persisting failed — reload anyway; worst case the flip re-applies next launch */
    }
    // Reload to re-init the JS bundle so I18nManager picks up the new direction.
    // In dev, `Updates.reloadAsync` rejects under the Metro client, so we drive
    // the reload through DevSettings instead — which mirrors the tree live rather
    // than leaving a half-flipped session (Urdu text but LTR container). In a
    // release build `reloadAsync` performs the real native restart.
    if (__DEV__) {
      DevSettings.reload();
      return;
    }
    await Updates.reloadAsync().catch(() => {});
  })();
}

export interface AQApi {
  stage: Stage;
  current: Screen;
  navKey: number;
  query: string;
  readerItem: AyahItem;
  factTab: string;
  appearance: Appearance;
  homeLayout: HomeLayout;
  reciteView: ReciteView;
  /** True while Recite audio is playing — lets the shell hide chrome (tab bar) for room. */
  recitePlaying: boolean;
  setRecitePlaying: (v: boolean) => void;
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
  recitePosition: RecitePosition | null;
  khatm: KhatmPlan | null;
  /** Lifetime count of full Quran readings completed (khatams). */
  khatmCompletions: number;
  dailyVerse: DailyVerseSettings;
  quizResults: QuizResult[];
  refCollection: string | null;
  passageTarget: PassageTarget | null;
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
  openPassage: (target: PassageTarget) => void;
  openAbout: () => void;
  openPrivacy: () => void;
  openQuiz: () => void;
  openPlan: () => void;
  openDataSafety: () => void;
  openFontTest: () => void;
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
  /** Record the spot the reciter just reached, so it can be resumed later. */
  saveRecitePosition: (surah: number, ayah: number) => void;
  /** Start a fresh khatm reading `pagesPerDay` pages a day (from a preset or custom). */
  startKhatm: (pagesPerDay: number) => void;
  /** Mark today's portion read — advance the page cursor by one day's target,
   *  bumping the streak on a new calendar day. */
  markDayRead: () => void;
  /** Set the page cursor directly (0..604) — e.g. manual adjust; no streak change. */
  setPagesRead: (pages: number) => void;
  /** Abandon the current plan. */
  resetKhatm: () => void;
  /** Jump Recite to the start of the next unread page of the active plan. */
  continueKhatm: () => void;
  /** Update Daily-Verse notification settings (merges into the current value). */
  setDailyVerse: (patch: Partial<DailyVerseSettings>) => void;
  /** Record a finished quiz; returns improvement + newly-earned badges for the result screen. */
  recordQuizResult: (category: string, difficulty: string, score: number, total: number) => QuizOutcome;
  setAppearance: (v: Appearance) => void;
  setHomeLayout: (v: HomeLayout) => void;
  setReciteView: (v: ReciteView) => void;
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
  const [recitePosition, setRecitePosition] = useState<RecitePosition | null>(null);
  const [khatm, setKhatm] = useState<KhatmPlan | null>(null);
  const [khatmCompletions, setKhatmCompletions] = useState(0); // lifetime full readings completed
  const [dailyVerse, setDailyVerseState] = useState<DailyVerseSettings>(DEFAULT_DAILY_VERSE);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [refCollection, setRefCollection] = useState<string | null>(null);
  const [passageTarget, setPassageTarget] = useState<PassageTarget | null>(null);
  // Three independent language preferences (all persisted).
  const [appLanguage, setAppLanguageState] = useState("English");
  const [translationLanguage, setTranslationLanguageState] = useState("English");
  const [tafsirLanguage, setTafsirLanguageState] = useState("English");
  const [homeLayout, setHomeLayout] = useState<HomeLayout>("Chips");
  const [reciteView, setReciteView] = useState<ReciteView>("flow"); // recite locked to By-Surah (2026-06-18)
  const [recitePlaying, setRecitePlaying] = useState(false); // ephemeral — not persisted
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
            appearance: Appearance; homeLayout: HomeLayout; reciteView: ReciteView; savedList: AyahItem[];
            recitePosition: RecitePosition; khatm: KhatmPlan; khatmCompletions: number; dailyVerse: DailyVerseSettings; quizResults: QuizResult[];
          }>;
          // Migrate the old single `language` pref → translation language.
          const tr = p.translationLanguage ?? p.language;
          if (tr) setTranslationLanguageState(tr);
          if (p.appLanguage) { setAppLanguageState(p.appLanguage); applyUiDirection(p.appLanguage); }
          if (p.tafsirLanguage) setTafsirLanguageState(p.tafsirLanguage);
          else if (tr) setTafsirLanguageState(tr); // default tafsir → translation lang
          if (p.appearance) setAppearance(p.appearance);
          if (p.homeLayout) setHomeLayout(p.homeLayout);
          if (p.reciteView) setReciteView(p.reciteView);
          // Restore the last recitation spot and open straight onto that surah, so
          // a returning user resumes where they left off (the ayah is re-highlighted
          // by the Recite screen once its verses load).
          if (p.recitePosition && typeof p.recitePosition.surah === "number" && typeof p.recitePosition.ayah === "number") {
            setRecitePosition(p.recitePosition);
            setReciteSurah(p.recitePosition.surah);
          }
          if (p.khatm && typeof (p.khatm as { startedAt?: unknown }).startedAt === "number") {
            const kh = p.khatm as unknown as Record<string, unknown>;
            const clampInt = (v: unknown, lo: number, hi: number, fb: number) =>
              typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : fb;
            const base = {
              startedAt: kh.startedAt as number,
              lastReadDay: typeof kh.lastReadDay === "string" ? (kh.lastReadDay as string) : null,
              streak: typeof kh.streak === "number" ? (kh.streak as number) : 0,
            };
            if (typeof kh.pagesPerDay === "number") {
              // current (page-based) shape
              setKhatm({ ...base, pagesPerDay: clampInt(kh.pagesPerDay, 1, QPC_PAGE_COUNT, 21), pagesRead: clampInt(kh.pagesRead, 0, QPC_PAGE_COUNT, 0) });
            } else if (kh.kind === "30" || kh.kind === "60" || kh.kind === "365") {
              // migrate legacy juzʼ-based plan → pages
              const days = Number(kh.kind);
              const juzDone = Array.isArray(kh.completedJuz) ? (kh.completedJuz as unknown[]).length : 0;
              setKhatm({ ...base, pagesPerDay: Math.ceil(QPC_PAGE_COUNT / days), pagesRead: Math.round((juzDone / 30) * QPC_PAGE_COUNT) });
            }
          }
          if (typeof p.khatmCompletions === "number" && p.khatmCompletions >= 0) setKhatmCompletions(Math.round(p.khatmCompletions));
          if (p.dailyVerse && typeof p.dailyVerse.enabled === "boolean" && typeof p.dailyVerse.hour === "number" && typeof p.dailyVerse.minute === "number") {
            setDailyVerseState({ enabled: p.dailyVerse.enabled, hour: p.dailyVerse.hour, minute: p.dailyVerse.minute });
          }
          if (Array.isArray(p.quizResults)) {
            setQuizResults(p.quizResults.filter((q) => q && typeof q.score === "number" && typeof q.total === "number"));
          }
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
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ onboarded, appLanguage, translationLanguage, tafsirLanguage, appearance, homeLayout, reciteView, savedList, recitePosition, khatm, khatmCompletions, dailyVerse, quizResults })).catch(() => {});
  }, [hydrated, onboarded, appLanguage, translationLanguage, tafsirLanguage, appearance, homeLayout, reciteView, savedList, recitePosition, khatm, khatmCompletions, dailyVerse, quizResults]);

  // Reconcile Daily-Verse local notifications after hydration and whenever the
  // setting or translation language changes; also re-sync on each foreground so
  // the rolling window stays topped up. Best-effort — syncDailyVerse never throws.
  useEffect(() => {
    if (!hydrated) return;
    void syncDailyVerse({ ...dailyVerse, translationLanguage });
  }, [hydrated, dailyVerse, translationLanguage]);

  useEffect(() => {
    if (!hydrated || !dailyVerse.enabled) return;
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") void syncDailyVerse({ ...dailyVerse, translationLanguage });
    });
    return () => sub.remove();
  }, [hydrated, dailyVerse, translationLanguage]);

  // --- xNotify analytics: app_open (cold start + each foreground), screen_view
  // on each navigation. track() is a no-op unless an Event Key is configured, so
  // these are safe to leave in unconditionally.
  useEffect(() => {
    if (hydrated) {
      // First reveal of this launch = a cold start. platform + app_version are
      // auto-merged into every event by the tracker, so we only add `source`.
      track("app_open", { source: "cold_start", onboarded });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Re-fire app_open whenever the app returns to the foreground (source:
  // "background"). RN delivers "active" on the initial mount too, so we ignore
  // the very first transition to avoid double-counting the cold start above.
  useEffect(() => {
    let last = AppState.currentState;
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active" && last.match(/inactive|background/)) {
        track("app_open", { source: "background", onboarded });
      }
      last = next;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarded]);

  const screen = nav[nav.length - 1].screen;
  const rootScreen = nav[0].screen;
  useEffect(() => {
    if (stage !== "app") return;
    const tab = (Object.keys(ROOT) as Tab[]).find((k) => ROOT[k] === rootScreen) ?? "search";
    track("screen_view", { screen_name: screenName(screen, refCollection), screen, tab });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navKey, stage]);

  const language = translationLanguage; // alias: content callers use the translation language
  const lang: "en" | "ur" = translationLanguage === "Urdu" ? "ur" : "en";
  const mode: Mode = appearance === "system" ? (system === "dark" ? "dark" : "light") : appearance;
  const tokens = TOKENS[mode];
  const current = nav[nav.length - 1].screen;
  const activeTab = (Object.keys(ROOT) as Tab[]).find((k) => ROOT[k] === nav[0].screen) ?? "search";
  const bump = () => setNavKey((k) => k + 1);

  const api: AQApi = useMemo(
    () => ({
      stage, current, navKey, query, readerItem, factTab, appearance, homeLayout, reciteView, recitePlaying, setRecitePlaying,
      language, appLanguage, translationLanguage, tafsirLanguage, lang, langSheetOpen, langSheetTarget, surahSheetOpen, reciteSurah, recitePosition, khatm, khatmCompletions, dailyVerse, quizResults, refCollection, passageTarget, activeTab, canBack: nav.length > 1, hydrated, mode, tokens,
      t: (key, vars) => translate(appLanguage, key, vars),
      uiRTL: isRTL(appLanguage),
      goOnboarding: () => setStage("onboarding"),
      finishOnboarding: () => { setOnboarded(true); setStage("app"); track("onboarding_complete", { app_language: appLanguage, translation_language: translationLanguage }); },
      goTab: (tab) => { setNav([{ screen: ROOT[tab] }]); bump(); },
      // The `search` / `search_no_results` events fire in the Results screen once
      // ask() resolves, so result_count is known — not here at navigation time.
      runSearch: (q) => { setQuery(q); setNav([{ screen: "searchHome" }, { screen: "results" }]); bump(); },
      openReader: (item) => { setReaderItem(item); setNav((n) => [...n, { screen: "reader" }]); bump(); track("view_ayah", { ref: item.ref }); },
      openRef: (collectionId) => { setRefCollection(collectionId); setNav((n) => [...n, { screen: "refList" }]); bump(); track("open_collection", { collection_id: collectionId }); },
      openPassage: (target) => { setPassageTarget(target); setNav((n) => [...n, { screen: "passage" }]); bump(); track("view_passage", { title: target.title, ref_count: target.refs?.length ?? 0 }); },
      openAbout: () => { setNav((n) => [...n, { screen: "about" }]); bump(); },
      openPrivacy: () => { setNav((n) => [...n, { screen: "privacy" }]); bump(); },
      openQuiz: () => { setNav((n) => [...n, { screen: "quiz" }]); bump(); },
      openPlan: () => { setNav((n) => [...n, { screen: "plan" }]); bump(); track("open_plan", {}); },
      openDataSafety: () => { setNav((n) => [...n, { screen: "dataSafety" }]); bump(); },
      openFontTest: () => { setNav((n) => [...n, { screen: "fonttest" }]); bump(); },
      back: () => { setNav((n) => (n.length > 1 ? n.slice(0, -1) : n)); bump(); },
      setFactTab,
      setLanguage: (name) => {
        if (name !== translationLanguage) track("translation_changed", { from_translation: translationLanguage, to_translation: name });
        setTranslationLanguageState(name);
      },
      setAppLanguage: (name) => {
        // UI/interface language switch → language_changed (type: "ui").
        if (name !== appLanguage) track("language_changed", { from_language: appLanguage, to_language: name, type: "ui" });
        setAppLanguageState(name);
        applyUiDirection(name);
      },
      setTranslationLanguage: (name) => {
        if (name !== translationLanguage) track("translation_changed", { from_translation: translationLanguage, to_translation: name });
        setTranslationLanguageState(name);
      },
      setTafsirLanguage: (name) => setTafsirLanguageState(name),
      openLangSheet: (target = "translation") => { setLangSheetTarget(target); setLangSheetOpen(true); },
      closeLangSheet: () => setLangSheetOpen(false),
      openSurahSheet: () => setSurahSheetOpen(true),
      closeSurahSheet: () => setSurahSheetOpen(false),
      pickSurah: (n) => { setReciteSurah(n); setSurahSheetOpen(false); },
      saveRecitePosition: (surah, ayah) => setRecitePosition((p) => (p && p.surah === surah && p.ayah === ayah ? p : { surah, ayah })),
      startKhatm: (pagesPerDay) => {
        const ppd = Math.min(QPC_PAGE_COUNT, Math.max(1, Math.round(pagesPerDay)));
        setKhatm({ startedAt: Date.now(), pagesPerDay: ppd, pagesRead: 0, lastReadDay: null, streak: 0 });
        track("khatm_start", { pagesPerDay: ppd });
      },
      markDayRead: () => {
        if (!khatm) return;
        const before = khatm.pagesRead;
        const pagesRead = Math.min(QPC_PAGE_COUNT, before + khatm.pagesPerDay);
        if (pagesRead === before) return; // already finished
        // Advance the streak once per calendar day.
        let { lastReadDay, streak } = khatm;
        const today = dayStr();
        if (lastReadDay !== today) {
          const yest = dayStr(new Date(Date.now() - 86400000));
          streak = lastReadDay === yest ? streak + 1 : 1;
          lastReadDay = today;
        }
        setKhatm({ ...khatm, pagesRead, lastReadDay, streak });
        if (before < QPC_PAGE_COUNT && pagesRead >= QPC_PAGE_COUNT) {
          setKhatmCompletions((c) => c + 1); // finished a full reading
          track("khatm_complete", {});
        }
        track("khatm_day_read", {});
      },
      setPagesRead: (pages) => {
        if (!khatm) return;
        const pagesRead = Math.min(QPC_PAGE_COUNT, Math.max(0, Math.round(pages)));
        const wasComplete = khatm.pagesRead >= QPC_PAGE_COUNT;
        setKhatm({ ...khatm, pagesRead });
        if (!wasComplete && pagesRead >= QPC_PAGE_COUNT) setKhatmCompletions((c) => c + 1);
      },
      resetKhatm: () => { setKhatm(null); track("khatm_reset", {}); },
      continueKhatm: () => {
        const nextPage = Math.min(QPC_PAGE_COUNT, (khatm?.pagesRead ?? 0) + 1);
        const start = pageStartRef(nextPage);
        setReciteSurah(start.surah);
        setRecitePosition({ surah: start.surah, ayah: start.ayah });
        setNav([{ screen: "recite" }]);
        bump();
        track("khatm_continue", { page: nextPage });
      },
      setDailyVerse: (patch) => {
        setDailyVerseState((d) => {
          const nextV = { ...d, ...patch };
          if (patch.enabled === true && !d.enabled) track("daily_verse_enable", { hour: nextV.hour });
          else if (patch.enabled === false && d.enabled) track("daily_verse_disable", {});
          return nextV;
        });
      },
      recordQuizResult: (category, difficulty, score, total) => {
        const fresh: QuizResult = { ts: Date.now(), category, difficulty, score, total };
        const outcome = evaluateResult(quizResults, fresh);
        setQuizResults((prev) => [fresh, ...prev].slice(0, QUIZ_HISTORY_CAP));
        track("quiz_complete", { category, difficulty, score, total, pct: outcome.pct, personal_best: outcome.isPersonalBest, new_badges: outcome.newBadges.length });
        return outcome;
      },
      setAppearance,
      setHomeLayout,
      setReciteView,
      isSaved: (ref) => savedList.some((s) => s.ref === ref),
      toggleSave: (item) => {
        const exists = savedList.some((s) => s.ref === item.ref);
        track("ayah_bookmarked", { surah_name: surahName(item.surah), ayah_no: item.ref, action: exists ? "remove" : "add" });
        setSavedList((list) => (list.some((s) => s.ref === item.ref) ? list.filter((s) => s.ref !== item.ref) : [item, ...list]));
      },
      savedItems: savedList,
    }),
    [stage, query, readerItem, factTab, appearance, homeLayout, reciteView, recitePlaying, appLanguage, translationLanguage, tafsirLanguage, lang, langSheetOpen, langSheetTarget, surahSheetOpen, reciteSurah, recitePosition, khatm, khatmCompletions, dailyVerse, quizResults, refCollection, passageTarget, navKey, savedList, hydrated, onboarded, mode, tokens, nav],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
