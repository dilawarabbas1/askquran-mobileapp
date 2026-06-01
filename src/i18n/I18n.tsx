import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { I18nManager } from "react-native";
import { isRTL } from "@/lib/rtl";
import { BASE_LANG, hasCatalog, translate } from "./index";

const STORAGE_KEY = "askquran_ui_lang";

// Map a few common device locale codes → the app's English language NAMES, so a
// first launch defaults to the user's language when a catalog exists.
const CODE_TO_NAME: Record<string, string> = {
  en: "English",
  ar: "Arabic",
  ur: "Urdu",
  fa: "Persian",
  tr: "Turkish",
  id: "Indonesian",
  ms: "Malay",
  fr: "French",
  de: "German",
  es: "Spanish",
  ru: "Russian",
  bn: "Bengali",
  hi: "Hindi",
  nl: "Dutch",
};

function deviceDefaultLang(): string {
  const code = Localization.getLocales?.()[0]?.languageCode?.toLowerCase() ?? "en";
  const name = CODE_TO_NAME[code];
  return name && hasCatalog(name) ? name : BASE_LANG;
}

interface I18nValue {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  rtl: boolean;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<string>(BASE_LANG);

  // Load the persisted UI language (or the device default) once on mount.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (active) setLangState(saved || deviceDefaultLang());
    });
    return () => {
      active = false;
    };
  }, []);

  const setLang = useCallback((next: string) => {
    setLangState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  // Keep the native layout direction in sync for RTL interface languages. RN
  // applies forceRTL on next reload; we set it best-effort (Quran Arabic always
  // renders RTL via its own writingDirection regardless of this).
  const rtl = isRTL(lang);
  useEffect(() => {
    if (I18nManager.isRTL !== rtl) {
      try {
        I18nManager.allowRTL(rtl);
        I18nManager.forceRTL(rtl);
      } catch {
        /* no-op on platforms that disallow runtime change */
      }
    }
  }, [rtl]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  );

  const value = useMemo<I18nValue>(() => ({ lang, setLang, t, rtl }), [lang, setLang, t, rtl]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}
