// Static map: English language name -> endonym (native name). Reference data
// for display only — the dropdown value stays the English name used to filter
// editions. Covers the 44 languages present in the Tanzil dataset.
const NATIVE_NAMES: Record<string, string> = {
  English: "English",
  Arabic: "العربية",
  Persian: "فارسی",
  Turkish: "Türkçe",
  Russian: "Русский",
  Urdu: "اردو",
  German: "Deutsch",
  Albanian: "Shqip",
  Dutch: "Nederlands",
  Indonesian: "Bahasa Indonesia",
  Spanish: "Español",
  Azerbaijani: "Azərbaycan",
  Bengali: "বাংলা",
  Bosnian: "Bosanski",
  Chinese: "中文",
  Czech: "Čeština",
  Hindi: "हिन्दी",
  Malayalam: "മലയാളം",
  Amazigh: "Tamaziɣt",
  Amharic: "አማርኛ",
  Bulgarian: "Български",
  Divehi: "ދިވެހި",
  French: "Français",
  Hausa: "Hausa",
  Italian: "Italiano",
  Japanese: "日本語",
  Korean: "한국어",
  Kurdish: "Kurdî",
  Malay: "Bahasa Melayu",
  Norwegian: "Norsk",
  Pashto: "پښتو",
  Polish: "Polski",
  Portuguese: "Português",
  Romanian: "Română",
  Sindhi: "سنڌي",
  Somali: "Soomaali",
  Swahili: "Kiswahili",
  Swedish: "Svenska",
  Tajik: "Тоҷикӣ",
  Tamil: "தமிழ்",
  Tatar: "Татарча",
  Thai: "ไทย",
  Uyghur: "ئۇيغۇرچە",
  Uzbek: "Oʻzbek",
};

/**
 * Display label for a language: "English Name (Native Name)".
 * Falls back to just the English name when no native name is known or it is
 * identical (e.g. English, Hausa).
 */
export function languageLabel(englishName: string): string {
  const native = NATIVE_NAMES[englishName];
  if (!native || native === englishName) return englishName;
  return `${englishName} (${native})`;
}

/** All UI-selectable language names (English first, then alphabetical). */
export const UI_LANGUAGES: string[] = [
  "English",
  ...Object.keys(NATIVE_NAMES)
    .filter((n) => n !== "English")
    .sort((a, b) => a.localeCompare(b)),
];
