// Languages written right-to-left in the dataset (by English language name).
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

/** CSS class for a translation/neighbour block based on its language. */
export function scriptClass(language: string): string {
  if (language === "Urdu") return "ur";
  if (isRTL(language)) return "rtl";
  return "";
}
