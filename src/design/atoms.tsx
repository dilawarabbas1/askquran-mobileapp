// Shared visual atoms ported from aq-ui.jsx — the logo mark, wordmark, ornament
// divider, translation block, ayah card, and the settings toggle. Styling
// mirrors aq-app.css using the live theme tokens.

import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "./AppText";
import { SvgXml } from "react-native-svg";
import { useApp } from "./AQContext";
import { Icon } from "./Icon";
import { AudioBar } from "./AudioBar";
import { physicalLeft, physicalRight, scriptKind } from "./lib/rtl";
import { copyAyah, shareAyah } from "./lib/ayahActions";
import { withHonorifics } from "./lib/honorifics";
import type { AyahItem } from "./data";
import { FONTS, mix, type Tokens } from "./tokens";
import { track } from "@/analytics";
import { surahName, surahNoFromRef } from "@/analytics/events";
import { QuranText } from "../quran/QuranText";
import { saFromKey } from "../quran/qpcIndex";

/* ---------- translation text style by language (RTL-aware) ----------
 * Urdu → Nastaliq RTL; other RTL languages (Arabic, Persian, Pashto, Sindhi,
 * Divehi, Uyghur) → Amiri RTL; everything else (incl. Kurmanji Kurdish) → LTR
 * serif. The RTL set lives in lib/rtl.ts — keep this list in sync with it.
 *
 * This function is the single source of truth for translation font size: sizes
 * are tuned per script so every language reads comfortably (Nastaliq/Arabic
 * scripts need a larger glyph + line height than Latin). Callers must NOT
 * override fontSize/lineHeight — to render a smaller compact variant (e.g. an
 * "in context" list) pass `scale` (e.g. 0.9) so the per-language ratio is kept.
 * Callers may still append colour / margin overrides. */
export function translationStyle(language: string, tokens: Tokens, scale = 1) {
  const k = scriptKind(language);
  const r = (n: number) => Math.round(n * scale * 10) / 10;
  // Align each translation to its own physical reading edge regardless of the
  // interface direction (see physicalRight/physicalLeft — they pre-compensate for
  // RN's swapLeftAndRightInRTL). Hardcoding "right"/"left" broke this: under the
  // Urdu UI the swap turned an Urdu translation's "right" into a physical left.
  if (k === "ur") return { fontSize: r(18), lineHeight: r(48), color: tokens.text, fontFamily: FONTS.ur[400], textAlign: physicalRight(), writingDirection: "rtl" as const };
  if (k === "rtl") return { fontSize: r(19), lineHeight: r(40), color: tokens.text, fontFamily: FONTS.ar, textAlign: physicalRight(), writingDirection: "rtl" as const };
  return { fontSize: r(15.5), lineHeight: r(27), color: tokens.text, fontFamily: FONTS.serif[400], textAlign: physicalLeft(), writingDirection: "ltr" as const };
}

/* ---------- logo mark (lens + open book) ---------- */
export function Mark({ size = 26 }: { size?: number }) {
  const { tokens } = useApp();
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="43" cy="43" r="27" fill="none" stroke="${tokens.brand}" stroke-width="6.4" stroke-linecap="round"/>
    <line x1="62.2" y1="62.2" x2="83" y2="83" stroke="${tokens.brand}" stroke-width="8" stroke-linecap="round"/>
    <g fill="none" stroke="${tokens.orn}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M43,34 C38,30.5 31,30 26,33 L26,49 C31,46.5 38,47 43,50.5"/>
      <path d="M43,34 C48,30.5 55,30 60,33 L60,49 C55,46.5 48,47 43,50.5"/>
      <path d="M43,34 L43,50.5"/>
    </g></svg>`;
  return <SvgXml xml={xml} width={size} height={size} />;
}

export function Wordmark({ size = 18 }: { size?: number }) {
  const { tokens } = useApp();
  return (
    <Text style={{ fontSize: size, color: tokens.brand, letterSpacing: -size * 0.02 }}>
      <Text style={{ fontFamily: FONTS.sans[500] }}>Ask </Text>
      <Text style={{ fontFamily: FONTS.sans[800] }}>Quran</Text>
    </Text>
  );
}

/* ---------- ornament divider ---------- */
export function OrnDivider() {
  const { tokens } = useApp();
  const orn = tokens.orn;
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="24" viewBox="0 0 230 24">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${orn}" stop-opacity="0"/><stop offset="1" stop-color="${orn}" stop-opacity="0.55"/>
      </linearGradient>
      <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${orn}" stop-opacity="0.55"/><stop offset="1" stop-color="${orn}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect x="0" y="11.5" width="94" height="1" fill="url(#lg)"/>
    <g transform="translate(103 0)" fill="none" stroke="${orn}" stroke-width="4">
      <rect x="9" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6" transform="rotate(45 12 12)"/>
    </g>
    <circle cx="115" cy="12" r="2.6" fill="${orn}"/>
    <rect x="136" y="11.5" width="94" height="1" fill="url(#rg)"/>
  </svg>`;
  return (
    <View style={{ alignItems: "center", marginTop: 20, marginBottom: 4 }}>
      <SvgXml xml={xml} width={230} height={24} />
    </View>
  );
}

/* ---------- translation block (styled by the current translation language) ---------- */
export function Translation({ item }: { item: AyahItem }) {
  const { tokens, language, t } = useApp();
  // For API items both en/ur hold the fetched translation; the style (font +
  // direction) follows the chosen translation language, so every RTL language
  // (not just Urdu) renders right-aligned in an Arabic-capable font.
  const txt = item.en || item.ur;
  const tStyle = translationStyle(language, tokens);
  return (
    <View>
      <Text style={{ fontSize: 10, fontFamily: FONTS.sans[700], letterSpacing: 1.4, textTransform: "uppercase", color: tokens.text3, marginBottom: 7 }}>
        {t("results.translation")}
      </Text>
      <Text style={tStyle}>{withHonorifics(txt, tStyle.fontSize)}</Text>
    </View>
  );
}

/* ---------- place badge ---------- */
export function PlaceBadge({ place, tokens, madinahLabel = "Medinan" }: { place: string; tokens: Tokens; madinahLabel?: string }) {
  const meccan = place === "Mecca";
  return (
    <Text
      style={{
        fontSize: 10, fontFamily: FONTS.sans[700], letterSpacing: 0.3, paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 5, overflow: "hidden",
        color: meccan ? tokens.mecca : tokens.medina,
        backgroundColor: meccan ? tokens.meccaBg : tokens.medinaBg,
      }}
    >
      {meccan ? "Meccan" : madinahLabel}
    </Text>
  );
}

/* ---------- expander row ---------- */
function Expander({ label, open, onToggle, tokens }: { label: string; open: boolean; onToggle: () => void; tokens: Tokens }) {
  return (
    <Pressable onPress={onToggle} style={{ flexDirection: "row", alignItems: "center", paddingTop: 11, paddingBottom: 4 }}>
      <Text style={{ flex: 1, fontSize: 11, fontFamily: FONTS.sans[700], letterSpacing: 1.1, textTransform: "uppercase", color: tokens.brand2 }}>{label}</Text>
      <Text style={{ fontSize: 9, color: tokens.brand2, transform: [{ rotate: open ? "180deg" : "0deg" }] }}>▼</Text>
    </Pressable>
  );
}

function Surrounding({ item, tokens }: { item: AyahItem; tokens: Tokens }) {
  const { language } = useApp();
  return (
    <View style={{ marginTop: 6, marginBottom: 2, gap: 9 }}>
      {item.surrounding.map((n, i) => (
        <View
          key={i}
          style={{
            paddingHorizontal: 13, paddingVertical: 11, borderRadius: 11, borderWidth: 1,
            borderColor: n.center ? mix(tokens.brand, 35) : tokens.lineSoft,
            backgroundColor: n.center ? mix(tokens.brand, 5, tokens.surface2) : tokens.surface2,
          }}
        >
          <Text style={{ fontSize: 10, fontFamily: FONTS.sans[700], letterSpacing: 0.4, color: tokens.text3, marginBottom: 5 }}>
            {n.ref}{n.center ? " · matched" : ""}
          </Text>
          <Text style={{ fontFamily: FONTS.ar, fontSize: 18, lineHeight: 33, color: tokens.arColor, textAlign: physicalRight(), writingDirection: "rtl" }}>{n.ar}</Text>
          <Text style={[translationStyle(language, tokens, 0.9), { color: tokens.text2, marginTop: 4 }]}>{n.en}</Text>
        </View>
      ))}
    </View>
  );
}

/* ---------- AYAH CARD ---------- */
export function AyahCard({ item, rank }: { item: AyahItem; rank?: number }) {
  const app = useApp();
  const { tokens } = app;
  const [taf, setTaf] = useState(false);
  const [sur, setSur] = useState(false);
  const saved = app.isSaved(item.ref);

  return (
    <View style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 18, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 15 }, tokens.cardShadow]}>
      {/* top */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 }}>
          {rank ? (
            <View style={{ width: 24, height: 24, borderRadius: 999, backgroundColor: tokens.brand, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: tokens.onBrand, fontSize: 12, fontFamily: FONTS.sans[700] }}>{rank}</Text>
            </View>
          ) : null}
          <Text style={{ fontFamily: FONTS.serif[500], fontSize: 17.5, color: tokens.text }}>
            {item.surah} <Text style={{ color: tokens.brand2 }}>{item.ref}</Text>
          </Text>
        </View>
        <Text style={{ fontSize: 10, fontFamily: FONTS.sans[600], color: tokens.text3, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, overflow: "hidden", backgroundColor: mix(tokens.gold, 13), borderWidth: 1, borderColor: mix(tokens.gold, 32) }}>
          rel {item.relevance}
        </Text>
      </View>

      {/* meta */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 9, marginTop: 7, marginBottom: 14, paddingLeft: rank ? 34 : 0, flexWrap: "wrap" }}>
        <Text style={{ fontFamily: FONTS.ar, fontSize: 15, color: tokens.orn }}>{item.arName}</Text>
        <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: tokens.text3, opacity: 0.6 }} />
        <Text style={{ fontSize: 11.5, color: tokens.text3 }}>Juz {item.juz}</Text>
        <PlaceBadge place={item.place} tokens={tokens} />
      </View>

      {/* arabic */}
      <Pressable onPress={() => app.openReader(item)}>
        {(() => {
          // QPC V2 glyphs (ref shown in the header → medallion suppressed); ayah
          // justified per the app-wide rule. Range refs fall back to Unicode.
          const sa = saFromKey(item.ref);
          return sa
            ? <View style={{ paddingVertical: 4 }}><QuranText surah={sa.surah} ayah={sa.ayah} uthmani={item.arabic} suppressMedallion color={tokens.arColor} fontSize={26} lineHeight={58} /></View>
            : <Text style={{ fontFamily: FONTS.ar, fontSize: 26, lineHeight: 58, color: tokens.arColor, textAlign: "justify", writingDirection: "rtl", paddingVertical: 4 }}>{item.arabic}</Text>;
        })()}
      </Pressable>
      {/* transliteration — Arabic in Latin script, computed server-side; helps
          readers who can't read the Arabic script. Only shown when present. */}
      {item.transliteration ? (
        <Text style={{ fontFamily: FONTS.serif[400], fontStyle: "italic", fontSize: 16, lineHeight: 26, color: tokens.text3, textAlign: "center", marginTop: 6 }}>
          {item.transliteration}
        </Text>
      ) : null}
      <View style={{ height: 1, backgroundColor: tokens.lineSoft, marginVertical: 12 }} />

      <Translation item={item} />

      {/* recitation audio (verbatim MP3 from the API result) */}
      {item.audio?.url ? <AudioBar url={item.audio.url} reciter={item.audio.reciter} surahName={surahName(item.surah)} surahNo={surahNoFromRef(item.ref)} ayahKey={item.ref} /> : null}

      {/* surrounding */}
      <Expander label={app.t("m.surrounding")} open={sur} onToggle={() => setSur((v) => !v)} tokens={tokens} />
      {sur ? <Surrounding item={item} tokens={tokens} /> : null}

      {/* tafseer */}
      <Expander
        label={app.t("results.tafseer")}
        open={taf}
        onToggle={() => {
          const willOpen = !taf;
          setTaf(willOpen);
          // The result card carries its tafseer inline (no fetch), so status is
          // known immediately. rank + search_query give the analytics context.
          if (willOpen)
            track("view_tafsir", {
              surah_name: surahName(item.surah), ayah_no: item.ref,
              tafsir_source: item.sources?.tafseer ?? "", tafsir_language: app.tafsirLanguage,
              status: item.tafseer ? "presented" : "missing", rank: rank ?? 0, search_query: app.query,
            });
        }}
        tokens={tokens}
      />
      {taf ? (
        <View style={{ marginTop: 6, marginBottom: 4, paddingHorizontal: 15, paddingVertical: 14, backgroundColor: mix(tokens.gold, 7, tokens.surface2), borderWidth: 1, borderColor: tokens.lineSoft, borderRadius: 12 }}>
          <Text style={{ fontSize: 10, fontFamily: FONTS.sans[700], letterSpacing: 0.5, textTransform: "uppercase", color: tokens.orn, marginBottom: 6 }}>{app.t("m.tafsir")}</Text>
          <Text style={{ fontFamily: FONTS.serif[400], fontSize: 14, lineHeight: 24.5, color: tokens.text }}>{item.tafseer}</Text>
        </View>
      ) : null}

      {/* foot */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: tokens.lineSoft }}>
        <Pressable onPress={() => app.openReader(item)} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Text style={{ fontSize: 12, fontFamily: FONTS.sans[700], color: tokens.brand2 }}>{app.t("m.readInContext")} </Text>
          <Text style={{ fontSize: 13, color: tokens.brand2 }}>→</Text>
        </Pressable>
        <View style={{ flexDirection: "row", gap: 6 }}>
          <IconBtn name={saved ? "bookmarkFill" : "bookmark"} active={saved} onPress={() => app.toggleSave(item)} />
          <IconBtn name="copy" onPress={() => { void copyAyah(item, app.lang); }} />
          <IconBtn name="share" onPress={() => { void shareAyah(item, app.lang); }} />
        </View>
      </View>
    </View>
  );
}

/* ---------- small icon button (sm) ---------- */
export function IconBtn({ name, onPress, active, w = 1.9 }: { name: string; onPress: () => void; active?: boolean; w?: number }) {
  const { tokens } = useApp();
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 32, height: 32, borderRadius: 9, borderWidth: 1, alignItems: "center", justifyContent: "center",
        backgroundColor: tokens.surface2,
        borderColor: active ? mix(tokens.brand, 40, tokens.line) : tokens.line,
      }}
    >
      <Icon name={name} size={16} w={w} color={active ? tokens.brand : tokens.text2} />
    </Pressable>
  );
}

/* ---------- toolbar icon button (default) ---------- */
export function ToolBtn({ name, onPress }: { name: string; onPress: () => void }) {
  const { tokens } = useApp();
  return (
    <Pressable onPress={onPress} style={{ width: 36, height: 36, borderRadius: 11, borderWidth: 1, borderColor: tokens.line, backgroundColor: tokens.surface2, alignItems: "center", justifyContent: "center" }}>
      <Icon name={name} size={18} color={tokens.text2} />
    </Pressable>
  );
}

/* ---------- toggle switch ---------- */
export function Switch({ on, onPress }: { on: boolean; onPress: () => void }) {
  const { tokens } = useApp();
  return (
    <Pressable onPress={onPress} style={{ width: 42, height: 25, borderRadius: 999, backgroundColor: on ? tokens.brand : tokens.line, justifyContent: "center" }}>
      <View style={{ position: "absolute", top: 2.5, left: on ? 19.5 : 2.5, width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 2 }} />
    </Pressable>
  );
}

/* ---------- field label ---------- */
export function FieldLabel({ children }: { children: React.ReactNode }) {
  const { tokens } = useApp();
  return (
    <Text style={{ fontSize: 11, fontFamily: FONTS.sans[700], letterSpacing: 1.3, textTransform: "uppercase", color: tokens.text3, marginTop: 24, marginBottom: 11, marginHorizontal: 2 }}>
      {children}
    </Text>
  );
}

/* ---------- section kicker label (gold) ---------- */
export function SegLabel({ children }: { children: React.ReactNode }) {
  const { tokens } = useApp();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={{ width: 18, height: 1.5, backgroundColor: tokens.orn, opacity: 0.7 }} />
      <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[700], letterSpacing: 1.6, textTransform: "uppercase", color: tokens.orn }}>{children}</Text>
    </View>
  );
}

/* ---------- block title (serif) ---------- */
export function BlockTitle({ children, style }: { children: React.ReactNode; style?: object }) {
  const { tokens } = useApp();
  // paddingTop reserves headroom so tall Nastaliq/Arabic top marks (e.g. the dot
  // on پودے) never clip against the line box top — negligible for Latin headings.
  return <Text style={[{ fontFamily: FONTS.serif[500], fontSize: 20, color: tokens.text, paddingTop: 4 }, style]}>{children}</Text>;
}
