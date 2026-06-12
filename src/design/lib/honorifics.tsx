// Renders Urdu/Arabic body text with Islamic honorifics (e.g. ﷺ and the spelled
// "صلی اللہ علیہ وسلم", "علیہ السلام") drawn a couple of points smaller than the
// surrounding text. In Nastaliq/Naskh these honorifics carry dense stacked
// diacritics that tower over the line and make the leading feel cramped; shrinking
// just those spans (inside a nested <Text>, so the script font is inherited) calms
// the line without touching the rest of the prose.
//
// Matching is diacritic- and variant-tolerant: the text is normalised (combining
// marks, spaces and yeh/heh/alef variants folded) for detection only, then the
// match is mapped back onto the ORIGINAL string so the visible glyphs — marks and
// all — are the ones resized.

import React from "react";
import { Text } from "../AppText";

const COMBINING = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭ]/;

/** Fold a single char for matching; returns "" for marks/joiners/spaces. */
function normCh(ch: string): string {
  if (COMBINING.test(ch)) return "";
  if (ch === " " || ch === " " || ch === "‌" || ch === "‍") return "";
  if ("يىیئ".includes(ch)) return "ی";
  if ("هہھة".includes(ch)) return "ہ";
  if ("اآأإ".includes(ch)) return "ا";
  if (ch === "ك") return "ک";
  return ch;
}

// Normalised honorific forms (no spaces/diacritics, folded letters). Longest first
// so "…علیہ وسلم" wins over the bare "علیہ السلام" prefix it can share.
const NEEDLES = [
  "صلیاللہعلیہوالہوسلم",
  "صلیاللہعلیہوسلم",
  "علیہماالسلام",
  "علیہالسلام",
  "رضیاللہعنہما",
  "رضیاللہعنہا",
  "رضیاللہعنہ",
].sort((a, b) => b.length - a.length);

// Standalone honorific ligature code points (ﷺ, ﷻ, ﷷ…).
const LIGATURES = new Set(["ﷺ", "ﷻ", "ﷷ", "ﷸ", "ﷹ", "ﷵ", "ﷰ"]);

/**
 * Returns the text as a React node, with honorific spans wrapped in a nested
 * <Text> at `fontSize - delta`. When nothing matches it returns the plain string
 * so callers pay nothing for Latin/honorific-free content.
 */
export function withHonorifics(text: string, fontSize: number, delta = 2): React.ReactNode {
  if (!text) return text;

  // Build a folded copy + index map back to the original string.
  const folded: string[] = [];
  const at: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const n = normCh(text[i]);
    if (n) { folded.push(n); at.push(i); }
  }
  const fStr = folded.join("");

  const spans: Array<[number, number]> = [];
  let i = 0;
  while (i < fStr.length) {
    let hit: string | undefined;
    for (const nd of NEEDLES) { if (fStr.startsWith(nd, i)) { hit = nd; break; } }
    if (hit) {
      const start = at[i];
      let end = at[i + hit.length - 1] + 1;
      while (end < text.length && COMBINING.test(text[end])) end++; // keep trailing marks
      spans.push([start, end]);
      i += hit.length;
    } else i++;
  }

  // Single-char ligatures.
  for (let j = 0; j < text.length; j++) if (LIGATURES.has(text[j])) spans.push([j, j + 1]);

  if (!spans.length) return text;
  spans.sort((a, b) => a[0] - b[0]);

  const out: React.ReactNode[] = [];
  let cur = 0;
  let k = 0;
  for (const [s, e] of spans) {
    if (s < cur) continue; // skip overlaps
    if (s > cur) out.push(text.slice(cur, s));
    out.push(<Text key={`h${k++}`} style={{ fontSize: Math.max(1, fontSize - delta) }}>{text.slice(s, e)}</Text>);
    cur = e;
  }
  if (cur < text.length) out.push(text.slice(cur));
  return out;
}
