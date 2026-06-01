import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fetchVerses } from "@/api/client";
import { useSettings } from "@/context/Settings";
import { useI18n } from "@/i18n/I18n";
import { AQ_SURAHS } from "@/data/quranFacts";
import { countAyahs, expandRefs } from "@/lib/refs";
import { useTheme } from "@/theme/ThemeContext";
import type { AyahResult } from "@/types";
import { TafsirText } from "./TafsirText";

const SURAH_META = new Map<number, { name: string; ar: string }>(
  (AQ_SURAHS as [number, string, string, number, string, number][]).map((r) => [
    r[0],
    { name: r[2], ar: r[1] },
  ]),
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

/** Verbatim Arabic + chosen translation for an item's refs, loaded on demand.
 *  Optional tafsir loads when opened. Mirrors the web AyahBlocks behaviour. */
export function AyahBlocks({
  refs,
  tafsir = false,
  mainRefs,
  mainBadge = false,
  enabled,
}: {
  refs: string[];
  tafsir?: boolean;
  mainRefs?: string[];
  mainBadge?: boolean;
  enabled: boolean;
}) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const { translation } = useSettings();
  const keys = useMemo(() => expandRefs(refs), [refs]);
  const mainSet = useMemo(() => new Set(expandRefs(mainRefs ?? [])), [mainRefs]);

  const [verses, setVerses] = useState<AyahResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showTaf, setShowTaf] = useState(false);
  const [tafVerses, setTafVerses] = useState<AyahResult[] | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchVerses(keys, translation)
      .then((d) => !cancelled && setVerses(d.verses))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [enabled, translation, keys]);

  function toggleTaf() {
    const next = !showTaf;
    setShowTaf(next);
    if (next && !tafVerses) {
      fetchVerses(keys, translation, "1")
        .then((d) => setTafVerses(d.verses))
        .catch(() => setTafVerses([]));
    }
  }

  const tafOrdered = useMemo(() => {
    if (!tafVerses) return null;
    if (!mainSet.size) return tafVerses;
    const main = tafVerses.filter((v) => mainSet.has(v.verseKey));
    const rest = tafVerses.filter((v) => !mainSet.has(v.verseKey));
    return [...main, ...rest];
  }, [tafVerses, mainSet]);

  if (!enabled) return null;

  return (
    <View style={{ marginTop: 8 }}>
      <View style={styles.phead}>
        <View style={styles.chips}>
          {refs.map((r) => (
            <Text key={r} style={[styles.ayahChip, { backgroundColor: colors.accentSoft, color: colors.accent }]}>
              {r}
            </Text>
          ))}
        </View>
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {t("more.ayahCount", { n: keys.length })}
        </Text>
      </View>

      {error ? (
        <Text style={[styles.note, { color: colors.textMuted }]}>{t("more.loadError")}</Text>
      ) : !verses && loading ? (
        <Text style={[styles.note, { color: colors.textMuted }]}>{t("more.loading")}</Text>
      ) : (
        groupBySurah(verses ?? []).map((g) => (
          <View key={g.surah} style={styles.sgroup}>
            <SurahHead num={g.surah} />
            {g.verses.map((v) => (
              <View key={v.verseKey} style={[styles.ayah, { borderColor: colors.border }]}>
                <Text style={[styles.ref, { color: colors.accent }]}>
                  {v.verseKey}
                  {mainBadge && mainSet.has(v.verseKey) ? `  ${t("more.mainAyah")}` : ""}
                </Text>
                <Text style={[styles.ar, { color: colors.text }]}>{v.arabic}</Text>
                {!!v.translation && (
                  <Text style={[styles.tr, { color: colors.textMuted }]}>{v.translation}</Text>
                )}
              </View>
            ))}
          </View>
        ))
      )}

      {tafsir && verses && (
        <View style={{ marginTop: 10 }}>
          <Pressable onPress={toggleTaf} style={[styles.tafBtn, { borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontWeight: "600" }}>
              {showTaf ? t("more.hideTafsir") : t("more.showTafsir")} {showTaf ? "▲" : "▼"}
            </Text>
          </Pressable>
          {showTaf &&
            (!tafOrdered ? (
              <Text style={[styles.note, { color: colors.textMuted }]}>{t("more.loading")}</Text>
            ) : (
              groupBySurah(tafOrdered).map((g) => (
                <View key={g.surah} style={styles.sgroup}>
                  <SurahHead num={g.surah} />
                  {g.verses.map((v) => (
                    <View key={v.verseKey} style={{ marginTop: 8 }}>
                      <Text style={[styles.ref, { color: colors.accent }]}>{v.verseKey}</Text>
                      {v.tafseerAvailable ? (
                        <>
                          {!!v.sources.tafseer && (
                            <Text style={[styles.tafSrc, { color: colors.textMuted }]}>
                              {v.sources.tafseer}
                            </Text>
                          )}
                          <TafsirText text={v.tafseer} />
                        </>
                      ) : (
                        <Text style={[styles.note, { color: colors.textMuted }]}>
                          {t("more.tafsirUnavailable")}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ))
            ))}
        </View>
      )}
    </View>
  );
}

function SurahHead({ num }: { num: number }) {
  const { colors } = useTheme();
  const m = SURAH_META.get(num);
  return (
    <View style={[styles.surahHead, { borderColor: colors.border }]}>
      <Text style={[styles.surahNum, { backgroundColor: colors.primary }]}>{num}</Text>
      <Text style={[styles.surahName, { color: colors.text }]}>{m?.name ?? `Surah ${num}`}</Text>
      {!!m?.ar && <Text style={[styles.surahAr, { color: colors.textMuted }]}>{m.ar}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  phead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  ayahChip: { fontSize: 12, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: "hidden" },
  count: { fontSize: 11 },
  note: { fontSize: 13, fontStyle: "italic", marginTop: 8 },
  sgroup: { marginTop: 10 },
  surahHead: { flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, paddingBottom: 6, marginBottom: 4 },
  surahNum: { color: "#fff", fontSize: 12, fontWeight: "700", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, overflow: "hidden" },
  surahName: { fontSize: 14, fontWeight: "700" },
  surahAr: { fontSize: 14 },
  ayah: { borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 },
  ref: { fontSize: 12, fontWeight: "700" },
  ar: { fontSize: 22, lineHeight: 42, textAlign: "right", writingDirection: "rtl", marginTop: 4 },
  tr: { fontSize: 14, lineHeight: 22, marginTop: 6 },
  tafBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, alignSelf: "flex-start" },
  tafSrc: { fontSize: 11, marginTop: 2 },
});
