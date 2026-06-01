/** Ayah-reference helpers shared by reference pages (Prophet Stories, Parables).
 *  A "ref" is "surah:ayah" or a single-surah range "surah:start-end". */

export interface VerseKey { surah: number; ayah: number }

/** Parse "12:3-101" → { surah:12, start:3, end:101 } (single ayah → start===end). */
export function parseRefRange(ref: string): { surah: number; start: number; end: number } | null {
  const m = /^(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/.exec(ref.trim());
  if (!m) return null;
  const surah = Number(m[1]);
  const start = Number(m[2]);
  const end = m[3] ? Number(m[3]) : start;
  if (surah < 1 || surah > 114 || start < 1 || end < start) return null;
  return { surah, start, end };
}

/** Expand refs into individual verse-key strings, de-duplicated, in Quran order. */
export function expandRefs(refs: string[]): string[] {
  const set = new Set<string>();
  for (const r of refs) {
    const p = parseRefRange(r);
    if (!p) continue;
    for (let a = p.start; a <= p.end; a++) set.add(`${p.surah}:${a}`);
  }
  return [...set].sort(compareAyahRefs);
}

/** Compare two "surah:ayah" keys by Quran order (surah asc, then ayah asc). */
export function compareAyahRefs(a: string, b: string): number {
  const [as, aa] = a.split(":").map(Number);
  const [bs, ba] = b.split(":").map(Number);
  return as - bs || aa - ba;
}

/** Total number of ayahs across refs (ranges expanded, de-duplicated). */
export function countAyahs(refs: string[]): number {
  return expandRefs(refs).length;
}
