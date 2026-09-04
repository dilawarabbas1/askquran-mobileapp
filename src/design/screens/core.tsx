// Core screens: SearchHome (hero + API-loaded suggested questions + recent),
// Results (live /api/ask search), and Reader. Search and suggested questions
// come from the backend API (like the web app); the bundled TOPICS are only an
// offline fallback so the screen is never empty.

import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Text } from "../AppText";
import { useApp } from "../AQContext";
import { AyahCard, BlockTitle, FieldLabel, IconBtn, OrnDivider, PlaceBadge, SegLabel, Translation, translationStyle } from "../atoms";
import { Icon, RawIcon } from "../Icon";
import { SearchBar } from "../SearchBar";
import { AudioBar } from "../AudioBar";
import { TOPICS, type AyahItem } from "../data";
import { FONTS, mix } from "../tokens";
import { ask, getSuggestedQuestions, translationIdForLanguage, AqError, type AyahResult, type SuggestedGroup } from "@/api";
import { track } from "@/analytics";
import { surahName, surahNoFromRef } from "@/analytics/events";
import { copyAyah, shareAyah } from "../lib/ayahActions";
import { withHonorifics } from "../lib/honorifics";
import { QuranText } from "../../quran/QuranText";
import { saFromKey } from "../../quran/qpcIndex";

/* ---------- map an API AyahResult → the card's AyahItem shape ---------- */
function placeNorm(p: string): "Mecca" | "Madinah" {
  const s = (p || "").toLowerCase();
  return s.startsWith("mec") || s.startsWith("mak") ? "Mecca" : "Madinah";
}
function toItem(r: AyahResult): AyahItem {
  return {
    surah: `Surah ${r.surahNameEn}`,
    ref: r.verseKey,
    arName: r.surahNameAr,
    juz: r.juz,
    place: placeNorm(r.revelationPlace),
    relevance: (r.relevanceScore ?? 0).toFixed(2),
    topics: [],
    arabic: r.arabic,
    transliteration: r.transliteration,
    en: r.translation,
    ur: r.translation,
    tafseer: r.tafseer || "",
    surrounding: (r.context?.verses ?? []).map((v) => ({ ref: v.verse_key, ar: v.arabic, en: v.translation, center: v.isMatch })),
    sources: { arabic: r.sources?.arabic ?? "", translation: r.sources?.translation ?? "", tafseer: r.sources?.tafseer ?? "" },
    audio: r.audio,
  };
}

/* ---------- HOME / SEARCH ---------- */
export function SearchHome() {
  const app = useApp();
  const { tokens } = app;
  const [q, setQ] = useState("");
  const grid = app.homeLayout === "Grid";
  const submit = () => { if (q.trim()) app.runSearch(q.trim()); };

  // Suggested questions, loaded from the API (grouped, like the web).
  const [groups, setGroups] = useState<SuggestedGroup[] | null>(null);
  const [qLoading, setQLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    getSuggestedQuestions()
      .then((g) => { if (alive) { setGroups(g); setQLoading(false); } })
      .catch(() => { if (alive) { setGroups(null); setQLoading(false); } });
    return () => { alive = false; };
  }, []);

  const hasApiQuestions = groups && groups.length > 0;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 26 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {/* hero band */}
      <View style={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 20, alignItems: "center" }}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={{ alignSelf: "stretch", fontFamily: FONTS.ar, fontSize: 21, lineHeight: 42, color: tokens.text, textAlign: "center", writingDirection: "rtl", paddingTop: 4 }}>
          لَا إِلٰهَ إِلَّا ٱللَّٰهُ مُحَمَّدٌ رَسُولُ ٱللَّٰهِ
        </Text>
        <Text numberOfLines={1} adjustsFontSizeToFit style={{ alignSelf: "stretch", fontFamily: FONTS.serif.italic, fontStyle: "italic", fontSize: 11.5, color: tokens.brand2, marginTop: 6, textAlign: "center" }}>
          {app.t("hero.shahadaEn")}
        </Text>
        <Text style={{ maxWidth: 300, marginTop: 8, fontSize: 13.5, lineHeight: 21.6, color: tokens.text2, textAlign: "center", fontFamily: FONTS.sans[400] }}>
          {app.t("hero.lede")}
        </Text>
        <OrnDivider />
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 6 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder={app.t("search.placeholder")} onSubmit={submit} showGo />

        {/* Test Your Knowledge — source-grounded quiz (opens the quiz screen). */}
        <Pressable onPress={() => app.openQuiz()} style={[{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 14 }, tokens.cardShadow]}>
          <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11), borderWidth: 1, borderColor: mix(tokens.brand, 22, tokens.line) }}>
            <Icon name="grid" size={17} w={1.9} color={tokens.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.serif[600], fontSize: 16, color: tokens.text }}>{app.t("m.quiz.title")}</Text>
            <Text style={{ fontSize: 12.5, color: tokens.text2, marginTop: 2 }}>{app.t("m.quiz.ctaSub")}</Text>
          </View>
          <Icon name="chevR" size={16} w={2.1} color={tokens.text3} />
        </Pressable>

        {hasApiQuestions ? (
          /* API-loaded suggested questions, grouped by topic ("Try asking") */
          <>
            <FieldLabel>{app.t("suggest.tryAsking")}</FieldLabel>
            {groups!.map((g) => {
              // Group titles are translated via i18n keyed by the group's slug id
              // (browse.group.<id>); fall back to the raw API title when the key
              // is absent. translate() returns the key unchanged on a miss, so we
              // compare against the key rather than rely on `|| g.title`.
              const gKey = `browse.group.${g.id}`;
              const gTitle = app.t(gKey);
              return (
              <View key={g.id}>
                <FieldLabel>{gTitle === gKey ? g.title : gTitle}</FieldLabel>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 9 }}>
                  {g.questions.map((qq) => {
                    // Chip label follows the UI/interface language (appLanguage),
                    // not the Quran translation language; fall back to English text.
                    const label = (qq.translations && qq.translations[app.appLanguage]) || qq.text;
                    return (
                      <Pressable key={qq.id} onPress={() => app.runSearch(label)} style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 15 }, tokens.cardShadow]}>
                        <Text style={{ fontSize: 13.5, fontFamily: FONTS.sans[600], color: tokens.text }}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              );
            })}
          </>
        ) : (
          <>
            <FieldLabel>{qLoading ? app.t("m.loadingSuggestions") : app.t("m.suggestedTopics")}</FieldLabel>
            {qLoading ? (
              <ActivityIndicator color={tokens.brand} style={{ alignSelf: "flex-start", marginLeft: 2 }} />
            ) : (
              /* offline fallback: the bundled topic chips */
              <View style={{ flexDirection: grid ? "row" : "row", flexWrap: "wrap", gap: grid ? 11 : 9 }}>
                {TOPICS.map((t) => (
                  <Pressable key={t.q} onPress={() => app.runSearch(t.q)} style={[{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 999, paddingVertical: 9, paddingLeft: 12, paddingRight: 15 }, tokens.cardShadow]}>
                    <View style={{ width: 24, height: 24, borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
                      <RawIcon inner={t.ic} size={14} w={1.9} color={tokens.brand} />
                    </View>
                    <Text style={{ fontSize: 13.5, fontFamily: FONTS.sans[600], color: tokens.text }}>{t.q}</Text>
                    <Text style={{ fontFamily: FONTS.ar, fontSize: 14, color: tokens.text3 }}>{t.ar}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}

      </View>
    </ScrollView>
  );
}

/* ---------- RESULTS (live /api/ask) ---------- */
export function Results() {
  const app = useApp();
  const { tokens } = app;
  const q = app.query;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AyahItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = React.useCallback(() => {
    let alive = true;
    setLoading(true); setError(null); setMessage(null);
    // Resolve the translation edition for the chosen language and pass it
    // explicitly — `language` alone makes the backend fall back to en.sahih, so
    // an Urdu translation preference would silently return English results.
    translationIdForLanguage(app.language)
      .then((trId) => ask(q, { language: app.language, ...(trId ? { translation: trId } : {}) }))
      .then((res) => {
        if (!alive) return;
        setItems(res.results.map(toItem));
        const count = res.count ?? res.results.length;
        setMessage(count === 0 ? res.message || "No matching Quran reference found." : null);
        // Fire once per resolved search now that result_count is known. A zero-
        // result search additionally emits search_no_results.
        track("search", { query: q, result_count: count, language: app.appLanguage, translation_language: app.translationLanguage });
        if (count === 0) track("search_no_results", { query: q, language: app.appLanguage });
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof AqError ? e.message : "Couldn’t reach the search service.");
        setItems([]);
        setLoading(false);
      });
    return () => { alive = false; };
  }, [q, app.language]);

  useEffect(() => run(), [run]);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 26 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 14, marginHorizontal: 2 }}>
        <Text style={{ fontSize: 14, fontFamily: FONTS.sans[700], color: tokens.text }}>
          {(() => {
            // `{q}` placeholder lets each locale set query/label word order — Urdu
            // and other postpositional scripts read "X کے لیے نتائج" (query first),
            // while LTR locales without the placeholder keep label-then-query.
            const tpl = app.t("results.resultsFor");
            const styledQ = <Text style={{ color: tokens.brand }}>“{q}”</Text>;
            if (tpl.includes("{q}")) {
              const [before, after] = tpl.split("{q}");
              return <>{before}{styledQ}{after}</>;
            }
            return <>{tpl} {styledQ}</>;
          })()}
        </Text>
        {!loading && !error ? <Text style={{ fontSize: 12, color: tokens.text3 }}>{items.length} {app.t(items.length === 1 ? "m.sourceOne" : "m.sourceMany")}</Text> : null}
      </View>

      {loading ? (
        <View style={{ alignItems: "center", paddingVertical: 56 }}>
          <ActivityIndicator color={tokens.brand} />
          <Text style={{ marginTop: 12, fontSize: 13, color: tokens.text3 }}>{app.t("m.searching")}</Text>
        </View>
      ) : error ? (
        <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 20 }}>
          <Icon name="search" size={38} w={1.6} color={tokens.text3} />
          <Text style={{ marginTop: 12, fontSize: 14, lineHeight: 22, color: tokens.text3, textAlign: "center" }}>{error}</Text>
          <Pressable onPress={run} style={{ marginTop: 18, backgroundColor: tokens.brand, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 14, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>{app.t("m.retry")}</Text>
          </Pressable>
        </View>
      ) : items.length ? (
        <View style={{ gap: 16 }}>
          {items.map((d, i) => <AyahCard item={d} rank={i + 1} key={d.ref + i} />)}
        </View>
      ) : (
        <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 20 }}>
          <Icon name="search" size={38} w={1.6} color={tokens.text3} />
          <Text style={{ marginTop: 12, fontSize: 14, lineHeight: 24, color: tokens.text3, textAlign: "center" }}>{message}</Text>
        </View>
      )}
    </ScrollView>
  );
}

/* ---------- READER ---------- */
export function Reader() {
  const app = useApp();
  const { tokens } = app;
  const item = app.readerItem;
  const saved = app.isSaved(item.ref);
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 26 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, alignItems: "center" }}>
        <SegLabel>{app.t("m.title.reader")}</SegLabel>
        <BlockTitle style={{ marginTop: 9, fontSize: 22 }}>{item.surah}</BlockTitle>
        <Text style={{ fontSize: 12.5, color: tokens.text3, marginTop: 4 }}>
          <Text style={{ fontFamily: FONTS.ar, fontSize: 17, color: tokens.orn }}>{item.arName}</Text>
          {"  ·  " + item.ref + "  ·  Juz " + item.juz}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 6 }}>
        <View style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 18, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 15 }, tokens.cardShadow]}>
          {(() => {
            // QPC V2 glyphs (ref shown in the header → medallion suppressed); ayah
            // justified per the app-wide rule. Range refs fall back to Unicode.
            const sa = saFromKey(item.ref);
            return sa
              ? <QuranText surah={sa.surah} ayah={sa.ayah} uthmani={item.arabic} suppressMedallion color={tokens.arColor} fontSize={26} lineHeight={58} />
              : <Text style={{ fontFamily: FONTS.ar, fontSize: 26, lineHeight: 58, color: tokens.arColor, textAlign: "justify", writingDirection: "rtl" }}>{item.arabic}</Text>;
          })()}
          {item.transliteration ? (
            <Text style={{ fontFamily: FONTS.serif[400], fontStyle: "italic", fontSize: 16, lineHeight: 26, color: tokens.text3, textAlign: "center", marginTop: 8 }}>
              {item.transliteration}
            </Text>
          ) : null}
          <View style={{ height: 1, backgroundColor: tokens.lineSoft, marginVertical: 12 }} />
          <Translation item={item} />
          {item.audio?.url ? <AudioBar url={item.audio.url} reciter={item.audio.reciter} surahName={surahName(item.surah)} surahNo={surahNoFromRef(item.ref)} ayahKey={item.ref} /> : null}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: tokens.lineSoft }}>
            <PlaceBadge place={item.place} tokens={tokens} madinahLabel="Madinan" />
            <View style={{ flexDirection: "row", gap: 6 }}>
              <IconBtn name={saved ? "bookmarkFill" : "bookmark"} active={saved} onPress={() => app.toggleSave(item)} />
              <IconBtn name="copy" onPress={() => { void copyAyah(item, app.lang); }} />
              <IconBtn name="share" onPress={() => { void shareAyah(item, app.lang); }} />
            </View>
          </View>
        </View>

        {item.surrounding?.length ? (
          <>
            <FieldLabel>{app.t("m.inContext")}</FieldLabel>
            <View style={{ gap: 9 }}>
              {item.surrounding.map((n, i) => (
                <View key={i} style={{ paddingHorizontal: 13, paddingVertical: 11, borderRadius: 11, borderWidth: 1, borderColor: n.center ? mix(tokens.brand, 35) : tokens.lineSoft, backgroundColor: n.center ? mix(tokens.brand, 5, tokens.surface2) : tokens.surface2 }}>
                  <Text style={{ fontSize: 10, fontFamily: FONTS.sans[700], letterSpacing: 0.4, color: tokens.text3, marginBottom: 5 }}>{n.ref}{n.center ? " · matched" : ""}</Text>
                  <Text style={{ fontFamily: FONTS.ar, fontSize: 18, lineHeight: 33, color: tokens.arColor, textAlign: "center", writingDirection: "rtl" }}>{n.ar}</Text>
                  <Text style={[translationStyle(app.language, tokens, 0.9), { color: tokens.text2, marginTop: 4 }]}>{n.en}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {item.tafseer ? (
          <>
            <FieldLabel>{app.t("m.tafsir")}</FieldLabel>
            <View style={{ paddingHorizontal: 15, paddingVertical: 14, backgroundColor: mix(tokens.gold, 7, tokens.surface2), borderWidth: 1, borderColor: tokens.lineSoft, borderRadius: 12 }}>
              {/* Tafsir uses the exact same per-script font/size/leading as the verse
                  translation (no down-scale) since that display reads perfectly.
                  Honorifics render 2pt smaller so their stacked diacritics don't
                  crowd the line above/below. */}
              {(() => {
                const tStyle = translationStyle(app.language, tokens);
                return <Text style={tStyle}>{withHonorifics(item.tafseer, tStyle.fontSize)}</Text>;
              })()}
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}
