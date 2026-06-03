// Right-to-left language handling, ported from the web frontend (lib/rtl.ts).
// Keyed by English language name (the same names used by the translation/tafsir
// editions and the LANGUAGES picker).

const RTL_LANGUAGES = new Set([
  "Arabic",
  "Persian",
  "Urdu",
  "Pashto",
  "Sindhi",
  "Divehi",
  "Uyghur",
  "Kurdish",
]);

export function isRTL(language: string): boolean {
  return RTL_LANGUAGES.has(language);
}

/** Which script/direction a translation block should render in. */
export type ScriptKind = "ur" | "rtl" | "ltr";
export function scriptKind(language: string): ScriptKind {
  if (language === "Urdu") return "ur"; // Nastaliq
  if (isRTL(language)) return "rtl"; // other Arabic-script / RTL
  return "ltr";
}
