import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ask, fetchSuggestedQuestions } from "@/api/client";
import { HeroHeader } from "@/components/HeroHeader";
import { ResultCard } from "@/components/ResultCard";
import { TranslationControls } from "@/components/TranslationControls";
import { useSettings } from "@/context/Settings";
import { useSearchBus } from "@/context/SearchBus";
import { useI18n } from "@/i18n/I18n";
import { useTheme } from "@/theme/ThemeContext";
import type { AskFilters, AskResponse, SuggestedGroup } from "@/types";

type Place = "all" | "Mecca" | "Madinah";

export function SearchScreen() {
  const { t, lang: uiLang } = useI18n();
  const { colors } = useTheme();
  const { language, translation, tafsir, error: settingsError } = useSettings();
  const { pending } = useSearchBus();

  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [place, setPlace] = useState<Place>("all");
  const [surah, setSurah] = useState("");
  const [juz, setJuz] = useState("");
  const [hasTafseer, setHasTafseer] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [response, setResponse] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggested, setSuggested] = useState<SuggestedGroup[]>([]);

  useEffect(() => {
    fetchSuggestedQuestions().then(setSuggested).catch(() => setSuggested([]));
  }, []);

  // Consume a cross-screen search request (e.g. an ayah chip on the Facts tab).
  useEffect(() => {
    if (pending?.query != null) {
      setQuery(pending.query);
      runSearch(pending.query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending?.nonce]);

  const buildFilters = (): AskFilters => {
    const f: AskFilters = {};
    const s = Number(surah);
    const j = Number(juz);
    if (Number.isInteger(s) && s >= 1 && s <= 114) f.surah = s;
    if (Number.isInteger(j) && j >= 1 && j <= 30) f.juz = j;
    if (place !== "all") f.revelationPlace = place;
    return f;
  };

  async function runSearch(overrideQuery?: string) {
    const q = (overrideQuery ?? query).trim();
    const filters = buildFilters();
    if (!q && Object.keys(filters).length === 0) {
      setResponse(null);
      setSubmitted("");
      return;
    }
    setLoading(true);
    setError(null);
    setSubmitted(q);
    try {
      const data = await ask(q, translation, filters, language, tafsir || undefined);
      setResponse(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }

  function pickSuggestion(text: string) {
    setQuery(text);
    runSearch(text);
  }

  // Re-run on translation/language/tafsir/filter change when a search is active.
  useEffect(() => {
    if (response || submitted) runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translation, language, tafsir, place, surah, juz]);

  const shown = useMemo(() => {
    if (!response) return [];
    return hasTafseer ? response.results.filter((r) => r.tafseerAvailable) : response.results;
  }, [response, hasTafseer]);

  // Flatten a handful of suggested questions for the "Try asking" chips.
  const tryChips = useMemo(() => {
    const out: { id: string; text: string }[] = [];
    for (const g of suggested) {
      for (const qn of g.questions) {
        const text = qn.translations?.[uiLang] ?? qn.text;
        out.push({ id: qn.id, text });
        if (out.length >= 8) return out;
      }
    }
    return out;
  }, [suggested, uiLang]);

  const header = (
    <View>
      <HeroHeader />
      <View style={styles.body}>
        {/* search card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.searchRow}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => runSearch()}
              placeholder={t("search.placeholder")}
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.text, backgroundColor: colors.surfaceAlt },
              ]}
            />
            <Pressable
              onPress={() => runSearch()}
              disabled={loading}
              style={[styles.searchBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.searchBtnText}>
                {loading ? t("search.searching") : t("search.button")}
              </Text>
            </Pressable>
          </View>

          <View style={{ marginTop: 12 }}>
            <TranslationControls />
          </View>

          <Pressable onPress={() => setShowFilters((s) => !s)} style={styles.filtersToggle}>
            <Text style={[styles.filtersToggleText, { color: colors.accent }]}>
              {t("search.filters")} {showFilters ? "▲" : "▼"}
            </Text>
          </Pressable>

          {showFilters && (
            <View style={[styles.filterPanel, { borderColor: colors.border }]}>
              <Text style={[styles.fpLabel, { color: colors.textMuted }]}>
                {t("filter.revelation")}
              </Text>
              <View style={styles.chipsRow}>
                {(["all", "Mecca", "Madinah"] as Place[]).map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setPlace(p)}
                    style={[
                      styles.chip,
                      { borderColor: colors.border },
                      place === p && { backgroundColor: colors.accentSoft, borderColor: colors.accent },
                    ]}
                  >
                    <Text style={{ color: place === p ? colors.accent : colors.textMuted }}>
                      {p === "all" ? t("filter.all") : p === "Mecca" ? t("filter.mecca") : t("filter.madinah")}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.fpRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fpLabel, { color: colors.textMuted }]}>{t("filter.surah")}</Text>
                  <TextInput
                    value={surah}
                    onChangeText={setSurah}
                    keyboardType="number-pad"
                    placeholder="1–114"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.fpInput, { borderColor: colors.border, color: colors.text }]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fpLabel, { color: colors.textMuted }]}>{t("filter.juz")}</Text>
                  <TextInput
                    value={juz}
                    onChangeText={setJuz}
                    keyboardType="number-pad"
                    placeholder="1–30"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.fpInput, { borderColor: colors.border, color: colors.text }]}
                  />
                </View>
              </View>

              <Pressable
                onPress={() => setHasTafseer((v) => !v)}
                style={[
                  styles.chip,
                  { borderColor: colors.border, alignSelf: "flex-start", marginTop: 6 },
                  hasTafseer && { backgroundColor: colors.accentSoft, borderColor: colors.accent },
                ]}
              >
                <Text style={{ color: hasTafseer ? colors.accent : colors.textMuted }}>
                  {t("filter.hasTafseer")}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* try asking */}
        {tryChips.length > 0 && !response && (
          <View style={styles.tryWrap}>
            <Text style={[styles.tryLabel, { color: colors.textMuted }]}>{t("search.placeholder")}</Text>
            <View style={styles.chipsRow}>
              {tryChips.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => pickSuggestion(c.text)}
                  style={[styles.suggestChip, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.text }}>{c.text}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {(error || settingsError) && (
          <View style={[styles.banner, { backgroundColor: colors.danger }]}>
            <Text style={styles.bannerText}>{error || settingsError}</Text>
          </View>
        )}

        {response && (
          <View style={styles.resultsHead}>
            <Text style={[styles.resultsTitle, { color: colors.text }]}>
              {submitted ? `${t("results.resultsFor")} "${submitted}"` : t("results.browseIndex")}
            </Text>
            <Text style={[styles.count, { color: colors.textMuted }]}>
              {shown.length
                ? `${shown.length} ${shown.length === 1 ? t("results.referencedOne") : t("results.referencedMany")}`
                : ""}
            </Text>
          </View>
        )}

        {response && shown.length === 0 && (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {response.message ?? t("results.none")}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t("results.tryMoreSpecific")}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={header}
      data={shown}
      keyExtractor={(r) => r.verseKey}
      renderItem={({ item }) =>
        response ? (
          <View style={styles.body}>
            <ResultCard
              result={item}
              terms={response.terms}
              language={language}
              translationId={translation}
            />
          </View>
        ) : null
      }
      ListFooterComponent={
        loading ? <ActivityIndicator style={{ margin: 24 }} color={colors.primary} /> : null
      }
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 40 },
  body: { paddingHorizontal: 16 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginTop: -28 },
  searchRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  searchBtn: { borderRadius: 10, paddingHorizontal: 16, justifyContent: "center" },
  searchBtnText: { color: "#fff", fontWeight: "700" },
  filtersToggle: { marginTop: 12, alignSelf: "flex-start" },
  filtersToggleText: { fontWeight: "600", fontSize: 13 },
  filterPanel: { borderTopWidth: 1, marginTop: 10, paddingTop: 12, gap: 8 },
  fpLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 },
  fpRow: { flexDirection: "row", gap: 12 },
  fpInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  tryWrap: { marginTop: 16 },
  tryLabel: { fontSize: 12, marginBottom: 8 },
  suggestChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  banner: { borderRadius: 10, padding: 12, marginTop: 14 },
  bannerText: { color: "#fff", fontWeight: "600" },
  resultsHead: { marginTop: 18, marginBottom: 8 },
  resultsTitle: { fontSize: 18, fontWeight: "700" },
  count: { fontSize: 12, marginTop: 2 },
  empty: { padding: 24, alignItems: "center", gap: 6 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
