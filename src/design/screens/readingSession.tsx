// Reading session — the focused view opened by the Reading Plan's "Read now".
// Shows today's portion in the Recite "By Surah" style: continuous mushaf flow,
// one card per mushaf PAGE (so page starts/ends are clear), a single sticky player
// that auto-advances through the whole portion (Mishary Alafasy) with an active-
// ayah highlight + translation strip, and a Mark Done button that records the day
// and shows a congratulations / streak screen. Text is verbatim from /api/verses.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Audio, type AVPlaybackStatus } from "expo-av";
import { Text } from "../AppText";
import { useApp } from "../AQContext";
import { BlockTitle, OrnDivider, translationStyle } from "../atoms";
import { Icon } from "../Icon";
import { FONTS, mix } from "../tokens";
import { SURAHS } from "../data";
import { juzOf } from "../lib/juz";
import { displayAyahNumber } from "../lib/reciteScroll";
import { pageStartRef, qpcPage, qpcAyah, stripMedallion, QPC_PAGE_COUNT } from "../../quran/qpcIndex";
import { ensureQpcPage, isPageReady, qpcFamily } from "../../quran/qpcFonts";
import { getVerses, translationIdForLanguage } from "@/api";

const surahName = (n: number): string => SURAHS.find((s) => s[0] === n)?.[2] ?? `Surah ${n}`;
const ayahCount = (n: number): number => SURAHS.find((s) => s[0] === n)?.[3] ?? 0;
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const toArabicNumeral = (n: number): string => String(n).split("").map((d) => AR_DIGITS[+d] ?? d).join("");

interface Item { surah: number; ayah: number; verseKey: string; page: number; uthmani: string; tr: string; audio: string | null; }

/** Ordered ayah list for pages [fromPage..toPage]. */
function itemsForPages(fromPage: number, toPage: number): { surah: number; ayah: number; verseKey: string; page: number }[] {
  const start = pageStartRef(fromPage);
  const endExclusive = toPage >= QPC_PAGE_COUNT ? null : pageStartRef(toPage + 1);
  const ord = (s: number, a: number) => s * 1000 + a;
  const endOrd = endExclusive ? ord(endExclusive.surah, endExclusive.ayah) : Infinity;
  const out: { surah: number; ayah: number; verseKey: string; page: number }[] = [];
  let s = start.surah, a = start.ayah, guard = 0;
  while (ord(s, a) < endOrd && s <= 114 && guard++ < 2000) {
    const page = qpcPage(s, a) ?? fromPage;
    if (page > toPage) break;
    out.push({ surah: s, ayah: a, verseKey: `${s}:${a}`, page });
    const count = ayahCount(s);
    if (a >= count) { s += 1; a = 1; } else a += 1;
  }
  return out;
}

export function ReadingSession() {
  const app = useApp();
  const { tokens } = app;
  const k = app.khatm;

  const [phase, setPhase] = useState<"loading" | "reading" | "error" | "done">("loading");
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(-1);        // index into items currently sounding
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [, setFontTick] = useState(0);             // bump when a page font registers

  const soundRef = useRef<Audio.Sound | null>(null);
  const tokenRef = useRef(0);
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;

  const range = useMemo(() => {
    if (!k || k.pagesRead >= QPC_PAGE_COUNT) return null;
    return { fromPage: Math.min(QPC_PAGE_COUNT, k.pagesRead + 1), toPage: Math.min(QPC_PAGE_COUNT, k.pagesRead + k.pagesPerDay) };
  }, [k]);

  // Load verses (Arabic + translation + audio) + warm QPC page fonts.
  useEffect(() => {
    let alive = true;
    if (!range) { setPhase("error"); return; }
    (async () => {
      try {
        const skel = itemsForPages(range.fromPage, range.toPage);
        const trId = (await translationIdForLanguage(app.language)) || "en.sahih";
        const verses = await getVerses(skel.map((x) => x.verseKey), trId);
        if (!alive) return;
        const byKey = new Map(verses.map((v) => [v.verseKey, v]));
        const list: Item[] = skel.map((x) => {
          const v = byKey.get(x.verseKey);
          return { ...x, uthmani: v?.arabic ?? "", tr: v?.translation ?? "", audio: v?.audio?.url ?? null };
        });
        if (!list.length) { setPhase("error"); return; }
        setItems(list);
        setPhase("reading");
        for (const p of [...new Set(list.map((x) => x.page))]) {
          void ensureQpcPage(p).then((ok) => { if (ok && alive) setFontTick((t) => t + 1); });
        }
      } catch { if (alive) setPhase("error"); }
    })();
    return () => { alive = false; };
  }, [range, app.language]);

  async function unload() {
    const s = soundRef.current; soundRef.current = null;
    if (s) { try { await s.stopAsync(); } catch { /* */ } try { await s.unloadAsync(); } catch { /* */ } }
  }
  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
    return () => { tokenRef.current++; void unload(); };
  }, []);

  function onStatus(st: AVPlaybackStatus, my: number) {
    if (my !== tokenRef.current) return;
    if (!st.isLoaded) { if (st.error) setPlaying(false); return; }
    if (st.durationMillis) setProgress((st.positionMillis || 0) / st.durationMillis);
    setPlaying(st.isPlaying);
    if (st.didJustFinish) { setProgress(0); advance(my); }
  }

  async function playAt(index: number) {
    const list = itemsRef.current;
    if (index < 0 || index >= list.length) return;
    const uri = list[index].audio;
    setActive(index);
    if (!uri) { advance(tokenRef.current); return; } // no audio for this ayah → skip
    const my = ++tokenRef.current;
    setPlaying(true); setProgress(0);
    await unload();
    if (my !== tokenRef.current) return;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false }, (s) => onStatus(s, my));
      if (my !== tokenRef.current) { try { await sound.unloadAsync(); } catch { /* */ } return; }
      soundRef.current = sound;
      await sound.playAsync();
    } catch { setPlaying(false); }
  }

  function advance(my: number) {
    if (my !== tokenRef.current) return;
    const next = active + 1;
    if (next < itemsRef.current.length) void playAt(next);
    else { setPlaying(false); setActive(-1); } // portion finished
  }

  async function togglePlay() {
    if (playing) {
      const s = soundRef.current;
      if (s) { try { await s.pauseAsync(); } catch { /* */ } }
      setPlaying(false);
      return;
    }
    if (active >= 0 && soundRef.current) { try { await soundRef.current.playAsync(); setPlaying(true); } catch { /* */ } return; }
    void playAt(active >= 0 ? active : 0);
  }

  async function finishSession() {
    tokenRef.current++; await unload();
    app.markDayRead();
    setPhase("done");
  }

  /* ---------- congratulations / streak ---------- */
  if (phase === "done") {
    const done = app.khatm?.pagesRead ?? 0;
    const pct = Math.round((done / QPC_PAGE_COUNT) * 100);
    const complete = done >= QPC_PAGE_COUNT;
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 44, alignItems: "center" }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontFamily: FONTS.ar, fontSize: 26, color: tokens.gold, marginBottom: 14 }}>﷽</Text>
        <View style={{ width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 12, tokens.surface), borderWidth: 1.5, borderColor: mix(tokens.brand, 30, tokens.line) }}>
          <Icon name="check" size={44} w={2.4} color={tokens.brand} />
        </View>
        <BlockTitle style={{ marginTop: 18 }}>{app.t(complete ? "m.plan.done" : "m.plan.sessionDone")}</BlockTitle>
        {app.khatm && app.khatm.streak > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, backgroundColor: mix(tokens.gold, 16, tokens.surface), borderWidth: 1, borderColor: mix(tokens.gold, 34, tokens.line) }}>
            <Icon name="flame" size={17} w={1.9} color={tokens.goldDeep} />
            <Text style={{ fontSize: 15, fontFamily: FONTS.sans[700], color: tokens.goldDeep }}>{app.t("m.plan.streak", { n: app.khatm.streak })}</Text>
          </View>
        ) : null}
        <Text style={{ fontFamily: FONTS.serif[600], fontSize: 30, color: tokens.brand, marginTop: 20 }}>{pct}%</Text>
        <Text style={{ fontSize: 13, color: tokens.text2, marginTop: 2 }}>{app.t("m.plan.progressPages", { done, total: QPC_PAGE_COUNT })}</Text>
        <View style={{ height: 8, alignSelf: "stretch", borderRadius: 4, backgroundColor: tokens.lineSoft, marginTop: 12 }}>
          <View style={{ height: 8, borderRadius: 4, width: `${pct}%`, backgroundColor: tokens.brand }} />
        </View>
        <Pressable onPress={() => app.back()} style={[{ marginTop: 28, backgroundColor: tokens.brand, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 40 }, tokens.cardShadow]}>
          <Text style={{ fontSize: 16, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>{app.t("m.plan.backToPlan")}</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (phase === "loading") return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={tokens.brand} /></View>;
  if (phase === "error" || !range) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 14, color: tokens.text2, textAlign: "center" }}>{app.t("m.plan.sessionEmpty")}</Text>
        <Pressable onPress={() => app.back()} style={[{ marginTop: 18, backgroundColor: tokens.brand, borderRadius: 13, paddingVertical: 13, paddingHorizontal: 32 }, tokens.cardShadow]}>
          <Text style={{ fontSize: 15, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>{app.t("m.plan.backToPlan")}</Text>
        </Pressable>
      </View>
    );
  }

  /* ---------- reading (by-surah flow, one card per page) ---------- */
  const startJuz = items.length ? juzOf(items[0].surah, items[0].ayah) : 1;
  const pages = [...new Set(items.map((x) => x.page))].sort((a, b) => a - b);
  const activeItem = active >= 0 ? items[active] : null;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 11.5, fontFamily: FONTS.sans[700], letterSpacing: 0.5, textTransform: "uppercase", color: tokens.gold }}>{app.t("m.plan.todayReading")}</Text>
          <Text style={{ fontFamily: FONTS.serif[600], fontSize: 20, color: tokens.text, marginTop: 4 }}>{app.t("m.plan.pagesRange", { from: `⁦${range.fromPage}`, to: `${range.toPage}⁩` })}</Text>
          <Text style={{ fontSize: 12.5, color: tokens.text2, marginTop: 2 }}>{app.t("m.plan.juzN", { n: startJuz })}</Text>
        </View>
        <OrnDivider />

        {pages.map((page) => {
          const pageItems = items.filter((x) => x.page === page);
          return (
            <View key={page} style={{ borderWidth: 1.5, borderColor: mix(tokens.gold, 60, tokens.surface), borderRadius: 16, backgroundColor: tokens.surface, padding: 5, marginBottom: 14 }}>
              <View style={{ borderWidth: 1, borderColor: mix(tokens.gold, 30, tokens.surface), borderRadius: 12, overflow: "hidden" }}>
                <View style={{ alignItems: "center", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: mix(tokens.gold, 26, tokens.surface), backgroundColor: mix(tokens.gold, 7, tokens.surface) }}>
                  <Text style={{ fontSize: 12, fontFamily: FONTS.sans[700], letterSpacing: 0.4, color: tokens.goldDeep }}>{app.t("m.plan.pageN", { n: page })}</Text>
                </View>
                {/* continuous Arabic — nested per-ayah glyph runs, tap to play, active highlight */}
                <Text style={{ fontFamily: FONTS.ar, fontSize: 26, lineHeight: 58, color: tokens.arColor, textAlign: "justify", writingDirection: "rtl", paddingVertical: 16, paddingHorizontal: 14 }}>
                  {"‏"}
                  {pageItems.map((it) => {
                    const idx = items.indexOf(it);
                    const on = active === idx;
                    const hl = on ? { backgroundColor: mix(tokens.brand, 13, tokens.surface) } : null;
                    const entry = qpcAyah(it.surah, it.ayah);
                    const ready = entry != null && isPageReady(it.page);
                    const dispNum = displayAyahNumber(it.surah, it.ayah);
                    if (ready) {
                      const glyphs = it.surah === 1 ? stripMedallion(entry.g) : entry.g;
                      return (
                        <Text key={it.verseKey} onPress={() => playAt(idx)} accessibilityLabel={it.uthmani} style={{ fontFamily: qpcFamily(it.page), textAlign: "justify", writingDirection: "rtl", ...hl }}>
                          {glyphs}
                          {it.surah === 1 ? <Text style={{ fontFamily: FONTS.ar, fontSize: 24, color: tokens.orn, ...hl }}>{` ۝${toArabicNumeral(dispNum)} `}</Text> : " "}
                        </Text>
                      );
                    }
                    return (
                      <Text key={it.verseKey} onPress={() => playAt(idx)} style={{ fontFamily: FONTS.ar, textAlign: "justify", writingDirection: "rtl", ...hl }}>
                        {it.uthmani}
                        <Text style={{ fontFamily: FONTS.ar, fontSize: 24, color: tokens.orn }}>{` ۝${toArabicNumeral(dispNum)} `}</Text>
                      </Text>
                    );
                  })}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* sticky player + translation strip + Mark done */}
      <View style={{ borderTopWidth: 1, borderTopColor: tokens.lineSoft, backgroundColor: tokens.bg, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 }}>
        {activeItem?.tr ? (
          <Text numberOfLines={3} style={[translationStyle(app.language, tokens), { color: tokens.text2, marginBottom: 10 }]}>{activeItem.tr}</Text>
        ) : null}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={togglePlay} style={{ width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: tokens.brand }}>
            <Icon name={playing ? "pause" : "play"} size={22} w={2} color={tokens.onBrand} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontFamily: FONTS.sans[600], color: tokens.text2 }}>
              {activeItem ? `Mishary Alafasy · ${activeItem.verseKey}` : app.t("m.plan.todayReading")}
            </Text>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: tokens.lineSoft, marginTop: 6 }}>
              <View style={{ height: 4, borderRadius: 2, width: `${Math.round(progress * 100)}%`, backgroundColor: tokens.brand }} />
            </View>
          </View>
        </View>
        <Pressable onPress={finishSession} style={[{ marginTop: 12, backgroundColor: mix(tokens.brand, 12, tokens.surface), borderWidth: 1, borderColor: mix(tokens.brand, 30, tokens.line), borderRadius: 13, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }]}>
          <Icon name="check" size={17} w={2.3} color={tokens.brand} />
          <Text style={{ fontSize: 15, fontFamily: FONTS.sans[700], color: tokens.brand }}>{app.t("m.plan.markDone")}</Text>
        </Pressable>
      </View>
    </View>
  );
}
