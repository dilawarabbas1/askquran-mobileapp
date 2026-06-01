// UI-language (interface i18n) engine. Translates the app CHROME only — labels,
// buttons, headings. It never translates Quran, translation, or tafsir content
// (that is driven by the separate translation selector and is always verbatim).
//
// Catalogs are keyed by the English language NAME and loaded statically from
// ./catalogs (Metro has no import.meta.glob). English is the complete base /
// template; missing keys (or whole languages) fall back to English.

import { CATALOGS } from "./catalogs";

type Catalog = Record<string, string>;

export const BASE_LANG = "English";
const BASE: Catalog = CATALOGS[BASE_LANG] ?? {};

/** Language names that have a (full or partial) UI catalog file present. */
export function translatedLocales(): string[] {
  return Object.keys(CATALOGS);
}

/** Does this language have its own UI catalog file (vs. falling back to English)? */
export function hasCatalog(lang: string): boolean {
  return Boolean(CATALOGS[lang]);
}

/** Interpolate {placeholders} in a template string. */
function fill(tpl: string, vars?: Record<string, string | number>): string {
  if (!vars) return tpl;
  return tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/**
 * Translate a key for a language: language catalog → English base → the key
 * itself (so a missing key is visible rather than blank).
 */
export function translate(
  lang: string,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const cat = CATALOGS[lang];
  const tpl = (cat && cat[key]) ?? BASE[key] ?? key;
  return fill(tpl, vars);
}
