// Right-to-left language handling, ported from the web frontend (lib/rtl.ts).
// Keyed by English language name (the same names used by the translation/tafsir
// editions and the LANGUAGES picker).

import { I18nManager } from "react-native";

// RN's swapLeftAndRightInRTL is ON, so under an RTL interface it flips any
// explicit textAlign "left"↔"right". App chrome relies on that swap (a bare
// "left" mirrors to the trailing edge). But fixed-direction CONTENT — an Arabic
// ayah, an Urdu translation — must sit on a specific PHYSICAL edge regardless of
// the interface direction. These helpers express the physical edge we want and
// pre-compensate for the swap, so the value is correct in both an English (LTR)
// and an Urdu (RTL) interface.
/** textAlign that always lands on the physical right edge (Arabic/Urdu start). */
export function physicalRight(): "left" | "right" {
  return I18nManager.isRTL ? "left" : "right";
}
/** textAlign that always lands on the physical left edge (Latin start). */
export function physicalLeft(): "left" | "right" {
  return I18nManager.isRTL ? "right" : "left";
}
/** flexDirection that keeps a row's children in fixed PHYSICAL order (first child
 *  on the physical left) regardless of interface direction — under RTL a plain
 *  "row" mirrors children to the right, so we reverse to restore physical order. */
export function physicalRow(): "row" | "row-reverse" {
  return I18nManager.isRTL ? "row-reverse" : "row";
}

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
