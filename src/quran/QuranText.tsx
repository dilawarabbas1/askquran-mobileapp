// <QuranText> — renders a single ayah in authentic QPC V2 Madinah-mushaf glyphs.
//
// Pairs the ayah's private-use glyph string with its page font (qpc-p{page}),
// downloading + registering the font on demand. While the page font loads it shows
// a skeleton (never a blank, never a premature Unicode flash); only if the font
// genuinely can't be fetched does it fall back to plain Unicode Uthmani. The real
// Unicode text is always the accessibilityLabel (screen readers / copy).
//
// Alignment (app-wide standard): ayahs are JUSTIFIED — body lines fill the full
// width, and a short last line (that can't be justified) is RIGHT-aligned.
//   • Android: RN's native `textAlign:"justify"` + `direction:"rtl"` already does
//     this (fills + right-anchors the last line). Left as-is.
//   • iOS: RN/iOS justify left-anchors the last line by the app-wide (LTR) direction
//     and ignores per-view RTL, so we emulate justify with a custom per-line layout:
//     measure the line breaks, then lay each line out as flex word-glyphs —
//     `space-between` fills non-last lines, the last line packs to the right. This
//     works because QPC glyph codes are space-separated, independent units.
//
// Numbering: normal surahs keep the baked medallion (last glyph). suppressMedallion
// strips it (number shown elsewhere). ownNumber renders an inline ۝ marker (Al-Fatihah).

import React, { useEffect, useState } from "react";
import { Platform, View, type TextStyle } from "react-native";
import { Text } from "../design/AppText";
import { FONTS } from "../design/tokens";
import { qpcAyah, stripMedallion } from "./qpcIndex";
import { ensureQpcPage, isPageReady, isPageFailed, qpcFamily } from "./qpcFonts";

const RLM = "‏"; // Right-to-Left Mark — pins RTL base direction for neutral PUA glyphs
const END_OF_AYAH = "۝"; // ۝ (used as Al-Fatihah's own verse marker)

export type QuranTextProps = {
  surah: number;
  ayah: number;
  /** Real Unicode Uthmani — accessibility label always; visible fallback if QPC unavailable. */
  uthmani?: string;
  fontSize?: number;
  lineHeight?: number;
  color: string;
  /** Strip the baked numbered medallion (Fatiha custom numbering / number shown elsewhere). */
  suppressMedallion?: boolean;
  /** Render a custom inline number after the glyphs (null = no number; for Al-Fatihah). */
  ownNumber?: number | null;
  /** Override alignment. Default: justified (Android native / iOS emulated). */
  align?: TextStyle["textAlign"];
};

function toArabicDigits(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

export function QuranText({
  surah,
  ayah,
  uthmani,
  fontSize = 28,
  lineHeight = 58,
  color,
  suppressMedallion = false,
  ownNumber,
  align,
}: QuranTextProps) {
  const entry = qpcAyah(surah, ayah);
  const page = entry?.p;
  const [fontTick, force] = useState(0);
  // iOS only: measured line breaks (each line's glyph substring) for custom justify.
  const [iosLines, setIosLines] = useState<string[] | null>(null);
  // iOS only: if the invisible measure pass's onTextLayout never fires (observed when
  // many ayahs across different pages mount at once, e.g. the Passage screen), fall
  // back to a VISIBLE native-justify render so the Arabic is never left blank.
  const [measureFailed, setMeasureFailed] = useState(false);

  useEffect(() => {
    if (!page) return;
    if (isPageReady(page) || isPageFailed(page)) return;
    let alive = true;
    void ensureQpcPage(page).then(() => { if (alive) force((x) => x + 1); });
    return () => { alive = false; };
  }, [page]);

  // Re-measure when the ayah (or its page-readiness) changes.
  useEffect(() => { setIosLines(null); setMeasureFailed(false); }, [surah, ayah, page]);

  // iOS fallback timer: while we're waiting on the measure pass's onTextLayout, give it
  // a short window; if it hasn't reported line breaks by then, render the native-justify
  // text instead (visible, never blank). `fontTick` is in the deps so this RE-ARMS when the
  // page font finishes loading after mount (the common case) — without it the timer would
  // only ever fire for pages whose font was already cached, leaving late-loaded ayahs blank.
  useEffect(() => {
    if (Platform.OS !== "ios" || !page || iosLines !== null || measureFailed) return;
    if (!isPageReady(page)) return;
    const id = setTimeout(() => setMeasureFailed(true), 300);
    return () => clearTimeout(id);
  }, [page, iosLines, measureFailed, fontTick]);

  const baseStyle: TextStyle = {
    fontSize,
    lineHeight,
    color,
    writingDirection: "rtl",
  };

  // Full-width RTL container.
  const wrap = (child: React.ReactNode) => (
    <View style={{ width: "100%", direction: "rtl" }} accessibilityLabel={uthmani}>{child}</View>
  );

  // No glyph data / fetch failed → Unicode (authentic verbatim text). Right-aligned
  // (Unicode is strong-RTL so this is clean on both platforms); rare path.
  if (!entry || !page || isPageFailed(page)) {
    return wrap(
      <Text style={[baseStyle, { fontFamily: FONTS.ar, textAlign: "right" }]}>{RLM}{uthmani ?? ""}</Text>,
    );
  }

  // Page font still loading → skeleton, never a blank or premature Unicode flash.
  if (!isPageReady(page)) {
    return (
      <View style={{ flexDirection: "row-reverse", alignItems: "center", minHeight: lineHeight, gap: 8, opacity: 0.5 }} accessibilityLabel={uthmani}>
        <View style={{ flex: 1, height: fontSize * 0.6, borderRadius: 6, backgroundColor: color, opacity: 0.12 }} />
      </View>
    );
  }

  const glyphs = suppressMedallion || ownNumber !== undefined ? stripMedallion(entry.g) : entry.g;
  const fam = qpcFamily(page);
  const ownMarker = ownNumber != null ? ` ${END_OF_AYAH}${toArabicDigits(ownNumber)}` : "";
  const fullStr = glyphs + ownMarker;

  // ANDROID (and any explicit align override): native justify — fills body, last line
  // right-anchored. Don't change this path.
  if (Platform.OS !== "ios" || align) {
    return wrap(
      <Text style={[baseStyle, { fontFamily: fam, textAlign: align ?? "justify", direction: "rtl", alignSelf: "stretch" }]}>
        {RLM}{glyphs}
        {ownNumber != null ? (
          <Text style={{ fontFamily: FONTS.ar, fontSize: fontSize * 0.9, color }}>{` ${END_OF_AYAH}${toArabicDigits(ownNumber)}`}</Text>
        ) : null}
      </Text>,
    );
  }

  // iOS: measure pass (invisible) to capture the justified line breaks. If the measure
  // pass timed out without onTextLayout firing, render the native-justify text VISIBLE
  // (graceful fallback — body lines fill, last line may left-anchor, but never blank).
  if (iosLines === null) {
    return wrap(
      <Text
        style={[baseStyle, { fontFamily: fam, textAlign: "justify", direction: "rtl", alignSelf: "stretch", opacity: measureFailed ? 1 : 0 }]}
        onTextLayout={(e) => {
          const ls = e.nativeEvent.lines.map((l) => l.text);
          if (ls.length) setIosLines(ls);
        }}
      >
        {RLM}{fullStr}
      </Text>,
    );
  }

  // iOS: visible per-line layout — fill non-last lines (space-between), right-pack last.
  // NOTE: no `direction:"rtl"` on these containers — it would flip `row-reverse` and push
  // `flex-start` to the LEFT. Pure `row-reverse` gives RTL order with main-start = RIGHT,
  // so the last line (flex-start) packs to the right; non-last lines (space-between) fill.
  return (
    <View style={{ width: "100%" }} accessibilityLabel={uthmani}>
      {iosLines.map((lineText, i) => {
        const isLast = i === iosLines.length - 1;
        const words = lineText.replace(/‏/g, "").trim().split(/\s+/).filter(Boolean);
        if (!words.length) return null;
        return (
          <View key={i} style={{ width: "100%", alignSelf: "stretch", flexDirection: "row-reverse", justifyContent: isLast ? "flex-start" : "space-between", minHeight: lineHeight }}>
            {words.map((w, j) => {
              const isMarker = w.indexOf(END_OF_AYAH) >= 0;
              return (
                <Text key={j} style={{ fontFamily: isMarker ? FONTS.ar : fam, fontSize: isMarker ? fontSize * 0.9 : fontSize, lineHeight, color, writingDirection: "rtl" }}>{w}</Text>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
