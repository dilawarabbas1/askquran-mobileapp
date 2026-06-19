// Shared full-passage ayah view for the mobile Library. Given a set of S:A-B
// reference ranges it lazily loads the verbatim Arabic + transliteration +
// chosen translation (GET /api/verses) and renders them grouped by surah. Each
// ayah carries a "View Tafsir" link that loads that ayah's stored tafsir on
// request (GET /api/tafsir) in the chosen tafsir language. Nothing is generated;
// all text is source-backed. Used by the Passage screen, which every reference
// card opens via a "Read" button instead of inline ref-number chips.

import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Text } from "./AppText";
import { useApp } from "./AQContext";
import { translationStyle } from "./atoms";
import { Icon } from "./Icon";
import { FONTS, mix, type Tokens } from "./tokens";
import { expandRefs } from "./lib/refs";
import { SURAHS } from "./refData";
import { getVerses, getTafsir, type AyahResult } from "@/api";
import { track } from "@/analytics";
import { QuranText } from "../quran/QuranText";
import { saFromKey } from "../quran/qpcIndex";

const SURAH_META = new Map<number, { name: string; ar: string }>(
  SURAHS.map((r) => [r[0], { name: r[2], ar: r[1] }]),
);

function groupBySurah(list: AyahResult[]): { surah: number; verses: AyahResult[] }[] {
  const groups: { surah: number; verses: AyahResult[] }[] = [];
  for (const v of list) {
    const s = v.surah ?? parseInt(v.verseKey, 10);
    const last = groups[groups.length - 1];
    if (last && last.surah === s) last.verses.push(v);
    else groups.push({ surah: s, verses: [v] });
  }
  return groups;
}

function SurahHead({ num, tokens }: { num: number; tokens: Tokens }) {
  const m = SURAH_META.get(num);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18, marginBottom: 8 }}>
      <View style={{ minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
        <Text style={{ fontSize: 11, fontFamily: FONTS.sans[700], color: tokens.brand }}>{num}</Text>
      </View>
      <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[700], color: tokens.text2 }}>{m?.name ?? `Surah ${num}`}</Text>
      {m?.ar ? <Text style={{ fontFamily: FONTS.ar, fontSize: 15, color: tokens.text3 }}>{m.ar}</Text> : null}
    </View>
  );
}

/* ---------- one ayah: Arabic + transliteration + translation + lazy tafsir ---------- */
type TafState = { loading: boolean; available: boolean; text: string; edition?: string; error?: boolean };

function AyahRow({
  v,
  isMain,
  mainBadge,
  showTafsir,
  tokens,
}: {
  v: AyahResult;
  isMain: boolean;
  mainBadge: boolean;
  showTafsir: boolean;
  tokens: Tokens;
}) {
  const app = useApp();
  const { t } = app;
  const [open, setOpen] = useState(false);
  const [taf, setTaf] = useState<TafState | null>(null);

  async function toggle() {
    const willOpen = !open;
    setOpen(willOpen);
    if (!willOpen) return;
    const surahNo = v.surah ?? parseInt(v.verseKey, 10);
    const sName = SURAH_META.get(surahNo)?.name ?? `Surah ${surahNo}`;
    if (taf && !taf.error) {
      // Already loaded — emit with the cached status/source, no re-fetch.
      track("view_tafsir", {
        surah_name: sName, ayah_no: v.verseKey, tafsir_source: taf.edition ?? "",
        tafsir_language: app.tafsirLanguage, status: taf.available ? "presented" : "missing",
      });
      return;
    }
    setTaf({ loading: true, available: false, text: "" });
    try {
      const d = await getTafsir([v.verseKey], app.tafsirLanguage);
      const it = d.items[0];
      setTaf({ loading: false, available: !!it?.available, text: it?.tafsir ?? "", edition: it?.edition?.name });
      track("view_tafsir", {
        surah_name: sName, ayah_no: v.verseKey, tafsir_source: it?.edition?.name ?? "",
        tafsir_language: app.tafsirLanguage, status: it?.available ? "presented" : "missing",
      });
    } catch {
      setTaf({ loading: false, available: false, text: "", error: true });
      track("view_tafsir", {
        surah_name: sName, ayah_no: v.verseKey, tafsir_source: "",
        tafsir_language: app.tafsirLanguage, status: "missing",
      });
    }
  }

  return (
    <View style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingHorizontal: 16, paddingTop: 13, paddingBottom: 14 }, tokens.cardShadow]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 7 }}>
        <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[700], letterSpacing: 0.4, color: tokens.text3 }}>{v.verseKey}</Text>
        {mainBadge && isMain ? (
          <View style={{ backgroundColor: mix(tokens.gold, 18, tokens.surface2), borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}>
            <Text style={{ fontSize: 9, fontFamily: FONTS.sans[700], color: tokens.mode === "dark" ? tokens.goldSoft : tokens.goldDeep }}>{t("more.mainAyah")}</Text>
          </View>
        ) : null}
      </View>

      {(() => {
        // QPC V2 glyphs; the verse key is shown above, so suppress the baked
        // medallion (no duplicate number). Falls back to Unicode for range keys.
        const sa = saFromKey(v.verseKey);
        return sa
          ? <QuranText surah={sa.surah} ayah={sa.ayah} uthmani={v.arabic} suppressMedallion color={tokens.arColor} fontSize={26} lineHeight={58} />
          : <Text style={{ fontFamily: FONTS.ar, fontSize: 26, lineHeight: 58, color: tokens.arColor, textAlign: "justify", writingDirection: "rtl" }}>{v.arabic}</Text>;
      })()}

      {v.transliteration ? (
        <Text style={{ fontFamily: FONTS.serif.italic, fontStyle: "italic", fontSize: 16, lineHeight: 26, color: tokens.text3, marginTop: 7 }}>{v.transliteration}</Text>
      ) : null}

      {v.translation ? (
        <Text style={[translationStyle(app.language, tokens), { color: tokens.text2, marginTop: 6 }]}>{v.translation}</Text>
      ) : null}

      {showTafsir ? (
        <>
          <Pressable onPress={toggle} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 11, alignSelf: "flex-start" }}>
            <Icon name="info" size={14} color={tokens.brand2} />
            <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[700], color: tokens.brand2 }}>{t(open ? "recite.hideTafsir" : "recite.viewTafsir")}</Text>
          </Pressable>
          {open ? (
            <View style={{ marginTop: 10, paddingHorizontal: 13, paddingVertical: 12, backgroundColor: mix(tokens.gold, 7, tokens.surface2), borderWidth: 1, borderColor: tokens.lineSoft, borderRadius: 12 }}>
              {!taf || taf.loading ? (
                <Text style={{ fontSize: 12.5, color: tokens.text3 }}>{t("recite.tafsirLoading")}</Text>
              ) : taf.error ? (
                <Text style={{ fontSize: 12.5, color: tokens.text3 }}>{t("recite.tafsirError")}</Text>
              ) : !taf.available ? (
                <Text style={{ fontSize: 12.5, color: tokens.text3, fontStyle: "italic" }}>{t("recite.tafsirUnavailable", { language: app.tafsirLanguage })}</Text>
              ) : (
                <>
                  <Text style={{ fontFamily: FONTS.serif[400], fontSize: 13.5, lineHeight: 23, color: tokens.text }}>{taf.text}</Text>
                  {taf.edition ? <Text style={{ fontSize: 11, fontFamily: FONTS.sans[600], color: tokens.text3, marginTop: 6 }}>{taf.edition}</Text> : null}
                </>
              )}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

/* ---------- full passage: all refs, grouped by surah ---------- */
export function AyahPassage({
  refs,
  mainRefs,
  translationId,
  showTafsir,
  mainBadge,
  tokens,
}: {
  refs: string[];
  mainRefs?: string[];
  translationId: string;
  showTafsir: boolean;
  mainBadge: boolean;
  tokens: Tokens;
}) {
  const { t } = useApp();
  const keys = useMemo(() => expandRefs(refs), [refs]);
  const mainSet = useMemo(() => new Set(expandRefs(mainRefs ?? [])), [mainRefs]);
  const [verses, setVerses] = useState<AyahResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!translationId) return;
    let alive = true;
    setLoading(true);
    setError(false);
    getVerses(keys, translationId)
      .then((v) => { if (alive) setVerses(v); })
      .catch(() => { if (alive) setError(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [keys, translationId]);

  if (loading) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 30, justifyContent: "center" }}>
        <ActivityIndicator color={tokens.brand} />
        <Text style={{ fontSize: 13, color: tokens.text3 }}>{t("m.loadingText")}</Text>
      </View>
    );
  }
  if (error) {
    return <Text style={{ marginTop: 16, fontSize: 13.5, color: tokens.text3 }}>{t("more.loadError")}</Text>;
  }

  return (
    <View>
      {groupBySurah(verses ?? []).map((g) => (
        <View key={g.surah}>
          <SurahHead num={g.surah} tokens={tokens} />
          <View style={{ gap: 11 }}>
            {g.verses.map((v) => (
              <AyahRow key={v.verseKey} v={v} isMain={mainSet.has(v.verseKey)} mainBadge={mainBadge} showTafsir={showTafsir} tokens={tokens} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
