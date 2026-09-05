// Content-driven UI typography resolver. The interface chrome is styled with the
// Latin-only brand families (Plus Jakarta Sans / Newsreader). Those fonts carry
// no glyphs for the ~30 non-Latin UI languages (Arabic, Urdu, Bengali, Hindi,
// Tamil, Thai, CJK, Cyrillic, Amharic, …), so on those scripts the OS silently
// falls back to a system font — losing the brand weight and, where a Latin-tuned
// `lineHeight` is set, clipping tall scripts.
//
// This module fixes that WITHOUT bundling 30 fonts: given a flattened text style
// and the literal string it will render, it detects the script of the *glyphs*
// (not the app language — the three language prefs are independent) and, only
// when a Latin brand font is about to render non-Latin text, returns a corrected
// style: Arabic-script → Amiri, Urdu → Nastaliq, everything else → the system
// font with the brand weight preserved as numeric `fontWeight`, plus a
// script-appropriate `lineHeight` so nothing overlaps. Pure + unit-tested; the
// thin <AppText> component is the only caller.

import { FONTS } from "../tokens";

/** A minimal style shape (subset of RN TextStyle) — kept local so this module
 *  stays free of react-native imports and remains node-testable. */
export interface UiTextStyle {
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  fontWeight?: string | number;
  [k: string]: unknown;
}

export type UiScript = "latin" | "arabic" | "urdu" | "other";

// Whether the app interface language is Urdu. Set once on hydrate and on every
// language change (AQContext.applyUiDirection); read by <AppText> so chrome words
// that use only Arabic-shared letters still resolve to Nastaliq under an Urdu UI.
let _uiIsUrdu = false;
export function setUiIsUrdu(v: boolean): void { _uiIsUrdu = v; }
export function getUiIsUrdu(): boolean { return _uiIsUrdu; }

const BRAND_FONT_RE = /^(PlusJakartaSans|Newsreader)/;

/** True for the Latin-only brand families. Only these get remapped; content text
 *  already set to Amiri/Nastaliq/serif is left untouched. */
export function isBrandFont(family?: string): boolean {
  return typeof family === "string" && BRAND_FONT_RE.test(family);
}

/** Recover the numeric weight encoded in a brand family name. */
export function weightFromFamily(family: string): 400 | 500 | 600 | 700 | 800 {
  if (family.includes("800")) return 800;
  if (family.includes("700")) return 700;
  if (family.includes("600")) return 600;
  if (family.includes("500")) return 500;
  return 400;
}

// Urdu-specific Perso-Arabic letters that Persian/Arabic do not use — a strong
// signal to render in Nastaliq rather than Amiri.
const URDU_CHARS = new Set([0x06d2, 0x06d3, 0x06ba, 0x06bb, 0x06be, 0x06c1, 0x06c3, 0x0679, 0x0688, 0x0691]);

function isLatinOrNeutral(cp: number): boolean {
  // Basic Latin, Latin-1, Latin Extended-A/B, IPA/modifier letters (…0x02FF),
  // plus general punctuation / currency / number forms / arrows the brand fonts
  // cover. Anything outside these is treated as needing a script-aware font.
  if (cp <= 0x02ff) return true;
  if (cp >= 0x2000 && cp <= 0x206f) return true; // general punctuation
  if (cp >= 0x20a0 && cp <= 0x20cf) return true; // currency symbols
  if (cp >= 0x2100 && cp <= 0x214f) return true; // letterlike symbols
  if (cp >= 0x2190 && cp <= 0x21ff) return true; // arrows (→ used in chrome)
  return false;
}

function isArabicBlock(cp: number): boolean {
  return (
    (cp >= 0x0600 && cp <= 0x06ff) || // Arabic
    (cp >= 0x0750 && cp <= 0x077f) || // Arabic Supplement
    (cp >= 0x08a0 && cp <= 0x08ff) || // Arabic Extended-A
    (cp >= 0xfb50 && cp <= 0xfdff) || // Presentation Forms-A
    (cp >= 0xfe70 && cp <= 0xfeff)    // Presentation Forms-B
  );
}

/** Classify a string by the script its glyphs belong to. A UI string is single-
 *  language in practice; priority is urdu → arabic → other → latin. */
export function detectScript(text: string): UiScript {
  let hasUrdu = false;
  let hasArabic = false;
  let hasOther = false;
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (isLatinOrNeutral(cp)) continue;
    if (isArabicBlock(cp)) {
      if (URDU_CHARS.has(cp)) hasUrdu = true;
      else hasArabic = true;
    } else {
      hasOther = true;
    }
  }
  if (hasUrdu) return "urdu";
  if (hasArabic) return "arabic";
  if (hasOther) return "other";
  return "latin";
}

// Minimum line-height as a multiple of font size, per script, so tall marks /
// Nastaliq descenders never clip or overlap. Latin keeps the design's values.
const LH_FACTOR: Record<Exclude<UiScript, "latin">, number> = { urdu: 2.0, arabic: 1.7, other: 1.45 };

/** A line-height that clears the script, or undefined when the existing one is
 *  already tall enough (we never shrink the design's spacing). */
export function lineHeightFor(script: Exclude<UiScript, "latin">, fontSize?: number, current?: number): number | undefined {
  if (typeof fontSize !== "number") return undefined;
  const needed = Math.round(fontSize * LH_FACTOR[script]);
  if (typeof current === "number" && current >= needed) return undefined;
  return needed;
}

/** Font + weight patch for a non-Latin script at a given brand weight. */
export function remapFont(script: Exclude<UiScript, "latin">, weight: number): { fontFamily?: string; fontWeight?: string } {
  if (script === "urdu") return { fontFamily: weight >= 500 ? FONTS.ur[500] : FONTS.ur[400] };
  if (script === "arabic") return { fontFamily: FONTS.ar };
  // "other": drop the brand family so the OS Noto fallback renders the glyph,
  // and carry the brand weight forward so hierarchy survives.
  return { fontFamily: undefined, fontWeight: String(weight) };
}

/**
 * Given a flattened style and the text it will render, return a corrected style
 * object (a full replacement, brand fontFamily resolved/removed) — or null when
 * no change is needed (Latin text, or a non-brand/content font). The caller
 * passes the returned object straight to <Text style=…>.
 */
export function applyUiFont(style: UiTextStyle, text: string, uiIsUrdu = false): UiTextStyle | null {
  if (!isBrandFont(style.fontFamily)) return null;
  let script = detectScript(text);
  if (script === "latin") return null;
  // Chrome is the only text that reaches here (content carries an explicit
  // Amiri/Nastaliq/serif family). Its language is the app interface language, so
  // when that is Urdu a word built only from letters shared with Arabic (e.g.
  // "تلاش", "حقائق") is still Urdu — render it Nastaliq so the whole UI is one
  // script, not a mix of Nastaliq and naskh at visibly different sizes.
  if (script === "arabic" && uiIsUrdu) script = "urdu";

  const weight = weightFromFamily(style.fontFamily!);
  const patch = remapFont(script, weight);
  const lh = lineHeightFor(script, style.fontSize, style.lineHeight);

  const out: UiTextStyle = { ...style, ...patch };
  if (patch.fontFamily === undefined) delete out.fontFamily; // array-merge can't unset; flatten here
  if (lh !== undefined) out.lineHeight = lh;
  return out;
}
