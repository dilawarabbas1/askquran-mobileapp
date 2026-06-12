// Right-to-left language handling, ported from the web frontend (lib/rtl.ts).
// Keyed by English language name (the same names used by the translation/tafsir
// editions and the LANGUAGES picker).

// Only languages this app actually SHIPS in a right-to-left script belong here —
// the flag drives whole-layout mirroring (I18nManager.forceRTL) and translation
// block direction, so a wrong entry mirrors the entire UI the wrong way. NOTE:
// "Kurdish" is deliberately absent — our Kurdish edition is Kurmanji (Latin,
// native "Kurdî", LTR catalog), not Sorani; flagging it RTL mirrored the app.
const RTL_LANGUAGES = new Set([
  "Arabic",
  "Persian",
  "Urdu",
  "Pashto",
  "Sindhi",
  "Divehi",
  "Uyghur",
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
