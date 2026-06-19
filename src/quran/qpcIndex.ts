// QPC V2 glyph index — maps every ayah ("surah:ayah") to its page number and the
// space-separated private-use glyph codes (code_v2) that render as the authentic
// Madinah-mushaf calligraphy in that page's font. The SAME codepoint is a different
// glyph on every page, so glyph string + page font must always be paired.
//
// The index (~500 KB, all 6236 ayahs) is bundled in the JS bundle so it is always
// available offline — only the per-page TTFs are downloaded on demand (see qpcFonts).

export type QpcEntry = { p: number; g: string };

// require (not import) so TS does not infer a ~6236-key literal type for the 500 KB
// JSON — that explodes typecheck time/memory. Metro bundles the JSON either way.
const INDEX = require("../../assets/qpc-v2.json") as Record<string, QpcEntry>;

/** Glyph entry for one ayah, or undefined if the key is unknown. */
export function qpcAyah(surah: number, ayah: number): QpcEntry | undefined {
  return INDEX[`${surah}:${ayah}`];
}

/**
 * Parse a verse key into {surah, ayah} ONLY when it is a single ayah ("2:255").
 * Ranges/lists ("2:1-5", "2:255,256") and malformed keys return null so callers
 * fall back to plain Unicode rather than mis-rendering one ayah's glyphs.
 */
export function saFromKey(ref: string): { surah: number; ayah: number } | null {
  const m = /^\s*(\d+):(\d+)\s*$/.exec(ref ?? "");
  if (!m) return null;
  return { surah: Number(m[1]), ayah: Number(m[2]) };
}

/** Page number an ayah is typeset on (604-page Madinah mushaf), or undefined. */
export function qpcPage(surah: number, ayah: number): number | undefined {
  return INDEX[`${surah}:${ayah}`]?.p;
}

/**
 * The distinct page numbers a set of ayahs spans, in ascending order. Used to
 * decide which page fonts to preload for a range about to render.
 */
export function qpcPagesFor(keys: { surah: number; ayah: number }[]): number[] {
  const pages = new Set<number>();
  for (const k of keys) {
    const p = qpcPage(k.surah, k.ayah);
    if (p) pages.add(p);
  }
  return [...pages].sort((a, b) => a - b);
}

/**
 * The glyph string with its trailing verse-end medallion glyph removed. QPC bakes
 * the numbered medallion as the last glyph of each ayah; callers that render their
 * own number (Al-Fatihah) or show the number in a separate rail must strip it so
 * the digit is never shown twice.
 */
export function stripMedallion(g: string): string {
  const parts = g.trim().split(/\s+/);
  if (parts.length <= 1) return g;
  parts.pop();
  return parts.join(" ");
}
