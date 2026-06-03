// Recite screen ported from aq-recite.jsx: surah header + picker sheet, ayah-by-
// ayah stream, and a sticky audio player. Audio streams per-ayah MP3s (Mishary
// Alafasy) via expo-av, auto-advancing through the surah; tap an ayah to play it
// on its own. Text is verbatim — nothing generated.

import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, ScrollView, Text, View } from "react-native";
import { Audio, type AVPlaybackStatus } from "expo-av";
import { SvgXml } from "react-native-svg";
import { useApp } from "../AQContext";
import { Icon } from "../Icon";
import { SearchBar } from "../SearchBar";
import { translationStyle } from "../atoms";
import { SURAHS } from "../data";
import { BISMILLAH, ayahAudioUrl } from "../reciteData";
import { FONTS, mix } from "../tokens";
import { getVerses, getTafsir, translationIdForLanguage, AqError } from "@/api";

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
          <Text style={{ fontFamily: FONTS.serif[500], fontSize: 19, color: tokens.text }}>Select Surah</Text>
          <Text style={{ fontSize: 11.5, color: tokens.text2, marginTop: 1 }}>114 chapters</Text>
        </View>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 4 }}>
        <View style={{ marginVertical: 12 }}>
          <SearchBar value={q} onChangeText={setQ} placeholder="Search surahs…" small />
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
                  <Text style={{ fontSize: 14.5, fontFamily: FONTS.sans[700], color: tokens.text }}>{s.name}</Text>
                  <Text style={{ fontSize: 11, color: tokens.text3, marginTop: 1 }}>
                    <Text style={{ fontFamily: FONTS.sans[700], color: s.place === "Meccan" ? tokens.mecca : tokens.medina }}>{s.place}</Text> · {s.cnt} ayahs
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
  const showBismillah = num !== 1 && num !== 9;

  const [ayahs, setAyahs] = useState<RAyah[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [mode, setMode] = useState<"surah" | "single">("surah");
  const [repeat, setRepeat] = useState(false);
  const [progress, setProgress] = useState(0);

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
    } catch {
      setTafData((p) => ({ ...p, [n]: { loading: false, available: false, text: "", error: true } }));
    }
  }

  const soundRef = useRef<Audio.Sound | null>(null);
  const tokenRef = useRef(0);
  const loadTokenRef = useRef(0);
  const stateRef = useRef({ mode, repeat, activeAyah, ayahs, num });
  stateRef.current = { mode, repeat, activeAyah, ayahs, num };

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
    return () => { void unload(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load the selected surah's ayahs from the API (any of the 114), refetching
  // when the surah or language changes; falls back to bundled short surahs.
  useEffect(() => { loadSurah(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [num, app.language]);

  async function unload() {
    const s = soundRef.current;
    soundRef.current = null;
    if (s) { try { await s.unloadAsync(); } catch { /* already gone */ } }
  }
  async function stop() {
    tokenRef.current++;
    await unload();
    setPlaying(false);
    setActiveAyah(null);
    setProgress(0);
  }

  async function loadSurah() {
    const my = ++loadTokenRef.current;
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
      setAyahs(verses.map((v) => ({ n: v.ayah, ar: v.arabic, tr: v.translation || "" })));
      setTafOpen(new Set());
      setTafData({});
      setLoading(false);
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

  async function loadAndPlay(ayahNum: number, m: "surah" | "single") {
    const myToken = ++tokenRef.current;
    setMode(m);
    setActiveAyah(ayahNum);
    setProgress(0);
    setPlaying(true);
    await unload();
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: ayahAudioUrl(stateRef.current.num, ayahNum) },
        { shouldPlay: true },
        (st) => onStatus(st, myToken),
      );
      if (myToken !== tokenRef.current) { try { await sound.unloadAsync(); } catch { /* superseded */ } return; }
      soundRef.current = sound;
    } catch {
      if (myToken === tokenRef.current) setPlaying(false); // CDN unreachable → leave stopped
    }
  }

  function advance() {
    const st = stateRef.current;
    if (!st.ayahs) return;
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
    if (playing) { if (s) { try { await s.pauseAsync(); } catch { /* noop */ } } setPlaying(false); return; }
    if (activeAyah && s) { try { await s.playAsync(); setPlaying(true); } catch { /* noop */ } return; }
    if (ayahs) loadAndPlay(ayahs[0].n, "surah");
  }
  async function toggleAyah(n: number) {
    const s = soundRef.current;
    if (playing && activeAyah === n) { if (s) { try { await s.pauseAsync(); } catch { /* noop */ } } setPlaying(false); }
    else loadAndPlay(n, "single");
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
      {/* surah header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14 }}>
        <Pressable onPress={app.openSurahSheet} style={[{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }, tokens.cardShadow]}>
          <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11), borderWidth: 1, borderColor: mix(tokens.brand, 22, tokens.line) }}>
            <Text style={{ fontFamily: FONTS.serif[600], fontSize: 17, color: tokens.brand }}>{num}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.serif[600], fontSize: 19, color: tokens.text }}>{name}</Text>
            <Text style={{ fontSize: 11.5, color: tokens.text3, marginTop: 2 }}>
              <Text style={{ fontFamily: FONTS.sans[700], color: place === "Meccan" ? tokens.mecca : tokens.medina }}>{place}</Text> · {cnt} ayahs
            </Text>
          </View>
          <Text style={{ fontFamily: FONTS.ar, fontSize: 24, color: tokens.orn }}>{arName}</Text>
          <Icon name="chevDown" size={16} w={2.1} color={tokens.text3} />
        </Pressable>

        {/* reciter + translation-language control (matches the web's surah controls) */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 11 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: tokens.brand }} />
            <Text style={{ fontSize: 12, fontFamily: FONTS.sans[600], color: tokens.text2 }}>Mishary Alafasy</Text>
          </View>
          <Pressable onPress={() => app.openLangSheet()} style={{ flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: tokens.line, backgroundColor: tokens.surface2, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 }}>
            <Icon name="globe" size={15} color={tokens.text2} />
            <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[600], color: tokens.text }}>{app.language}</Text>
            <Icon name="chevDown" size={13} w={2.1} color={tokens.text3} />
          </Pressable>
        </View>
      </View>

      {/* body */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ alignItems: "center", paddingTop: 64 }}>
            <ActivityIndicator color={tokens.brand} />
            <Text style={{ marginTop: 12, fontSize: 13, color: tokens.text3 }}>Loading {name}…</Text>
          </View>
        ) : ayahs ? (
          <>
            {showBismillah ? (
              <Text style={{ fontFamily: FONTS.ar, fontSize: 24, lineHeight: 43, color: tokens.text, textAlign: "center", writingDirection: "rtl", paddingTop: 8, paddingBottom: 18 }}>{BISMILLAH.ar}</Text>
            ) : null}
            <View>
              {ayahs.map((a) => {
                const on = activeAyah === a.n;
                const tOpen = tafOpen.has(a.n);
                const td = tafData[a.n];
                return (
                  <View
                    key={a.n}
                    style={[
                      {
                        flexDirection: "row", gap: 13, padding: 14, marginBottom: 12, borderRadius: 16, borderWidth: 1,
                        borderColor: on ? mix(tokens.brand, 34, tokens.line) : tokens.line,
                        backgroundColor: on ? mix(tokens.brand, 6, tokens.surface) : tokens.surface,
                      },
                      tokens.cardShadow,
                    ]}
                  >
                    <View style={{ alignItems: "center", gap: 10, paddingTop: 2 }}>
                      <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: on ? tokens.brand : mix(tokens.brand, 9), borderWidth: 1, borderColor: on ? tokens.brand : mix(tokens.brand, 22, tokens.line) }}>
                        <Text style={{ fontSize: 12, fontFamily: FONTS.sans[600], color: on ? tokens.onBrand : tokens.brand }}>{a.n}</Text>
                      </View>
                      <Pressable
                        onPress={() => toggleAyah(a.n)}
                        style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: on ? tokens.brand : tokens.line, backgroundColor: on ? tokens.brand : tokens.surface2 }}
                      >
                        <RIcon name={on && playing ? "pause" : "play"} size={15} color={on ? tokens.onBrand : tokens.brand} />
                      </Pressable>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Pressable onPress={() => toggleAyah(a.n)}>
                        <Text style={{ fontFamily: FONTS.ar, fontSize: 25, lineHeight: 51, color: tokens.arColor, textAlign: "right", writingDirection: "rtl" }}>{a.ar}</Text>
                      </Pressable>
                      {a.tr ? (
                        <Text style={[translationStyle(app.language, tokens), { marginTop: 9, fontSize: 14, lineHeight: 26, color: tokens.text2 }]}>
                          {a.tr}
                        </Text>
                      ) : null}
                      {on && playing ? <Equalizer color={tokens.brand} /> : null}

                      {/* per-ayah tafsir (lazy, stored sources, chosen language) */}
                      <Pressable onPress={() => toggleTafsir(a.n)} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, alignSelf: "flex-start" }}>
                        <Icon name="info" size={14} color={tokens.brand2} />
                        <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[700], color: tokens.brand2 }}>{tOpen ? "Hide tafsir" : "View tafsir"}</Text>
                      </Pressable>
                      {tOpen ? (
                        <View style={{ marginTop: 10, paddingHorizontal: 13, paddingVertical: 12, backgroundColor: mix(tokens.gold, 7, tokens.surface2), borderWidth: 1, borderColor: tokens.lineSoft, borderRadius: 12 }}>
                          {!td || td.loading ? (
                            <Text style={{ fontSize: 12.5, color: tokens.text3 }}>Loading tafsir…</Text>
                          ) : td.error ? (
                            <Text style={{ fontSize: 12.5, color: tokens.text3 }}>Couldn’t load tafsir.</Text>
                          ) : !td.available ? (
                            <Text style={{ fontSize: 12.5, color: tokens.text3, fontStyle: "italic" }}>No stored tafsir for this ayah in {app.tafsirLanguage}.</Text>
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
                );
              })}
            </View>
            <Text style={{ textAlign: "center", fontFamily: FONTS.ar, color: tokens.orn, fontSize: 16, paddingTop: 22, paddingBottom: 6, opacity: 0.8 }}>۞ End of Surah {name} ۞</Text>
          </>
        ) : (
          <View style={{ alignItems: "center", paddingTop: 60, paddingHorizontal: 20 }}>
            <RIcon name="wave" size={40} color={tokens.brand} />
            <Text style={{ marginTop: 12, fontSize: 14, lineHeight: 24, color: tokens.text3, textAlign: "center" }}>
              {error || `Couldn’t load ${name}.`}
            </Text>
            <Pressable onPress={loadSurah} style={{ marginTop: 18, backgroundColor: tokens.brand, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 14, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>Retry</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* sticky player */}
      {ayahs ? (
        <View style={{ borderTopWidth: 1, borderTopColor: tokens.lineSoft, backgroundColor: tokens.bg }}>
          <View style={{ height: 3, backgroundColor: tokens.lineSoft }}>
            <View style={{ position: "absolute", left: 0, top: 0, height: 3, width: `${Math.min(progress * 100, 100)}%`, backgroundColor: tokens.brand }} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 11, paddingBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontFamily: FONTS.sans[700], letterSpacing: 0.6, textTransform: "uppercase", color: tokens.orn }}>Mishary Alafasy</Text>
              <Text numberOfLines={1} style={{ fontSize: 13, fontFamily: FONTS.sans[600], color: tokens.text, marginTop: 2 }}>
                {activeAyah ? `${name} · Ayah ${activeAyah}` : `Surah ${name} · ${cnt} ayahs`}
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
