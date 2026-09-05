// Design tokens ported verbatim from the AskQuran mobile design handoff
// (aq-app.css). Two themes (light + dark) plus a runtime `mix()` helper that
// reproduces CSS `color-mix(in srgb, …)` so component styles can be copied
// across faithfully. Fonts mirror the design's type system.

export type Mode = "light" | "dark";

/* ---------- color-mix(in srgb, …) shim ---------- */

type RGBA = { r: number; g: number; b: number; a: number };

function parseColor(c: string): RGBA {
  const s = c.trim();
  if (s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  if (s.startsWith("#")) {
    let hex = s.slice(1);
    if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(",").map((x) => parseFloat(x.trim()));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

function toRgba({ r, g, b, a }: RGBA): string {
  const rr = Math.round(r), gg = Math.round(g), bb = Math.round(b);
  return a >= 1 ? `rgb(${rr}, ${gg}, ${bb})` : `rgba(${rr}, ${gg}, ${bb}, ${+a.toFixed(3)})`;
}

/**
 * color-mix(in srgb, colorA pct%, colorB) — premultiplied-alpha mix, which is
 * what browsers use. `pct` is A's share (0–100); B defaults to transparent so
 * `mix(c, 11)` gives c at ~11% alpha, exactly like the CSS used in the design.
 */
export function mix(colorA: string, pct: number, colorB = "transparent"): string {
  const a = parseColor(colorA);
  const b = parseColor(colorB);
  const wa = pct / 100;
  const wb = 1 - wa;
  const outA = a.a * wa + b.a * wb;
  // premultiplied
  const pr = a.r * a.a * wa + b.r * b.a * wb;
  const pg = a.g * a.a * wa + b.g * b.a * wb;
  const pb = a.b * a.a * wa + b.b * b.a * wb;
  const r = outA === 0 ? 0 : pr / outA;
  const g = outA === 0 ? 0 : pg / outA;
  const bl = outA === 0 ? 0 : pb / outA;
  return toRgba({ r, g, b: bl, a: outA });
}

/* ---------- per-theme token sets (from .phone[data-theme]) ---------- */

export interface Tokens {
  mode: Mode;
  emerald: string; emerald600: string; emerald700: string; emeraldInk: string;
  gold: string; goldSoft: string; goldDeep: string;
  parchment: string; parchment2: string; parchment3: string;
  ink: string; muted: string;
  bg: string; surface: string; surface2: string;
  line: string; lineSoft: string;
  text: string; text2: string; text3: string;
  brand: string; brand2: string;
  arColor: string; orn: string; ornOp: number;
  teal: string;
  mecca: string; meccaBg: string; medina: string; medinaBg: string;
  cardShadow: { shadowColor: string; shadowOpacity: number; shadowRadius: number; shadowOffset: { width: number; height: number }; elevation: number };
  statusbarInk: string;
  onBrand: string;
}

const light: Tokens = {
  mode: "light",
  emerald: "#0F5D45", emerald600: "#137A59", emerald700: "#0A4836", emeraldInk: "#06291F",
  gold: "#C2A14D", goldSoft: "#D9BE7E", goldDeep: "#A8893A",
  parchment: "#F4EEE0", parchment2: "#EDE5D2", parchment3: "#E5DAC0",
  ink: "#16211C", muted: "#586860",
  bg: "#F4EEE0", surface: "#FBF8F0", surface2: "#FFFFFF",
  line: "#E5DAC0", lineSoft: "#EAE0CB",
  text: "#16211C", text2: "#586860", text3: "#8a8068",
  brand: "#0F5D45", brand2: "#137A59",
  arColor: "#1d2b24", orn: "#C2A14D", ornOp: 0.085,
  teal: "#1C7A68",
  mecca: "#A8893A", meccaBg: mix("#C2A14D", 17), medina: "#1C7A68", medinaBg: mix("#1C7A68", 13),
  cardShadow: { shadowColor: "#06291F", shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 3 },
  statusbarInk: "#16211C",
  onBrand: "#FBF8F0",
};

const dark: Tokens = {
  mode: "dark",
  emerald: "#0F5D45", emerald600: "#137A59", emerald700: "#0A4836", emeraldInk: "#052019",
  gold: "#C2A14D", goldSoft: "#D9BE7E", goldDeep: "#A8893A",
  parchment: "#F4EEE0", parchment2: "#EDE5D2", parchment3: "#E5DAC0",
  ink: "#16211C", muted: "#586860",
  bg: "#052019", surface: "#08291F", surface2: "#0A3327",
  line: "#154A39", lineSoft: "#103D2F",
  text: "#ECE3CF", text2: "#9DB3A8", text3: "#6E8579",
  brand: "#2E9A74", brand2: "#36B086",
  arColor: "#F1E9D6", orn: "#D9BE7E", ornOp: 0.13,
  teal: "#34B79E",
  mecca: "#D9BE7E", meccaBg: mix("#C2A14D", 15), medina: "#34B79E", medinaBg: mix("#34B79E", 17),
  cardShadow: { shadowColor: "#000000", shadowOpacity: 0.55, shadowRadius: 20, shadowOffset: { width: 0, height: 14 }, elevation: 5 },
  statusbarInk: "#ECE3CF",
  onBrand: "#052019",
};

export const TOKENS: Record<Mode, Tokens> = { light, dark };

/* ---------- fonts (mapped to the installed Google-font families) ---------- */

export const FONTS = {
  sans: {
    400: "PlusJakartaSans_400Regular",
    500: "PlusJakartaSans_500Medium",
    600: "PlusJakartaSans_600SemiBold",
    700: "PlusJakartaSans_700Bold",
    800: "PlusJakartaSans_800ExtraBold",
  },
  serif: {
    400: "Newsreader_400Regular",
    500: "Newsreader_500Medium",
    600: "Newsreader_600SemiBold",
    italic: "Newsreader_400Regular_Italic",
    italic500: "Newsreader_500Medium_Italic",
  },
  // Primary Quran text face — Amiri (same face the web falls back to). UthmanicHafs
  // was trialled but its end-of-ayah rosette is the dashed KFGQPC mushaf ring, which
  // read as a "broken/dotted circle" on the By Surah view; Amiri's U+06DD rosette is
  // a clean solid ring that encloses the ayah number, matching the web exactly.
  ar: "Amiri_400Regular",
  arItalic: "Amiri_400Regular_Italic",
  ur: { 400: "NotoNastaliqUrdu_400Regular", 500: "NotoNastaliqUrdu_500Medium" },
  // Decorative calligraphic surah-title face (web `--font-surah`), keyed by the
  // PUA codepoints `surahNameChar()` emits. Used for the By Surah header band.
  surah: "SurahNameV2",
  // Decorative Juz / Para boundary header face (web `--font-juz`). Bundled for
  // parity with the web font set; not yet wired to a visible surface.
  juz: "JuzName",
  // KFGQPC Arabic Symbols (web `--font-symbols`): tajweed / waqf / sajdah marks
  // in the PUA U+F020… range. Bundled for parity / future tajweed rendering. The
  // ayah-end rosette is rendered with `ar` (Amiri) via the U+06DD end-of-ayah glyph,
  // which encloses the verse number in a clean ring.
  symbols: "QuranSymbols",
} as const;
