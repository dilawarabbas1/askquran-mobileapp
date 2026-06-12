// Pure helpers for the Recite reader: ayah display-numbering and the audio-follow
// auto-scroll math. Kept side-effect-free so they can be unit-tested without a
// React/native runtime (the screen wires them to ScrollView measurements).

/**
 * The number shown for an ayah in the reader. Al-Fatiha (surah 1) carries the
 * Bismillah as verse 1 in the source data; the reader lifts that into a header
 * and renumbers the remaining verses down by one, so verse 2 displays as "1".
 * Every other surah displays its verse number verbatim.
 */
export function displayAyahNumber(surah: number, ayah: number): number {
  return surah === 1 ? ayah - 1 : ayah;
}

/**
 * Scroll target (px from top) to bring a By Ayah card near the top of the
 * viewport. `cardY` is the card's measured content-relative Y; `offset` leaves a
 * little breathing room above it. Never returns a negative offset.
 */
export function scrollTargetForList(cardY: number, offset = 96): number {
  return Math.max(cardY - offset, 0);
}

/**
 * Fraction (0..1) of the way through the surah body at which a given ayah starts,
 * weighted by *character length* rather than ayah index. The By Surah view renders
 * the whole surah as one justified Arabic Text block, where each line is roughly a
 * constant height — so an ayah's vertical position tracks the cumulative characters
 * before it, NOT its ordinal index. (Index-weighting badly overshoots on surahs
 * like Al-Baqarah whose opening ayahs are very long: by index they look near the
 * top, by character count they are far down the page.) Returns 0 for the first
 * ayah, an unknown index, or an empty/zero-length corpus.
 */
export function flowCharFraction(lengths: number[], index: number): number {
  if (index <= 0) return 0;
  const total = lengths.reduce((s, n) => s + Math.max(n, 0), 0);
  if (total <= 0) return 0;
  let before = 0;
  for (let i = 0; i < index && i < lengths.length; i++) before += Math.max(lengths[i], 0);
  return Math.min(before / total, 1);
}

/**
 * A single rendered line from a Text `onTextLayout` event — the only fields we
 * need to locate an ayah's vertical position inside the continuous flow Text.
 */
export interface FlowTextLine {
  text?: string;
  y: number;
}

/**
 * Content-relative Y (within the flow Text) at which the reciting ayah BEGINS.
 *
 * The By Surah body is one continuous justified Text, so individual ayahs can't
 * be measured directly. But `onTextLayout` reports every wrapped line with its
 * rendered `text` and `y`. Each ayah ends with a rosette end-marker (`۝` + its
 * Arabic-Indic number), so the line carrying the PREVIOUS ayah's marker is the
 * line on which the current ayah's first word appears. Scrolling there keeps the
 * reciting ayah on screen — a measured guarantee, not a character-count estimate.
 *
 * `prevMarker` is the previous ayah's marker core (`۝<numeral>`, no spaces);
 * pass null for the first ayah (begins at the top of the text → Y 0). Returns
 * null when the marker isn't found (caller should fall back to {@link flowCharFraction}).
 *
 * The trailing-digit boundary check prevents a short number's marker from
 * matching inside a longer one (e.g. `۝٥` must not match within `۝٥٠`).
 */
export function flowLineYForMarker(lines: FlowTextLine[], prevMarker: string | null): number | null {
  if (prevMarker == null) return 0;
  if (!lines || lines.length === 0) return null;
  for (const ln of lines) {
    const t = ln.text;
    if (!t) continue;
    const i = t.indexOf(prevMarker);
    if (i < 0) continue;
    const after = t[i + prevMarker.length];
    // Reject a longer-number prefix match: next char must not be an Arabic-Indic digit.
    if (after === undefined || after < "٠" || after > "٩") return ln.y;
  }
  return null;
}

/**
 * Scroll target (px from top) to bring a flow line to the top of the viewport.
 * `lineY` is the line's Y within the flow Text (from {@link flowLineYForMarker});
 * `textTop` is the flow Text's content-relative top (measured at scroll time).
 * `offset` leaves breathing room above. Never returns a negative offset.
 */
export function scrollTargetForLine(lineY: number, textTop: number, offset = 96): number {
  return Math.max(textTop + lineY - offset, 0);
}

/**
 * Inverse of {@link scrollTargetForList} for reading-progress tracking: given the
 * current scroll offset and the measured By Ayah card Ys, return the ayah sitting
 * at the comfortable reading line near the top of the viewport (the same line the
 * forward helper scrolls an ayah to, so save→restore round-trips cleanly). Returns
 * the largest-Y card at or above that line, else the first card, else null when no
 * cards are measured yet.
 */
export function topAyahForList(ayahYs: Record<number, number>, scrollY: number, offset = 96): number | null {
  const target = scrollY + offset;
  let best: number | null = null;
  let bestY = -Infinity;
  let firstN: number | null = null;
  let firstY = Infinity;
  for (const [k, y] of Object.entries(ayahYs)) {
    const n = Number(k);
    if (y <= target + 1 && y > bestY) { bestY = y; best = n; }
    if (y < firstY) { firstY = y; firstN = n; }
  }
  return best ?? firstN;
}

/**
 * Inverse of {@link scrollTargetForFlow}: given the scroll offset over the measured
 * surah-card span, return the *index* (into the visible-ayah list) whose character-
 * weighted span contains the top of the viewport. Mirrors {@link flowCharFraction}'s
 * cumulative-character model, so it's approximate (line height is near-constant) but
 * consistent with how the flow view positions ayahs. Returns 0 for an empty corpus.
 */
export function flowIndexAtScroll(
  lengths: number[],
  scrollY: number,
  cardTop: number,
  cardHeight: number,
  offset = 120,
): number {
  if (cardHeight <= 0 || lengths.length === 0) return 0;
  const frac = Math.min(Math.max((scrollY + offset - cardTop) / cardHeight, 0), 1);
  const total = lengths.reduce((s, n) => s + Math.max(n, 0), 0);
  if (total <= 0) return 0;
  let before = 0;
  for (let i = 0; i < lengths.length; i++) {
    before += Math.max(lengths[i], 0);
    if (frac < before / total) return i;
  }
  return lengths.length - 1;
}

/**
 * Scroll target (px from top) for the By Surah (flow) view. `frac` is the ayah's
 * character-weighted position (see {@link flowCharFraction}) mapped over the
 * measured surah-card span (`cardTop` = the card's content-relative Y, `cardHeight`
 * = its measured height). `offset` lifts the ayah a little below the top so the
 * card header doesn't cover it. Clamped to never go negative.
 */
export function scrollTargetForFlow(
  frac: number,
  cardTop: number,
  cardHeight: number,
  offset = 120,
): number {
  const clamped = Math.min(Math.max(frac, 0), 1);
  return Math.max(cardTop + clamped * Math.max(cardHeight, 0) - offset, 0);
}
