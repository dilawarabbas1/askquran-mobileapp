import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fetchVerses } from "@/api/client";
import { useI18n } from "@/i18n/I18n";
import { isRTL } from "@/lib/rtl";
import { useTheme } from "@/theme/ThemeContext";
import type { AyahResult } from "@/types";
import { AudioPlayer } from "./AudioPlayer";
import { Highlight } from "./Highlight";
import { TafsirText } from "./TafsirText";

/** A single search result — Arabic, transliteration, audio, translation,
 *  surrounding context, on-demand tafsir, and verbatim source badges. */
export function ResultCard({
  result,
  terms,
  language,
  translationId,
}: {
  result: AyahResult;
  terms: string[];
  language: string;
  translationId?: string;
}) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const rtl = isRTL(language);
  const ed = result.tafseerEdition;
  const ctx = result.context;
  const ctxKeys = ctx && ctx.verses.length > 1 ? ctx.verse_keys : [];
  const tafsirLanguages = result.tafseerAvailableLanguages ?? [];

  const [showTafseer, setShowTafseer] = useState(false);
  const [ctxTaf, setCtxTaf] = useState<AyahResult[] | null>(null);

  function toggleTafseer() {
    const next = !showTafseer;
    setShowTafseer(next);
    if (next && ctxKeys.length > 0 && !ctxTaf) {
      const tid = translationId ?? "en.sahih";
      fetchVerses(ctxKeys, tid, ed?.id || "1")
        .then((d) => setCtxTaf(d.verses))
        .catch(() => setCtxTaf([]));
    }
  }

  const typeLabel = t(`results.type.${result.resultType ?? "ayah"}`);
  const verified = result.reviewStatus === "verified";
  const trStyle = [styles.translation, { color: colors.text }, rtl && styles.rtlText];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* header */}
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <View style={[styles.rank, { backgroundColor: colors.primary }]}>
            <Text style={styles.rankText}>{result.rank}</Text>
          </View>
          <Text style={[styles.surah, { color: colors.text }]} numberOfLines={1}>
            {`${t("results.surah")} ${result.surahNameEn || result.surah}`}{" "}
            <Text style={{ color: colors.accent }}>{result.verseKey}</Text>
          </Text>
        </View>
        <Text style={[styles.relevance, { color: colors.textMuted }]}>
          {t("results.relevance")} {result.relevanceScore.toFixed(2)}
        </Text>
      </View>

      {/* type / topic / verified / sensitive */}
      <View style={styles.chipRow}>
        <Text style={[styles.typeChip, { backgroundColor: colors.accentSoft, color: colors.accent }]}>
          {typeLabel}
        </Text>
        {!!result.topicTitle && (
          <Text style={[styles.topicTitle, { color: colors.textMuted }]}>{result.topicTitle}</Text>
        )}
        {verified && (
          <Text style={[styles.badge, { backgroundColor: colors.verified, color: "#fff" }]}>
            {t("results.verified")}
          </Text>
        )}
        {!!result.referenceRange && (
          <Text style={[styles.topicTitle, { color: colors.textMuted }]}>
            {t("results.fullPassage")} {result.referenceRange}
          </Text>
        )}
        {result.sensitivity === "high" && (
          <Text style={[styles.badge, { backgroundColor: colors.warn, color: "#fff" }]}>
            {t("results.sensitive")}
          </Text>
        )}
      </View>

      {result.matchReasons && result.matchReasons.length > 0 && (
        <Text style={[styles.matchReasons, { color: colors.textMuted }]}>
          {t("results.matched")} {result.matchReasons.join(" · ")}
        </Text>
      )}

      {/* meta */}
      <View style={styles.metaRow}>
        {!!result.surahNameAr && (
          <Text style={[styles.metaAr, { color: colors.textMuted }]}>{result.surahNameAr}</Text>
        )}
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {t("results.juz")} {result.juz}
        </Text>
        {!!result.revelationPlace && (
          <Text style={[styles.placeBadge, { borderColor: colors.border, color: colors.textMuted }]}>
            {result.revelationPlace}
          </Text>
        )}
      </View>

      {/* arabic + transliteration + audio */}
      <Text style={[styles.arabic, { color: colors.text }]}>{result.arabic}</Text>
      {!!result.transliteration && (
        <Text style={[styles.translit, { color: colors.textMuted }]}>{result.transliteration}</Text>
      )}
      {result.audio && <AudioPlayer audio={result.audio} verseKey={result.verseKey} showLabel />}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* translation */}
      <Text style={[styles.segLabel, { color: colors.textMuted }]}>{t("results.translation")}</Text>
      {result.translation ? (
        <Highlight text={result.translation} terms={terms} style={trStyle} />
      ) : (
        <Text style={[styles.miss, { color: colors.textMuted }]}>
          {t("results.notAvailableTranslation")}
        </Text>
      )}

      {/* context passage */}
      {ctx && ctx.verses.length > 1 && (
        <View style={[styles.ctxBlock, { borderColor: colors.border }]}>
          <Text style={[styles.segLabel, { color: colors.textMuted }]}>
            {t("results.context")} {ctx.verse_keys[0]}–{ctx.verse_keys[ctx.verse_keys.length - 1]}
          </Text>
          <Text style={[styles.ctxExplain, { color: colors.textMuted }]}>
            {t("results.contextExplain")}
          </Text>
          {ctx.verses.map((v) => (
            <View
              key={v.verse_key}
              style={[
                styles.neighbor,
                { borderColor: colors.border },
                v.isMatch && { backgroundColor: colors.surfaceAlt },
              ]}
            >
              <Text style={[styles.nbRef, { color: colors.accent }]}>
                {v.verse_key}
                {v.isMatch ? ` · ${t("results.matchedTag")}` : ""}
              </Text>
              <Text style={[styles.nbAr, { color: colors.text }]}>{v.arabic}</Text>
              {!!v.transliteration && (
                <Text style={[styles.translit, { color: colors.textMuted }]}>{v.transliteration}</Text>
              )}
              {v.audio && <AudioPlayer audio={v.audio} verseKey={v.verse_key} />}
              {!!v.translation && (
                <Text style={[styles.nbEn, { color: colors.text }, rtl && styles.rtlText]}>
                  {v.translation}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* tafsir expander */}
      <Pressable
        onPress={toggleTafseer}
        disabled={!result.tafseerAvailable && ctxKeys.length === 0}
        style={[styles.expander, { borderColor: colors.border }]}
      >
        <Text style={[styles.expanderText, { color: colors.text }]}>
          {t("results.tafseer")} {showTafseer ? "▲" : "▼"}
        </Text>
      </Pressable>
      {!result.tafseerAvailable && tafsirLanguages.length > 0 && (
        <Text style={[styles.tafNote, { color: colors.textMuted }]}>
          {t("results.tafsirAvailableIn", { langs: tafsirLanguages.join(", ") })}
        </Text>
      )}

      {showTafseer && (
        <View style={[styles.tafBody, { backgroundColor: colors.surfaceAlt }]}>
          {ed ? (
            <Text style={[styles.tafSrc, { color: colors.textMuted }]}>
              {ed.name} · {ed.language} · {ed.source}
              {!ed.complete
                ? ` · ${t("results.partialEdition", { pct: Math.round((ed.coverage / 6236) * 100) })}`
                : ""}
            </Text>
          ) : (
            <Text style={[styles.tafSrc, { color: colors.textMuted }]}>
              {result.sources.tafseer || t("results.tafseer")}
            </Text>
          )}

          {ctxKeys.length > 0 ? (
            !ctxTaf ? (
              <Text style={[styles.miss, { color: colors.textMuted }]}>
                {t("results.tafsirLoading")}
              </Text>
            ) : (
              ctxTaf.map((v) => (
                <View key={v.verseKey} style={styles.ctxTaf}>
                  <Text style={[styles.ctxTafRef, { color: colors.accent }]}>{v.verseKey}</Text>
                  {v.tafseerAvailable ? (
                    <TafsirText text={v.tafseer} terms={terms} />
                  ) : (
                    <Text style={[styles.miss, { color: colors.textMuted }]}>
                      {t("more.tafsirUnavailable")}
                    </Text>
                  )}
                </View>
              ))
            )
          ) : result.tafseerAvailable ? (
            <TafsirText text={result.tafseer} terms={terms} />
          ) : (
            <Text style={[styles.miss, { color: colors.textMuted }]}>{result.tafseer}</Text>
          )}
        </View>
      )}

      {/* sources */}
      <View style={[styles.sources, { borderColor: colors.border }]}>
        <Text style={[styles.sourceTag, { color: colors.textMuted }]}>
          {t("sources.arabic")}: <Text style={{ fontWeight: "700" }}>{result.sources.arabic}</Text>
        </Text>
        <Text style={[styles.sourceTag, { color: colors.textMuted }]}>
          {t("sources.translation")}:{" "}
          <Text style={{ fontWeight: "700" }}>{result.sources.translation}</Text>
        </Text>
        {!!result.sources.tafseer && (
          <Text style={[styles.sourceTag, { color: colors.textMuted }]}>
            {t("sources.tafseer")}:{" "}
            <Text style={{ fontWeight: "700" }}>{result.sources.tafseer}</Text>
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 14, gap: 4 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  titleWrap: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  rank: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rankText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  surah: { fontSize: 16, fontWeight: "700", flexShrink: 1 },
  relevance: { fontSize: 11 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 6 },
  typeChip: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden",
  },
  topicTitle: { fontSize: 12, fontStyle: "italic" },
  badge: {
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden",
  },
  matchReasons: { fontSize: 12, marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" },
  metaAr: { fontSize: 15 },
  meta: { fontSize: 12 },
  placeBadge: {
    fontSize: 11,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  arabic: {
    fontSize: 26,
    lineHeight: 48,
    textAlign: "right",
    writingDirection: "rtl",
    marginTop: 12,
  },
  translit: { fontSize: 13, fontStyle: "italic", marginTop: 4 },
  divider: { height: 1, marginVertical: 12 },
  segLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  translation: { fontSize: 16, lineHeight: 26, marginTop: 4 },
  rtlText: { textAlign: "right", writingDirection: "rtl" },
  miss: { fontSize: 14, fontStyle: "italic", marginTop: 4 },
  ctxBlock: { borderTopWidth: 1, marginTop: 14, paddingTop: 12, gap: 6 },
  ctxExplain: { fontSize: 12, fontStyle: "italic" },
  neighbor: { borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6, gap: 4 },
  nbRef: { fontSize: 11, fontWeight: "700" },
  nbAr: { fontSize: 20, lineHeight: 38, textAlign: "right", writingDirection: "rtl" },
  nbEn: { fontSize: 14, lineHeight: 22 },
  expander: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  expanderText: { fontSize: 14, fontWeight: "600" },
  tafNote: { fontSize: 12, marginTop: 6 },
  tafBody: { borderRadius: 10, padding: 12, marginTop: 8 },
  tafSrc: { fontSize: 11, marginBottom: 8 },
  ctxTaf: { marginTop: 10 },
  ctxTafRef: { fontSize: 12, fontWeight: "700", marginBottom: 2 },
  sources: { borderTopWidth: 1, marginTop: 14, paddingTop: 10, gap: 3 },
  sourceTag: { fontSize: 12 },
});
