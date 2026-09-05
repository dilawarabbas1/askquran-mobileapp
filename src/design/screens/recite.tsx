// Recite screen ported from aq-recite.jsx: surah header + picker sheet, ayah-by-
// ayah stream, and a sticky audio player. Audio streams per-ayah MP3s (Mishary
// Alafasy) via expo-av, auto-advancing through the surah; tap an ayah to play it
// on its own. Text is verbatim — nothing generated.

import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { Text } from "../AppText";
import { Audio, type AVPlaybackStatus } from "expo-av";
import { SvgXml } from "react-native-svg";
import { useApp } from "../AQContext";
import { Icon } from "../Icon";
import { SearchBar } from "../SearchBar";
import { translationStyle } from "../atoms";
import { physicalRight, physicalRow } from "../lib/rtl";
import { SURAHS } from "../data";
import { BISMILLAH, BISMILLAH_AUDIO_URL, ayahAudioUrl } from "../reciteData";
import { FONTS, mix, type Tokens } from "../tokens";
import { getVerses, getTafsir, translationIdForLanguage, AqError } from "@/api";
import { track } from "@/analytics";
import { displayAyahNumber, scrollTargetForList, flowCharFraction, topAyahForList, flowIndexAtScroll } from "../lib/reciteScroll";
import { QuranText } from "../../quran/QuranText";
import { qpcAyah, qpcPage, qpcPagesFor, stripMedallion } from "../../quran/qpcIndex";
import { ensureQpcPage, isPageReady, qpcFamily } from "../../quran/qpcFonts";

/** The single reciter the recite screen streams (no switching UI exists). */
const RECITER = "Mishary Alafasy";

/** Render a Western integer as Arabic-Indic digits (mushaf numbering). */
const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNumeral(n: number): string {
  return String(n).split("").map((d) => AR_DIGITS[+d] ?? d).join("");
}

/**
 * The Private-Use-Area character Surah Name V2 maps to a calligraphic surah-name
 * glyph: U+E000 + surahNumber for every surah except 102 (U+E066 is absent from
 * this font build → U+E102). Mirrors the web's surahNameChar.
 */
function surahNameChar(num: number): string {
  return String.fromCodePoint(num === 102 ? 0xe102 : 0xe000 + num);
}

/**
 * The Juz Name font maps a calligraphic "Juz opening words" glyph per juz at
 * U+E900 + (juz − 1) (juz 1 → الٓمٓ, juz 30 → عَمَّ يَتَسَآءَلُونَ).
 */
function juzNameChar(juz: number): string {
  return String.fromCodePoint(0xe900 + (Math.min(Math.max(juz, 1), 30) - 1));
}

/**
 * The 30 Juz (Para) boundaries of the Hafs Madani mushaf, keyed "surah:ayah" →
 * juz number. When the reader reaches one of these verses we draw a Juz divider.
 * Cross-checked against the per-verse `juz` annotations in design/data.ts.
 */
const JUZ_STARTS: Record<string, number> = {
  "1:1": 1, "2:142": 2, "2:253": 3, "3:93": 4, "4:24": 5, "4:148": 6, "5:82": 7,
  "6:111": 8, "7:88": 9, "8:41": 10, "9:93": 11, "11:6": 12, "12:53": 13, "15:1": 14,
  "17:1": 15, "18:75": 16, "21:1": 17, "23:1": 18, "25:21": 19, "27:56": 20, "29:46": 21,
  "33:31": 22, "36:28": 23, "39:32": 24, "41:47": 25, "46:1": 26, "51:31": 27, "58:1": 28,
  "67:1": 29, "78:1": 30,
};

/** A recite ayah: number, Arabic, and translation in the current language. */
type RAyah = { n: number; ar: string; tr: string };

/* ---- recite-specific (filled) icons ---- */
const RECITE_ICONS: Record<string, string> = {
  play: '<path d="M7 5l12 7-12 7z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/>',
  prev: '<path d="M18 6l-8 6 8 6z" fill="currentColor" stroke="none"/><rect x="6" y="5" width="2.4" height="14" rx="1" fill="currentColor" stroke="none"/>',
  next: '<path d="M6 6l8 6-8 6z" fill="currentColor" stroke="none"/><rect x="15.6" y="5" width="2.4" height="14" rx="1" fill="currentColor" stroke="none"/>',
  repeat: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  wave: '<rect x="3" y="9" width="2" height="6" rx="1" fill="currentColor" stroke="none"/><rect x="7" y="6" width="2" height="12" rx="1" fill="currentColor" stroke="none"/><rect x="11" y="3" width="2" height="18" rx="1" fill="currentColor" stroke="none"/><rect x="15" y="6" width="2" height="12" rx="1" fill="currentColor" stroke="none"/><rect x="19" y="9" width="2" height="6" rx="1" fill="currentColor" stroke="none"/>',
  // By Ayah (list rows) + By Surah (book) toggle glyphs — mirror the web view-seg.
  list: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
};
function RIcon({ name, size = 18, color = "currentColor" }: { name: string; size?: number; color?: string }) {
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${RECITE_ICONS[name] ?? ""}</svg>`;
  return <SvgXml xml={xml} width={size} height={size} color={color} />;
}

/* ---- animated equalizer for the active ayah ---- */
function Equalizer({ color }: { color: string }) {
  const bars = useRef([0.4, 1, 0.65, 0.85].map((h) => new Animated.Value(h))).current;
  useEffect(() => {
    const loops = bars.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 0.25, duration: 450, delay: i * 150, useNativeDriver: false }),
          Animated.timing(v, { toValue: 1, duration: 450, useNativeDriver: false }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [bars]);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3, height: 14, marginTop: 10 }}>
      {bars.map((v, i) => (
        <Animated.View key={i} style={{ width: 3, borderRadius: 2, backgroundColor: color, height: v.interpolate({ inputRange: [0, 1], outputRange: [2, 14] }) }} />
      ))}
    </View>
  );
}

/* ---- Juz / Para boundary divider ----
 * Drawn in the By Ayah stream when the reader reaches a verse that opens a new
 * Juz. The calligraphic glyph is the Juz's opening words (JuzName font, keyed by
 * juzNameChar); below it a small uppercase "Juz N" label flanked by hairlines. */
function JuzDivider({ juz, label, tokens }: { juz: number; label: string; tokens: Tokens }) {
  return (
    <View style={{ alignItems: "center", marginTop: 4, marginBottom: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "stretch", gap: 12 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: mix(tokens.orn, 45, tokens.line) }} />
        <Text style={{ fontFamily: FONTS.juz, fontSize: 32, lineHeight: 42, color: tokens.brand, writingDirection: "rtl" }}>{juzNameChar(juz)}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: mix(tokens.orn, 45, tokens.line) }} />
      </View>
      <Text style={{ fontFamily: FONTS.sans[700], fontSize: 11, letterSpacing: 0.6, color: tokens.orn, marginTop: 5, textTransform: "uppercase" }}>{label}</Text>
    </View>
  );
}

/* ---- surah picker (full-screen overlay) ---- */
export function SurahSheet() {
  const app = useApp();
  const { tokens } = app;
  const [q, setQ] = useState("");
  const t = q.trim().toLowerCase();
  const S = SURAHS.map((r) => ({ num: r[0], ar: r[1], name: r[2], cnt: r[3], place: r[4] }));
  const list = S.filter((s) => !t || s.name.toLowerCase().includes(t) || String(s.num) === t || s.ar.includes(t));

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: tokens.lineSoft }}>
        <Pressable onPress={app.closeSurahSheet} style={{ width: 36, height: 36, borderRadius: 11, borderWidth: 1, borderColor: tokens.line, backgroundColor: tokens.surface2, alignItems: "center", justifyContent: "center" }}>
          <Icon name="back" size={18} w={2.1} color={tokens.text2} />
        </Pressable>
        <View>
          <Text style={{ fontFamily: FONTS.serif[500], fontSize: 19, color: tokens.text }}>{app.t("m.selectSurah")}</Text>
          <Text style={{ fontSize: 11.5, color: tokens.text2, marginTop: 1 }}>{app.t("m.chaptersCount", { n: 114 })}</Text>
        </View>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 4 }}>
        <View style={{ marginVertical: 12 }}>
          <SearchBar value={q} onChangeText={setQ} placeholder={app.t("recite.searchSurahs")} small />
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8, gap: 8 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {list.map((s) => {
            const on = app.reciteSurah === s.num;
            return (
              <Pressable key={s.num} onPress={() => app.pickSurah(s.num)} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: on ? tokens.brand : tokens.line, backgroundColor: on ? mix(tokens.brand, 7, tokens.surface) : tokens.surface }}>
                <View style={{ width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: on ? tokens.brand : mix(tokens.brand, 9) }}>
                  <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[600], color: on ? tokens.onBrand : tokens.brand }}>{s.num}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14.5, fontFamily: FONTS.sans[700], color: tokens.text }}>{app.t(`facts.s.${s.num}`)}</Text>
                  <Text style={{ fontSize: 11, color: tokens.text3, marginTop: 1 }}>
                    <Text style={{ fontFamily: FONTS.sans[700], color: s.place === "Meccan" ? tokens.mecca : tokens.medina }}>{app.t(s.place === "Meccan" ? "recite.meccan" : "recite.medinan")}</Text> · {app.t("recite.ayahs", { n: s.cnt })}
                  </Text>
                </View>
                <Text style={{ fontFamily: FONTS.ar, fontSize: 20, color: tokens.arColor }}>{s.ar}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

/* ---- the recite screen ---- */
export function Recite() {
  const app = useApp();
  const { tokens } = app;
  const num = app.reciteSurah;
  const meta = SURAHS.find((r) => r[0] === num) ?? [num, "", "Surah", 0, "Meccan" as const, 0];
  const arName = meta[1];
  const name = meta[2];
  const cnt = meta[3];
  const place = meta[4] as string;
  // Bismillah is shown as a standalone header above every surah except At-Tawbah (9).
  // For Al-Fatiha (1) the Bismillah is verse 1 in the data — we lift it out into this
  // header and renumber the remaining verses, so it's never inline with the ayahs.
  const showBismillah = num !== 9;
  const bismillahTr = app.language.toLowerCase().includes("urdu") ? BISMILLAH.ur : BISMILLAH.en;

  const [ayahs, setAyahs] = useState<RAyah[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  // True while the Bismillah prelude plays — drives its header highlight + the
  // translation strip (the prelude has no ayah, so activeAyah stays null).
  const [bismillahOn, setBismillahOn] = useState(false);
  const [mode, setMode] = useState<"surah" | "single">("surah");
  const [repeat, setRepeat] = useState(false);
  const [progress, setProgress] = useState(0);
  // Bumped whenever a QPC page font finishes registering, so ayahs on that page
  // re-render from the Unicode fallback into their authentic Madinah-mushaf glyphs.
  const [, setQpcTick] = useState(0);

  // Per-ayah tafsir, loaded lazily on "View tafsir" (stored sources, in the
  // chosen language) — keeps the surah payload light.
  type TafState = { loading: boolean; available: boolean; text: string; edition?: string; error?: boolean };
  const [tafOpen, setTafOpen] = useState<Set<number>>(new Set());
  const [tafData, setTafData] = useState<Record<number, TafState>>({});

  async function toggleTafsir(n: number) {
    const willOpen = !tafOpen.has(n);
    setTafOpen((prev) => { const next = new Set(prev); if (willOpen) next.add(n); else next.delete(n); return next; });
    if (!willOpen) return;
    const existing = tafData[n];
    if (existing && !existing.error) return; // cached
    setTafData((p) => ({ ...p, [n]: { loading: true, available: false, text: "" } }));
    try {
      const d = await getTafsir([`${num}:${n}`], app.tafsirLanguage);
      const it = d.items[0];
      setTafData((p) => ({ ...p, [n]: { loading: false, available: !!it?.available, text: it?.tafsir ?? "", edition: it?.edition?.name } }));
      track("view_tafsir", {
        surah_name: name, ayah_no: `${num}:${n}`, tafsir_source: it?.edition?.name ?? "",
        tafsir_language: app.tafsirLanguage, status: it?.available ? "presented" : "missing",
      });
    } catch {
      setTafData((p) => ({ ...p, [n]: { loading: false, available: false, text: "", error: true } }));
      track("view_tafsir", {
        surah_name: name, ayah_no: `${num}:${n}`, tafsir_source: "",
        tafsir_language: app.tafsirLanguage, status: "missing",
      });
    }
  }

  const soundRef = useRef<Audio.Sound | null>(null);
  const tokenRef = useRef(0);
  const loadTokenRef = useRef(0);
  // True while the standalone Bismillah prelude is playing (no ayah highlighted);
  // when it finishes, advance() rolls into ayah 1 of the surah.
  const bismillahRef = useRef(false);

  // Auto-scroll the reader to follow the reciting ayah. `scrollRef` drives the
  // body ScrollView; in By Ayah we scroll to each card's exact measured Y, and in
  // By Surah (one continuous Text whose ayahs can't be measured individually) we
  // map the ayah's character-weighted position over the measured surah-card span.
  const scrollRef = useRef<ScrollView>(null);
  const scrollViewHRef = useRef(0); // visible reading-area height (ScrollView), for centering
  const ayahYRef = useRef<Record<number, number>>({});
  // By Surah: per-line layout of the continuous flow Text (text + Y from
  // onTextLayout). We locate the reciting ayah by the line carrying the PREVIOUS
  // ayah's end-marker, then add up the onLayout offsets (card → inner border →
  // text) to get the text's content-relative top, so the scroll lands the ayah on
  // screen. (measureLayout is avoided: on Fabric it rejects a numeric node handle.)
  // flowCard* double as the estimate fallback when a line can't be resolved.
  const flowLinesRef = useRef<{ text?: string; y: number }[]>([]);
  const flowCardTopRef = useRef(0);
  const flowCardHeightRef = useRef(0);
  const flowInnerTopRef = useRef(0); // inner bordered View's Y within the card
  const flowTextTopRef = useRef(0); // flow Text's Y within the inner View
  const stateRef = useRef({ mode, repeat, activeAyah, ayahs, num, reciteView: app.reciteView });
  stateRef.current = { mode, repeat, activeAyah, ayahs, num, reciteView: app.reciteView };
  // Which surah we've already restored the saved spot for — guards against
  // re-jumping on every language refetch or re-render.
  const restoredForRef = useRef<number | null>(null);
  // True only between a user's finger-down and the scroll settling. Auto-remember
  // saves the reading spot ONLY for user-driven scrolls — never for the
  // programmatic follow/restore scrolls (which also fire onMomentumScrollEnd and
  // would otherwise drift the saved ayah on every restore).
  const userScrollRef = useRef(false);
  // True once the reader has manually scrolled in the current paused surah. While
  // paused, this suppresses the one-shot restore scroll and the highlight-follow
  // scroll so reading is never yanked back to the audio spot. Reset whenever
  // playback (re)starts or a surah (re)loads, so audio-follow re-engages.
  const userTookOverRef = useRef(false);
  // Reactive mirror of userTookOverRef, used to collapse the flow translation strip
  // once the reader scrolls (so it isn't pinned to the audio ayah while reading).
  // Re-shows when playback (re)starts or a surah (re)loads.
  const [readerTookOver, setReaderTookOver] = useState(false);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
    return () => { void unload(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load the selected surah's ayahs from the API (any of the 114), refetching
  // when the surah or language changes; falls back to bundled short surahs.
  useEffect(() => { loadSurah(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [num, app.language]);

  // Follow the reciting ayah: whenever the highlighted ayah changes, scroll the
  // reader so that ayah sits near the top of the viewport. By Ayah uses each
  // card's measured Y (exact); By Surah has one continuous Text whose ayahs can't
  // be individually measured, so we place the ayah by its cumulative-character
  // fraction over the measured surah-card height (line height is ~constant, so
  // vertical position tracks characters-before, not ordinal index).
  // Scroll the reader so `target` ayah sits near the top of the viewport. Reads
  // live state from stateRef so it stays correct when fired from a timer (e.g. the
  // resume-restore below, which scrolls once the just-loaded layout has settled).
  function scrollToAyah(target: number) {
    const st = stateRef.current;
    if (!st.ayahs) return;
    const sv = scrollRef.current;
    if (!sv) return;
    // This is a programmatic scroll — clear the user-drag flag so its settling
    // doesn't get mistaken for a user scroll and re-save (drifting) the position.
    userScrollRef.current = false;
    // Center the reciting ayah in the visible reading area (not near the top) so it
    // never gets clipped against the bottom translation/player box. Placing the ayah's
    // start ~38% down leaves its body centered with margin below.
    const centerOffset = Math.round((scrollViewHRef.current || 520) * 0.38);
    if (st.reciteView === "list") {
      const y = ayahYRef.current[target];
      if (y == null) return;
      sv.scrollTo({ y: scrollTargetForList(y, centerOffset), animated: true });
    } else {
      const visible = st.ayahs.filter((a) => !(st.num === 1 && a.n === 1));
      const idx = visible.findIndex((a) => a.n === target);
      if (idx < 0) return;
      const visibleH = scrollViewHRef.current || 520;
      const FLOW_LINE = 58; // matches the By-Surah flow Text lineHeight
      const textTop = flowCardTopRef.current + flowInnerTopRef.current + flowTextTopRef.current;
      // Locate the ayah by its CHARACTER OFFSET into the concatenated flow string, then
      // resolve that offset to a real measured line Y. We deliberately do NOT search the
      // line text for the ayah's QPC glyph: QPC V2 reuses the same private-use codepoints
      // on every page (each page font draws them differently), so a code match lands on
      // the FIRST page that reuses it — usually a far earlier ayah. And a plain char-
      // FRACTION × cardHeight is too coarse over a long surah (286 ayahs ≈ 57000px, so a
      // 2% estimate error is ~1000px / ~20 lines). Char offset → exact line Y is precise.
      const lenOf = (a: { n: number; ar?: string }): number => {
        const page = qpcPage(st.num, a.n);
        const entry = qpcAyah(st.num, a.n);
        const marker = st.num === 1 ? ` ۝${toArabicNumeral(displayAyahNumber(st.num, a.n))} `.length : 0;
        if (page != null && entry != null && isPageReady(page)) {
          const g = st.num === 1 ? stripMedallion(entry.g) : entry.g;
          return g.length + marker + (st.num === 1 ? 0 : 1); // +1 = trailing space after the medallion
        }
        return (a.ar?.length ?? 0) + ` ۝${toArabicNumeral(displayAyahNumber(st.num, a.n))} `.length;
      };
      let startOff = 1; // leading RLM (U+200F) is the first rendered char
      for (let i = 0; i < idx; i++) startOff += lenOf(visible[i]);
      const endOff = startOff + lenOf(visible[idx]);
      const lines = flowLinesRef.current;
      let top: number | null = null;
      let bottom: number | null = null;
      let cum = 0;
      for (let i = 0; i < lines.length; i++) {
        const t = lines[i].text ?? "";
        const lineEnd = cum + t.length;
        const ly = lines[i].y ?? i * FLOW_LINE;
        const lh = (lines[i] as { height?: number }).height ?? FLOW_LINE;
        if (top === null && lineEnd > startOff) top = textTop + ly;
        if (lineEnd >= endOff) { bottom = textTop + ly + lh; break; }
        cum = lineEnd;
      }
      if (top === null) {
        // Lines not measured yet → coarse char-fraction estimate, centered.
        const frac = flowCharFraction(visible.map((a) => a.ar?.length ?? 0), idx);
        const cardTop = flowCardTopRef.current;
        const cardH = flowCardHeightRef.current;
        const est = cardTop + frac * cardH;
        sv.scrollTo({ y: Math.max(est - visibleH * 0.38, 0), animated: true });
        return;
      }
      if (bottom === null) bottom = top + FLOW_LINE;
      const ayahH = Math.max(bottom - top, FLOW_LINE);
      // Keep the ayah's LAST line clear of the bottom translation/player box (the owner's
      // hard requirement). If the whole ayah fits the reading area, CENTER it. If it's
      // taller than the area, BOTTOM-align it (last line just above the box) rather than
      // top-aligning — top-align would push the final line under the box. Bottom-align is
      // also self-correcting if `ayahH` is over-measured (e.g. Android's onTextLayout line
      // metrics differ): the end stays visible no matter what.
      const y = ayahH <= visibleH - 24
        ? top - (visibleH - ayahH) / 2
        : bottom - (visibleH - 24);
      sv.scrollTo({ y: Math.max(y, 0), animated: true });
    }
  }

  // Follow the reciting ayah: whenever the highlighted ayah changes, scroll so it
  // stays near the top. (See scrollToAyah for the By Ayah / By Surah strategies.)
  useEffect(() => {
    if (activeAyah == null || !ayahs) return;
    // While reading (paused) after the user has scrolled, never auto-scroll — their
    // scroll position is sacred. While playing, always follow the reciter.
    if (!playing && userTookOverRef.current) return;
    scrollToAyah(activeAyah);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAyah, app.reciteView]);

  // Mirror playback state to the shell so it can hide the bottom tab bar while playing
  // (more room for long ayahs). Always restore (false) when leaving the Recite screen.
  useEffect(() => {
    app.setRecitePlaying(playing);
    return () => app.setRecitePlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // Persist the spot the reciter has reached so a returning user can resume it.
  useEffect(() => {
    if (activeAyah != null) app.saveRecitePosition(num, activeAyah);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAyah, num]);

  // Auto-remember while READING (not listening): when a scroll settles and no
  // audio owns the position, save the ayah sitting at the top reading line so a
  // returning user resumes where they were reading. Exact in By Ayah (each card's
  // measured Y); approximate in By Surah (char-weighted position over the card).
  function onScrollSettle(e: NativeSyntheticEvent<NativeScrollEvent>) {
    if (playing || !userScrollRef.current) return; // audio owns it; ignore programmatic scrolls
    const st = stateRef.current;
    if (!st.ayahs) return;
    const y = e.nativeEvent.contentOffset.y;
    let ayahN: number | null = null;
    if (st.reciteView === "list") {
      ayahN = topAyahForList(ayahYRef.current, y);
    } else {
      const visible = st.ayahs.filter((a) => !(st.num === 1 && a.n === 1));
      if (visible.length) {
        const idx = flowIndexAtScroll(visible.map((a) => a.ar?.length ?? 0), y, flowCardTopRef.current, flowCardHeightRef.current);
        ayahN = visible[Math.min(idx, visible.length - 1)]?.n ?? null;
      }
    }
    if (ayahN != null) app.saveRecitePosition(st.num, ayahN);
  }
  function onMomentumScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    onScrollSettle(e);
    userScrollRef.current = false; // gesture complete
  }

  async function unload() {
    const s = soundRef.current;
    soundRef.current = null;
    if (s) { try { await s.unloadAsync(); } catch { /* already gone */ } }
  }
  async function stop() {
    tokenRef.current++;
    bismillahRef.current = false;
    setBismillahOn(false);
    await unload();
    setPlaying(false);
    setActiveAyah(null);
    setProgress(0);
  }

  async function loadSurah() {
    const my = ++loadTokenRef.current;
    userTookOverRef.current = false; // fresh surah → audio-follow / restore re-engages
    setReaderTookOver(false); // fresh surah → translation strip re-opens
    await stop();
    setLoading(true);
    setError(null);
    try {
      // Resolve the edition for the current language; default to en.sahih so a
      // failed translations lookup never sends an empty `translation` (which the
      // backend rejects — the bug that made every surah but Fatiha fail).
      const trId = (await translationIdForLanguage(app.language)) || "en.sahih";
      // Single-surah range is "surah:start-end" (e.g. "2:1-286").
      const verses = await getVerses([`${num}:1-${cnt}`], trId);
      if (my !== loadTokenRef.current) return;
      const loaded = verses.map((v) => ({ n: v.ayah, ar: v.arabic, tr: v.translation || "" }));
      setAyahs(loaded);
      // Warm the QPC V2 page fonts this surah spans. Each ayah renders its Unicode
      // text immediately and upgrades to authentic Madinah-mushaf glyphs as its page
      // font registers (qpcTick re-render). Fire-and-forget; never blocks load.
      for (const p of qpcPagesFor(loaded.map((a) => ({ surah: num, ayah: a.n })))) {
        void ensureQpcPage(p).then((ok) => { if (ok && my === loadTokenRef.current) setQpcTick((t) => t + 1); });
      }
      setTafOpen(new Set());
      setTafData({});
      setLoading(false);
      // Resume: if the saved spot is in this surah, re-highlight that ayah and
      // scroll to it (once layout settles) so the user picks up where they left.
      // We don't auto-play — pressing play continues from the highlighted ayah.
      const pos = app.recitePosition;
      if (pos && pos.surah === num && restoredForRef.current !== num && loaded.some((a) => a.n === pos.ayah)) {
        restoredForRef.current = num;
        setMode("surah");
        setActiveAyah(pos.ayah);
        setTimeout(() => { if (!userTookOverRef.current) scrollToAyah(pos.ayah); }, 400);
      }
    } catch (e) {
      if (my !== loadTokenRef.current) return;
      // Surface the real error (don't silently substitute bundled Fatiha, which
      // hid backend/key failures behind a single working surah).
      setAyahs(null);
      setLoading(false);
      setError(e instanceof AqError ? e.message : "Couldn’t load this surah. Check your connection and try again.");
    }
  }

  function onStatus(st: AVPlaybackStatus, myToken: number) {
    if (myToken !== tokenRef.current) return;
    if (!st.isLoaded) { if (st.error) setPlaying(false); return; }
    if (st.durationMillis) setProgress((st.positionMillis || 0) / st.durationMillis);
    setPlaying(st.isPlaying);
    if (st.didJustFinish) { setProgress(0); advance(); }
  }

  // Single source of truth for starting playback. We create the sound PAUSED and
  // only call playAsync() after re-checking the token: with shouldPlay:true the
  // native player starts emitting audio before createAsync's promise resolves, so
  // a superseded source would overlap the new one until we got a chance to unload
  // it (the "multiple audios" bug). Loading paused, then playing only if still
  // current, guarantees at most one audible source.
  async function playSource(uri: string, opts: { ayah: number | null; mode: "surah" | "single"; bismillah?: boolean }) {
    const myToken = ++tokenRef.current;
    userTookOverRef.current = false; // playback (re)starts → audio-follow re-engages
    setReaderTookOver(false); // playback (re)starts → translation strip re-opens
    bismillahRef.current = !!opts.bismillah;
    setBismillahOn(!!opts.bismillah);
    setMode(opts.mode);
    setActiveAyah(opts.ayah);
    setProgress(0);
    setPlaying(true);
    await unload();
    if (myToken !== tokenRef.current) return; // superseded while old sound unloaded
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        (st) => onStatus(st, myToken),
      );
      if (myToken !== tokenRef.current) { try { await sound.unloadAsync(); } catch { /* superseded */ } return; }
      soundRef.current = sound;
      await sound.playAsync();
      if (myToken !== tokenRef.current) { await unload(); return; } // superseded during play → stop
      setPlaying(true); // creating paused then playing leaves a brief not-playing status; reaffirm
    } catch {
      if (myToken === tokenRef.current) setPlaying(false); // CDN unreachable → leave stopped
    }
  }

  function loadAndPlay(ayahNum: number, m: "surah" | "single") {
    return playSource(ayahAudioUrl(stateRef.current.num, ayahNum), { ayah: ayahNum, mode: m });
  }
  function playBismillah() {
    return playSource(BISMILLAH_AUDIO_URL, { ayah: null, mode: "surah", bismillah: true });
  }

  function advance() {
    const st = stateRef.current;
    if (!st.ayahs) return;
    if (bismillahRef.current) { // Bismillah prelude finished → begin the surah at ayah 1
      bismillahRef.current = false;
      loadAndPlay(st.ayahs[0].n, "surah");
      return;
    }
    const idx = st.ayahs.findIndex((a) => a.n === st.activeAyah);
    if (st.mode === "single") {
      if (st.repeat && idx >= 0) loadAndPlay(st.ayahs[idx].n, "single");
      else void stop();
      return;
    }
    const next = st.ayahs[idx + 1];
    if (next) loadAndPlay(next.n, "surah");
    else if (st.repeat) loadAndPlay(st.ayahs[0].n, "surah");
    else void stop();
  }

  async function togglePlayAll() {
    const s = soundRef.current;
    if (playing) {
      if (s) { try { await s.pauseAsync(); } catch { /* noop */ } }
      setPlaying(false);
      if (activeAyah) track("audio_paused", { surah_name: name, ayah_key: `${num}:${activeAyah}`, progress_percent: Math.round(progress * 100) });
      return;
    }
    if (s) {
      // Resume the loaded (paused) audio. activeAyah is unchanged, so the
      // audio-follow effect won't re-fire — scroll to the playing spot explicitly
      // so the view returns to what's reciting (top for the Bismillah prelude).
      try { await s.playAsync(); setPlaying(true); } catch { /* noop */ }
      if (activeAyah != null) scrollToAyah(activeAyah);
      else scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (ayahs) {
      // Resume: an ayah is highlighted but nothing is loaded (a restored spot, or a
      // step/scrub target) — continue the surah from there rather than restarting.
      if (activeAyah != null) { loadAndPlay(activeAyah, "surah"); scrollToAyah(activeAyah); return; }
      // Fresh whole-surah playback — auto-advance through ayahs fires no events.
      track("surah_played", { surah_name: name, surah_no: num, ayah_count: cnt, reciter: RECITER });
      // Recite the Bismillah first, then ayah 1 — except Al-Fatiha (ayah 1 already
      // is the basmala) and At-Tawbah (9, no basmala). Scroll to the top so the
      // reader sees the recitation start (the Bismillah has no ayah to auto-follow).
      if (showBismillah && num !== 1) { playBismillah(); scrollRef.current?.scrollTo({ y: 0, animated: true }); }
      else loadAndPlay(ayahs[0].n, "surah");
    }
  }
  async function toggleAyah(n: number) {
    const s = soundRef.current;
    if (playing && activeAyah === n) {
      if (s) { try { await s.pauseAsync(); } catch { /* noop */ } }
      setPlaying(false);
      track("audio_paused", { surah_name: name, ayah_key: `${num}:${n}`, progress_percent: Math.round(progress * 100) });
    } else {
      track("ayah_played", { surah_name: name, surah_no: num, ayah_key: `${num}:${n}`, reciter: RECITER });
      loadAndPlay(n, "single");
    }
  }
  function step(dir: number) {
    if (!ayahs) return;
    const idx = ayahs.findIndex((a) => a.n === activeAyah);
    const ni = Math.min(Math.max((idx < 0 ? 0 : idx) + dir, 0), ayahs.length - 1);
    loadAndPlay(ayahs[ni].n, mode === "single" ? "single" : "surah");
  }

  const playerBtn = (icon: string, onPress: () => void, variant: "ghost" | "main", active?: boolean) => {
    const isMain = variant === "main";
    return (
      <Pressable
        onPress={onPress}
        style={{
          width: isMain ? 48 : 34, height: isMain ? 48 : 34, borderRadius: isMain ? 24 : 17,
          alignItems: "center", justifyContent: "center",
          backgroundColor: isMain ? tokens.brand : active ? mix(tokens.brand, 12) : "transparent",
        }}
      >
        <RIcon name={icon} size={isMain ? 22 : 18} color={isMain ? tokens.onBrand : active ? tokens.brand : tokens.text2} />
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Surah picker + By Ayah/By Surah toggle + translation-language pill. Hidden while
          audio is playing to free vertical room so long ayahs show in full (owner request
          2026-06-18); the top app-bar globe still opens the same language sheet, so language
          stays reachable "next to the world icon." Restored the moment playback pauses. */}
      {!playing ? (
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14 }}>
        <Pressable onPress={app.openSurahSheet} style={[{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }, tokens.cardShadow]}>
          <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11), borderWidth: 1, borderColor: mix(tokens.brand, 22, tokens.line) }}>
            <Text style={{ fontFamily: FONTS.serif[600], fontSize: 17, color: tokens.brand }}>{num}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.serif[600], fontSize: 19, color: tokens.text }}>{app.t(`facts.s.${num}`)}</Text>
            <Text style={{ fontSize: 11.5, color: tokens.text3, marginTop: 2 }}>
              <Text style={{ fontFamily: FONTS.sans[700], color: place === "Meccan" ? tokens.mecca : tokens.medina }}>{app.t(place === "Meccan" ? "recite.meccan" : "recite.medinan")}</Text> · {app.t("recite.ayahs", { n: cnt })}
            </Text>
          </View>
          <Text style={{ fontFamily: FONTS.ar, fontSize: 24, color: tokens.orn }}>{arName}</Text>
          <Icon name="chevDown" size={16} w={2.1} color={tokens.text3} />
        </Pressable>

        {/* By Ayah / By Surah view toggle + translation-language control on one row.
            By-Surah is the DEFAULT (owner request 2026-06-18) but both tabs stay available
            and reappear when playback pauses. */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 11 }}>
          <View style={{ flex: 1, flexDirection: "row", backgroundColor: tokens.surface2, borderWidth: 1, borderColor: tokens.line, borderRadius: 11, padding: 3 }}>
            {([
              { v: "list", icon: "list", label: app.t("recite.byAyah") },
              { v: "flow", icon: "book", label: app.t("recite.bySurah") },
            ] as const).map((opt) => {
              const on = app.reciteView === opt.v;
              return (
                <Pressable
                  key={opt.v}
                  onPress={() => app.setReciteView(opt.v)}
                  style={[
                    { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 8, backgroundColor: on ? tokens.surface : "transparent" },
                    on ? tokens.cardShadow : null,
                  ]}
                >
                  <RIcon name={opt.icon} size={15} color={on ? tokens.brand : tokens.text2} />
                  <Text style={{ fontSize: 12, fontFamily: FONTS.sans[on ? 700 : 600], color: on ? tokens.brand : tokens.text2 }}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable onPress={() => app.openLangSheet()} style={{ flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: tokens.line, backgroundColor: tokens.surface2, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}>
            <Icon name="globe" size={15} color={tokens.text2} />
            <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[600], color: tokens.text }}>{app.language}</Text>
            <Icon name="chevDown" size={13} w={2.1} color={tokens.text3} />
          </Pressable>
        </View>
      </View>
      ) : null}

      {/* body */}
      <ScrollView
        ref={scrollRef}
        onLayout={(e) => { scrollViewHRef.current = e.nativeEvent.layout.height; }}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14 }}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => { userScrollRef.current = true; userTookOverRef.current = true; if (!playing) setReaderTookOver(true); }}
        onScrollEndDrag={onScrollSettle}
        onMomentumScrollEnd={onMomentumScrollEnd}
      >
        {loading ? (
          <View style={{ alignItems: "center", paddingTop: 64 }}>
            <ActivityIndicator color={tokens.brand} />
            <Text style={{ marginTop: 12, fontSize: 13, color: tokens.text3 }}>{app.t("m.loadingSurah", { name: app.t(`facts.s.${num}`) })}</Text>
          </View>
        ) : ayahs && app.reciteView === "flow" ? (
          /* ── BY SURAH (mushaf / flow) view — continuous text in a golden card ── */
          <>
            <View
              onLayout={(e) => { flowCardTopRef.current = e.nativeEvent.layout.y; flowCardHeightRef.current = e.nativeEvent.layout.height; }}
              style={{ borderWidth: 1.5, borderColor: mix(tokens.orn, 72, tokens.surface), borderRadius: 16, backgroundColor: tokens.surface, padding: 5 }}
            >
              <View
                onLayout={(e) => { flowInnerTopRef.current = e.nativeEvent.layout.y; }}
                style={{ borderWidth: 1, borderColor: mix(tokens.orn, 34, tokens.surface), borderRadius: 12, overflow: "hidden" }}
              >
                {/* mushaf header band — surah name flanked by place + ayah count */}
                <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: mix(tokens.orn, 70, tokens.surface), backgroundColor: mix(tokens.orn, 8, tokens.surface) }}>
                  <Text style={{ flex: 1, fontFamily: FONTS.ar, fontSize: 15, color: mix(tokens.orn, 80, tokens.text), textAlign: "left", writingDirection: "rtl" }}>
                    {place === "Meccan" ? "مَكِّيَّة" : "مَدَنِيَّة"}
                  </Text>
                  <Text style={{ fontFamily: FONTS.surah, fontSize: 40, color: tokens.brand, textAlign: "center", writingDirection: "rtl" }}>{surahNameChar(num)}</Text>
                  <Text style={{ flex: 1, fontFamily: FONTS.ar, fontSize: 15, color: mix(tokens.orn, 80, tokens.text), textAlign: "right", writingDirection: "rtl" }}>
                    آيَاتُهَا {toArabicNumeral(cnt)}
                  </Text>
                </View>
                {/* Bismillah — centered header above the surah body (never inline with
                    ayahs); highlighted while its prelude audio plays. */}
                {showBismillah ? (
                  <Text style={{ fontFamily: FONTS.ar, fontSize: 24, lineHeight: 44, color: tokens.text, textAlign: "center", writingDirection: "rtl", paddingTop: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: mix(tokens.orn, 28, tokens.surface), paddingBottom: 14, backgroundColor: bismillahOn ? mix(tokens.brand, 13, tokens.surface) : undefined }}>{BISMILLAH.ar}</Text>
                ) : null}
                {/* continuous Arabic — each ayah inline, tap to play, rosette marker after */}
                <Text
                  onLayout={(e) => { flowTextTopRef.current = e.nativeEvent.layout.y; }}
                  onTextLayout={(e) => { flowLinesRef.current = e.nativeEvent.lines; }}
                  style={{ fontFamily: FONTS.ar, fontSize: 26, lineHeight: 58, color: tokens.arColor, textAlign: "justify", writingDirection: "rtl", direction: "rtl", paddingVertical: 18, paddingHorizontal: 16 }}
                >
                  {/* Leading RLM (U+200F): QPC glyphs are bidi-neutral PUA, so force the
                      paragraph's base direction RTL — else justify hugs the left edge. */}
                  {"‏"}
                  {ayahs.filter((a) => !(num === 1 && a.n === 1)).map((a) => {
                    const on = activeAyah === a.n;
                    const dispNum = displayAyahNumber(num, a.n);
                    const hl = on ? { backgroundColor: mix(tokens.brand, 13, tokens.surface) } : null;
                    const page = qpcPage(num, a.n);
                    const entry = qpcAyah(num, a.n);
                    const qpcReady = page != null && entry != null && isPageReady(page);
                    // Amiri ۝ (U+06DD, ARABIC END OF AYAH) renders a clean ring around the
                    // Arabic-Indic digit — used as the verse marker in the Unicode fallback
                    // and as Al-Fatihah's own number (its baked QPC medallion is suppressed).
                    const marker = (
                      <Text style={{ fontFamily: FONTS.ar, fontSize: 24, color: tokens.orn, textAlign: "justify", writingDirection: "rtl" }}>{` ۝${toArabicNumeral(dispNum)} `}</Text>
                    );
                    if (qpcReady) {
                      // Al-Fatihah: strip the baked medallion (it counts the bismillah) and
                      // show our own number. Every other surah keeps the native medallion.
                      const glyphs = num === 1 ? stripMedallion(entry.g) : entry.g;
                      // Glyphs go DIRECTLY on the highlighted Text (page font on it too) — a
                      // Text's backgroundColor only paints its own text runs, NOT nested child
                      // Texts, so nesting the glyphs left the active-ayah highlight uncovered.
                      return (
                        <Text key={a.n} onPress={() => toggleAyah(a.n)} accessibilityLabel={a.ar} style={{ fontFamily: qpcFamily(page), textAlign: "justify", writingDirection: "rtl", ...hl }}>
                          {glyphs}
                          {/* The QPC glyph string already has a space BEFORE the baked end-
                              medallion (its token separator); ayahs are concatenated with no
                              separator, so add one trailing space AFTER it too — under justify
                              both sides become one equal stretched space, keeping the ornamental
                              verse number evenly gapped on both sides (owner standard). */}
                          {num === 1 ? <Text style={{ fontFamily: FONTS.ar, fontSize: 24, color: tokens.orn, ...hl }}>{` ۝${toArabicNumeral(dispNum)} `}</Text> : " "}
                        </Text>
                      );
                    }
                    // Page font not loaded yet (or no glyph data) → readable Unicode fallback
                    // with the ۝ marker; upgrades to glyphs when the page font registers.
                    return (
                      <Text key={a.n} onPress={() => toggleAyah(a.n)} style={{ textAlign: "justify", writingDirection: "rtl", ...hl }}>
                        {a.ar}
                        {marker}
                      </Text>
                    );
                  })}
                </Text>
              </View>
            </View>
            <Text style={{ textAlign: "center", fontFamily: FONTS.ar, color: tokens.orn, fontSize: 16, paddingTop: 22, paddingBottom: 6, opacity: 0.8 }}>۞ {app.t("recite.endOfSurah", { name: app.t(`facts.s.${num}`) })} ۞</Text>
          </>
        ) : ayahs ? (
          <>
            {showBismillah ? (
              <View style={{ borderRadius: 16, paddingBottom: bismillahOn ? 14 : 0, marginBottom: bismillahOn ? 6 : 0, backgroundColor: bismillahOn ? mix(tokens.brand, 6, tokens.surface) : undefined, borderWidth: bismillahOn ? 1 : 0, borderColor: bismillahOn ? mix(tokens.brand, 34, tokens.line) : "transparent" }}>
                <Text style={{ fontFamily: FONTS.ar, fontSize: 24, lineHeight: 43, color: tokens.text, textAlign: "center", writingDirection: "rtl", paddingTop: bismillahOn ? 14 : 8, paddingBottom: bismillahOn ? 8 : 18 }}>{BISMILLAH.ar}</Text>
                {bismillahOn ? (
                  <Text style={[translationStyle(app.language, tokens), { color: tokens.text2, textAlign: "center", paddingHorizontal: 16 }]}>{bismillahTr}</Text>
                ) : null}
              </View>
            ) : null}
            <>
              {ayahs.filter((a) => !(num === 1 && a.n === 1)).map((a) => {
                const on = activeAyah === a.n;
                const tOpen = tafOpen.has(a.n);
                const td = tafData[a.n];
                const dispNum = displayAyahNumber(num, a.n);
                const juz = JUZ_STARTS[`${num}:${a.n}`];
                return (
                  <React.Fragment key={a.n}>
                  {juz ? <JuzDivider juz={juz} label={app.t("recite.juz", { n: juz })} tokens={tokens} /> : null}
                  <View
                    onLayout={(e) => { ayahYRef.current[a.n] = e.nativeEvent.layout.y; }}
                    style={[
                      {
                        flexDirection: physicalRow(), gap: 13, padding: 14, marginBottom: 12, borderRadius: 16, borderWidth: 1,
                        borderColor: on ? mix(tokens.brand, 34, tokens.line) : tokens.line,
                        backgroundColor: on ? mix(tokens.brand, 6, tokens.surface) : tokens.surface,
                      },
                      tokens.cardShadow,
                    ]}
                  >
                    <View style={{ alignItems: "center", gap: 10, paddingTop: 2 }}>
                      {/* Verse number now shows as the ornamental QPC medallion in the
                          ayah text (suppressed → no duplicate), so the rail keeps only
                          the play control. */}
                      <Pressable
                        onPress={() => toggleAyah(a.n)}
                        style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: on ? tokens.brand : tokens.line, backgroundColor: on ? tokens.brand : tokens.surface2 }}
                      >
                        <RIcon name={on && playing ? "pause" : "play"} size={15} color={on ? tokens.onBrand : tokens.brand} />
                      </Pressable>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Pressable onPress={() => toggleAyah(a.n)}>
                        {/* QPC V2 glyphs with the native ornamental medallion. Al-Fatihah
                            bakes its medallions counting the bismillah, so there we strip it
                            and render our own number; every other surah keeps the medallion. */}
                        <QuranText surah={num} ayah={a.n} uthmani={a.ar} color={tokens.arColor} fontSize={26} lineHeight={58} suppressMedallion={num === 1} ownNumber={num === 1 ? dispNum : undefined} />
                      </Pressable>
                      {a.tr ? (
                        <Text style={[translationStyle(app.language, tokens), { marginTop: 9, color: tokens.text2 }]}>
                          {a.tr}
                        </Text>
                      ) : null}
                      {on && playing ? <Equalizer color={tokens.brand} /> : null}

                      {/* per-ayah tafsir (lazy, stored sources, chosen language) */}
                      <Pressable onPress={() => toggleTafsir(a.n)} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, alignSelf: "flex-start" }}>
                        <Icon name="info" size={14} color={tokens.brand2} />
                        <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[700], color: tokens.brand2 }}>{app.t(tOpen ? "recite.hideTafsir" : "recite.viewTafsir")}</Text>
                      </Pressable>
                      {tOpen ? (
                        <View style={{ marginTop: 10, paddingHorizontal: 13, paddingVertical: 12, backgroundColor: mix(tokens.gold, 7, tokens.surface2), borderWidth: 1, borderColor: tokens.lineSoft, borderRadius: 12 }}>
                          {!td || td.loading ? (
                            <Text style={{ fontSize: 12.5, color: tokens.text3 }}>{app.t("recite.tafsirLoading")}</Text>
                          ) : td.error ? (
                            <Text style={{ fontSize: 12.5, color: tokens.text3 }}>{app.t("recite.tafsirError")}</Text>
                          ) : !td.available ? (
                            <Text style={{ fontSize: 12.5, color: tokens.text3, fontStyle: "italic" }}>{app.t("recite.tafsirUnavailable", { language: app.tafsirLanguage })}</Text>
                          ) : (
                            <>
                              <Text style={{ fontFamily: FONTS.serif[400], fontSize: 13.5, lineHeight: 23, color: tokens.text }}>{td.text}</Text>
                              {td.edition ? <Text style={{ fontSize: 11, fontFamily: FONTS.sans[600], color: tokens.text3, marginTop: 6 }}>{td.edition}</Text> : null}
                            </>
                          )}
                        </View>
                      ) : null}
                    </View>
                  </View>
                  </React.Fragment>
                );
              })}
            </>
            <Text style={{ textAlign: "center", fontFamily: FONTS.ar, color: tokens.orn, fontSize: 16, paddingTop: 22, paddingBottom: 6, opacity: 0.8 }}>۞ {app.t("recite.endOfSurah", { name: app.t(`facts.s.${num}`) })} ۞</Text>
          </>
        ) : (
          <View style={{ alignItems: "center", paddingTop: 60, paddingHorizontal: 20 }}>
            <RIcon name="wave" size={40} color={tokens.brand} />
            <Text style={{ marginTop: 12, fontSize: 14, lineHeight: 24, color: tokens.text3, textAlign: "center" }}>
              {error || app.t("recite.error")}
            </Text>
            <Pressable onPress={loadSurah} style={{ marginTop: 18, backgroundColor: tokens.brand, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 14, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>{app.t("m.retry")}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* sticky player */}
      {ayahs ? (
        <View style={{ borderTopWidth: 1, borderTopColor: tokens.lineSoft, backgroundColor: tokens.bg }}>
          {/* Current-ayah translation strip — in By Surah (flow) view the continuous
              mushaf text shows no inline translation, so (matching the web + design)
              we surface the playing ayah's translation just above the player. By Ayah
              already renders each translation inline, so it's only shown for flow. */}
          {app.reciteView === "flow" && bismillahOn && !readerTookOver ? (
            <View style={{ paddingHorizontal: 16, paddingTop: 11, paddingBottom: 11, borderBottomWidth: 1, borderBottomColor: tokens.lineSoft }}>
              <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[700], letterSpacing: 0.6, textTransform: "uppercase", color: tokens.orn, marginBottom: 4 }}>
                {app.t("recite.bismillah")}
              </Text>
              <Text numberOfLines={3} style={[translationStyle(app.language, tokens), { color: tokens.text2 }]}>
                {bismillahTr}
              </Text>
            </View>
          ) : null}
          {app.reciteView === "flow" && activeAyah && !bismillahOn && !readerTookOver
            ? (() => {
                const cur = ayahs.find((a) => a.n === activeAyah);
                if (!cur?.tr) return null;
                const disp = displayAyahNumber(num, activeAyah);
                return (
                  <View style={{ paddingHorizontal: 16, paddingTop: 11, paddingBottom: 11, borderBottomWidth: 1, borderBottomColor: tokens.lineSoft }}>
                    <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[700], letterSpacing: 0.6, textTransform: "uppercase", color: tokens.orn, marginBottom: 4 }}>
                      {app.t("recite.ayahLabel", { name: app.t(`facts.s.${num}`), n: disp })}
                    </Text>
                    <Text numberOfLines={3} style={[translationStyle(app.language, tokens), { color: tokens.text2 }]}>
                      {cur.tr}
                    </Text>
                  </View>
                );
              })()
            : null}
          <View style={{ height: 3, backgroundColor: tokens.lineSoft }}>
            <View style={{ position: "absolute", left: 0, top: 0, height: 3, width: `${Math.min(progress * 100, 100)}%`, backgroundColor: tokens.brand }} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 11, paddingBottom: playing ? 30 : 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontFamily: FONTS.sans[700], letterSpacing: 0.6, textTransform: "uppercase", color: tokens.orn }}>Mishary Alafasy</Text>
              <Text numberOfLines={1} style={{ fontSize: 13, fontFamily: FONTS.sans[600], color: tokens.text, marginTop: 2 }}>
                {activeAyah ? app.t("recite.ayahLabel", { name: app.t(`facts.s.${num}`), n: activeAyah }) : app.t("recite.surahCount", { name: app.t(`facts.s.${num}`), n: cnt })}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
              {playerBtn("repeat", () => setRepeat((v) => !v), "ghost", repeat)}
              {playerBtn("prev", () => step(-1), "ghost")}
              {playerBtn(playing ? "pause" : "play", togglePlayAll, "main")}
              {playerBtn("next", () => step(1), "ghost")}
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
