import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchTranslations } from "@/api/client";
import { DEFAULT_TRANSLATION } from "@/config";
import type { TafsirMeta, TranslationMeta } from "@/types";

const LANG_KEY = "askquran_quran_language";
const TR_KEY = "askquran_translation";

function sortLanguages(langs: string[]): string[] {
  return [...langs].sort((a, b) => {
    if (a === "English") return -1;
    if (b === "English") return 1;
    return a.localeCompare(b);
  });
}

interface SettingsValue {
  translations: TranslationMeta[];
  tafsirs: TafsirMeta[];
  languages: string[];
  editionsForLanguage: TranslationMeta[];
  tafsirsForLanguage: TafsirMeta[];
  language: string; // Quran translation language (English NAME)
  translation: string; // edition id
  tafsir: string; // "" = auto
  loading: boolean;
  error: string | null;
  changeLanguage: (lang: string) => void;
  changeTranslation: (id: string) => void;
  changeTafsir: (id: string) => void;
}

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [translations, setTranslations] = useState<TranslationMeta[]>([]);
  const [tafsirs, setTafsirs] = useState<TafsirMeta[]>([]);
  const [language, setLanguage] = useState("English");
  const [translation, setTranslation] = useState(DEFAULT_TRANSLATION);
  const [tafsir, setTafsir] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchTranslations();
        if (!active) return;
        setTranslations(data.translations);
        setTafsirs(data.tafsirs);
        const savedTr = await AsyncStorage.getItem(TR_KEY);
        const savedLang = await AsyncStorage.getItem(LANG_KEY);
        const initId =
          savedTr && data.translations.some((t) => t.id === savedTr) ? savedTr : data.default;
        const initEdition = data.translations.find((t) => t.id === initId);
        setTranslation(initId);
        setLanguage(savedLang || initEdition?.language || "English");
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load translations.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const languages = useMemo(
    () => sortLanguages([...new Set(translations.map((t) => t.language))]),
    [translations],
  );
  const editionsForLanguage = useMemo(
    () => translations.filter((t) => t.language === language),
    [translations, language],
  );
  const tafsirsForLanguage = useMemo(
    () => tafsirs.filter((t) => t.language === language),
    [tafsirs, language],
  );

  const changeTranslation = useCallback((id: string) => {
    setTranslation(id);
    AsyncStorage.setItem(TR_KEY, id).catch(() => {});
  }, []);

  const changeTafsir = useCallback((id: string) => setTafsir(id), []);

  const changeLanguage = useCallback(
    (lang: string) => {
      setLanguage(lang);
      AsyncStorage.setItem(LANG_KEY, lang).catch(() => {});
      const first = translations.find((t) => t.language === lang);
      const id = first ? first.id : translation;
      setTranslation(id);
      AsyncStorage.setItem(TR_KEY, id).catch(() => {});
      setTafsir(""); // tafsir must match the language; reset to auto
    },
    [translations, translation],
  );

  const value = useMemo<SettingsValue>(
    () => ({
      translations,
      tafsirs,
      languages,
      editionsForLanguage,
      tafsirsForLanguage,
      language,
      translation,
      tafsir,
      loading,
      error,
      changeLanguage,
      changeTranslation,
      changeTafsir,
    }),
    [
      translations,
      tafsirs,
      languages,
      editionsForLanguage,
      tafsirsForLanguage,
      language,
      translation,
      tafsir,
      loading,
      error,
      changeLanguage,
      changeTranslation,
      changeTafsir,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within <SettingsProvider>");
  return ctx;
}
