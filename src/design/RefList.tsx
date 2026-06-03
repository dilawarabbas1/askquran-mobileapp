// Shared reference-page UI for the mobile Library — the mobile counterpart of
// the web's RefItemsPage. Renders a collection of Quran-backed reference cards
// (Duas, Prophet Stories, Parables, Commands & Prohibitions, Warnings, Ethical
// Character, Legal Rulings). Each card lazily loads its verbatim Arabic +
// translation from the backend (GET /api/verses) when expanded, and stored
// tafsir on demand (?tafsir=1). Nothing is generated; all text is source-backed.

import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useApp } from "./AQContext";
import { BlockTitle, SegLabel, translationStyle } from "./atoms";
import { Icon } from "./Icon";
import { SearchBar } from "./SearchBar";
import { FONTS, mix, type Tokens } from "./tokens";
import { expandRefs, countAyahs } from "./lib/refs";
import { COLLECTION_BY_ID, REF_TRUST, SURAHS, type RefCardItem } from "./refData";
import { getVerses, translationIdForLanguage, type AyahResult } from "@/api";

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
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, marginBottom: 6 }}>
      <View style={{ minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
        <Text style={{ fontSize: 11, fontFamily: FONTS.sans[700], color: tokens.brand }}>{num}</Text>
      </View>
      <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[700], color: tokens.text2 }}>{m?.name ?? `Surah ${num}`}</Text>
      {m?.ar ? <Text style={{ fontFamily: FONTS.ar, fontSize: 15, color: tokens.text3 }}>{m.ar}</Text> : null}
    </View>
  );
}

/* ---------- chips of refs (tap → run a search for that reference) ---------- */
function RefChips({ refs, tokens }: { refs: string[]; tokens: Tokens }) {
  const app = useApp();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {refs.map((r) => (
        <Pressable key={r} onPress={() => app.runSearch(r)} style={{ borderWidth: 1, borderColor: mix(tokens.brand, 24, tokens.line), backgroundColor: mix(tokens.brand, 8), borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 }}>
          <Text style={{ fontSize: 12, fontFamily: FONTS.sans[600], color: tokens.brand }}>{r}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/* ---------- lazy ayah + tafsir loader for one card ---------- */
function AyahBlocks({
  refs,
  translationId,
  showTafsir,
  mainRefs,
  mainBadge,
  tokens,
}: {
  refs: string[];
  translationId: string;
  showTafsir: boolean;
  mainRefs?: string[];
  mainBadge?: boolean;
  tokens: Tokens;
}) {
  const { language } = useApp();
  const keys = useMemo(() => expandRefs(refs), [refs]);
  const mainSet = useMemo(() => new Set(expandRefs(mainRefs ?? [])), [mainRefs]);
  const [open, setOpen] = useState(false);
  const [verses, setVerses] = useState<AyahResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showTaf, setShowTaf] = useState(false);
  const [tafVerses, setTafVerses] = useState<AyahResult[] | null>(null);
  const [tafLoading, setTafLoading] = useState(false);

  // Load the passage verbatim the first time the user opens the card.
  useEffect(() => {
    if (!open || verses || loading || !translationId) return;
    let alive = true;
    setLoading(true);
    setError(false);
    getVerses(keys, translationId)
      .then((v) => { if (alive) setVerses(v); })
      .catch(() => { if (alive) setError(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [open, keys, translationId, verses, loading]);

  // Tafsir loads only when opened (stored sources; never generated).
  useEffect(() => {
    if (!showTaf || tafVerses || tafLoading || !translationId) return;
    let alive = true;
    setTafLoading(true);
    getVerses(keys, translationId, "1")
      .then((v) => { if (alive) setTafVerses(v); })
      .catch(() => { if (alive) setTafVerses([]); })
      .finally(() => { if (alive) setTafLoading(false); });
    return () => { alive = false; };
  }, [showTaf, keys, translationId, tafVerses, tafLoading]);

  const tafOrdered = useMemo(() => {
    if (!tafVerses) return null;
    if (!mainSet.size) return tafVerses;
    const main = tafVerses.filter((v) => mainSet.has(v.verseKey));
    const rest = tafVerses.filter((v) => !mainSet.has(v.verseKey));
    return [...main, ...rest];
  }, [tafVerses, mainSet]);

  return (
    <View style={{ marginTop: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <RefChips refs={refs} tokens={tokens} />
        </View>
        <Text style={{ fontSize: 11, color: tokens.text3, fontFamily: FONTS.sans[600] }}>{keys.length} {keys.length === 1 ? "ayah" : "ayahs"}</Text>
      </View>

      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginTop: 10 }}
      >
        <Text style={{ fontSize: 13, fontFamily: FONTS.sans[700], color: tokens.brand2 }}>
          {open ? "Hide passage" : "Show passage"}
        </Text>
        <Icon name={open ? "chevDown" : "chevR"} size={14} w={2.2} color={tokens.brand2} />
      </Pressable>

      {open ? (
        error ? (
          <Text style={{ marginTop: 10, fontSize: 12.5, color: tokens.text3 }}>Couldn’t load this passage. Pull to retry or check your connection.</Text>
        ) : !verses && loading ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
            <ActivityIndicator color={tokens.brand} />
            <Text style={{ fontSize: 12.5, color: tokens.text3 }}>Loading verbatim text…</Text>
          </View>
        ) : (
          <View>
            {groupBySurah(verses ?? []).map((g) => (
              <View key={g.surah}>
                <SurahHead num={g.surah} tokens={tokens} />
                {g.verses.map((v) => (
                  <View key={v.verseKey} style={{ paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: tokens.lineSoft }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 5 }}>
                      <Text style={{ fontSize: 10, fontFamily: FONTS.sans[700], letterSpacing: 0.4, color: tokens.text3 }}>{v.verseKey}</Text>
                      {mainBadge && mainSet.has(v.verseKey) ? (
                        <View style={{ backgroundColor: mix(tokens.gold, 18, tokens.surface2), borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}>
                          <Text style={{ fontSize: 9, fontFamily: FONTS.sans[700], color: tokens.mode === "dark" ? tokens.goldSoft : tokens.goldDeep }}>MAIN</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={{ fontFamily: FONTS.ar, fontSize: 21, lineHeight: 40, color: tokens.arColor, textAlign: "right", writingDirection: "rtl" }}>{v.arabic}</Text>
                    {v.translation ? <Text style={[translationStyle(language, tokens), { fontSize: 13.5, lineHeight: 21, color: tokens.text2, marginTop: 4 }]}>{v.translation}</Text> : null}
                  </View>
                ))}
              </View>
            ))}

            {showTafsir ? (
              <View style={{ marginTop: 12 }}>
                <Pressable onPress={() => setShowTaf((s) => !s)} style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.sans[700], color: tokens.brand2 }}>{showTaf ? "Hide tafsir" : "Show tafsir"}</Text>
                  <Icon name="chevDown" size={14} w={2.2} color={tokens.brand2} />
                </Pressable>
                {showTaf ? (
                  tafLoading && !tafOrdered ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
                      <ActivityIndicator color={tokens.brand} />
                      <Text style={{ fontSize: 12.5, color: tokens.text3 }}>Loading tafsir…</Text>
                    </View>
                  ) : (
                    <View style={{ marginTop: 10, gap: 10 }}>
                      {(tafOrdered ?? []).map((v) => (
                        <View key={v.verseKey} style={{ paddingHorizontal: 13, paddingVertical: 12, backgroundColor: mix(tokens.gold, 7, tokens.surface2), borderWidth: 1, borderColor: tokens.lineSoft, borderRadius: 12 }}>
                          <Text style={{ fontSize: 10, fontFamily: FONTS.sans[700], letterSpacing: 0.4, color: tokens.text3, marginBottom: 5 }}>{v.verseKey}</Text>
                          {v.tafseerAvailable ? (
                            <>
                              {v.tafseerEdition?.name ? <Text style={{ fontSize: 11, fontFamily: FONTS.sans[600], color: tokens.text3, marginBottom: 4 }}>{v.tafseerEdition.name}</Text> : null}
                              <Text style={{ fontFamily: FONTS.serif[400], fontSize: 13.5, lineHeight: 23, color: tokens.text }}>{v.tafseer}</Text>
                            </>
                          ) : (
                            <Text style={{ fontSize: 12.5, color: tokens.text3, fontStyle: "italic" }}>No stored tafsir for this ayah.</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )
                ) : null}
              </View>
            ) : null}
          </View>
        )
      ) : null}
    </View>
  );
}

/* ---------- trust note (matches the Facts screen pattern) ---------- */
function TrustNote({ tokens, children }: { tokens: Tokens; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", gap: 11, alignItems: "flex-start", backgroundColor: mix(tokens.brand, 6, tokens.surface), borderWidth: 1, borderColor: mix(tokens.brand, 22, tokens.line), borderRadius: 14, padding: 13, marginBottom: 14 }}>
      <View style={{ width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 12) }}>
        <Icon name="shield" size={15} color={tokens.brand} />
      </View>
      <Text style={{ flex: 1, fontSize: 12, lineHeight: 18.6, color: tokens.text2 }}>{children}</Text>
    </View>
  );
}

function FilterChips<T extends string>({
  options,
  value,
  onChange,
  tokens,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  tokens: Tokens;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 10 }} contentContainerStyle={{ gap: 7, paddingRight: 8 }}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={{ paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: on ? tokens.brand : tokens.line, backgroundColor: on ? mix(tokens.brand, 12) : tokens.surface2 }}>
            <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[600], color: on ? tokens.brand : tokens.text2 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const TYPE_LABEL: Record<string, string> = {
  command: "Command", prohibition: "Prohibition", cultivate: "Cultivate", avoid: "Avoid",
};

function Card({ item, translationId, showTafsir, mainBadge, typeBadge, catTitle, tokens }: {
  item: RefCardItem;
  translationId: string;
  showTafsir: boolean;
  mainBadge: boolean;
  typeBadge: boolean;
  catTitle: string;
  tokens: Tokens;
}) {
  return (
    <View style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingHorizontal: 16, paddingTop: 15, paddingBottom: 14 }, tokens.cardShadow]}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 11 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 7 }}>
            <Text style={{ fontFamily: FONTS.serif[600], fontSize: 17, color: tokens.text }}>{item.title}</Text>
            {item.arName ? <Text style={{ fontFamily: FONTS.ar, fontSize: 16, color: tokens.text3 }}>{item.arName}</Text> : null}
            {typeBadge && item.type ? (
              <View style={{ backgroundColor: mix(tokens.brand, 12), borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ fontSize: 9.5, fontFamily: FONTS.sans[700], letterSpacing: 0.3, color: tokens.brand }}>{(TYPE_LABEL[item.type] ?? item.type).toUpperCase()}</Text>
              </View>
            ) : null}
            {item.severity === "major" ? (
              <View style={{ backgroundColor: mix(tokens.mecca, 16, tokens.surface2), borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ fontSize: 9.5, fontFamily: FONTS.sans[700], letterSpacing: 0.3, color: tokens.mecca }}>MAJOR</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[600], letterSpacing: 0.4, textTransform: "uppercase", color: tokens.text3, marginTop: 3 }}>
            {countAyahs(item.refs)} ayahs · {catTitle}
          </Text>
        </View>
      </View>

      <Text style={{ marginTop: 10, fontSize: 13, lineHeight: 20, color: tokens.text2 }}>{item.desc}</Text>
      {item.note ? <Text style={{ marginTop: 6, fontSize: 12, fontStyle: "italic", color: tokens.text3 }}>{item.note}</Text> : null}

      {item.tags && item.tags.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {item.tags.map((tg) => (
            <View key={tg} style={{ backgroundColor: tokens.surface2, borderWidth: 1, borderColor: tokens.lineSoft, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[600], color: tokens.text3 }}>{tg}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={{ height: 1, backgroundColor: tokens.lineSoft, marginTop: 13 }} />
      <AyahBlocks
        refs={item.refs}
        mainRefs={item.mainRefs}
        translationId={translationId}
        showTafsir={showTafsir}
        mainBadge={mainBadge}
        tokens={tokens}
      />
    </View>
  );
}

export function RefList() {
  const app = useApp();
  const { tokens } = app;
  const collection = app.refCollection ? COLLECTION_BY_ID[app.refCollection] : undefined;

  const [translationId, setTranslationId] = useState<string>("");
  const [cat, setCat] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [q, setQ] = useState("");

  // Resolve the translation edition for the app's current language (the globe in
  // the app bar changes it). Falls back to en.sahih if the lookup fails.
  useEffect(() => {
    let alive = true;
    translationIdForLanguage(app.language)
      .then((id) => { if (alive) setTranslationId(id || "en.sahih"); })
      .catch(() => { if (alive) setTranslationId("en.sahih"); });
    return () => { alive = false; };
  }, [app.language]);

  const catTitle = (id: string) => collection?.categories.find((c) => c.id === id)?.title ?? "";

  const shown = useMemo(() => {
    if (!collection) return [];
    const s = q.trim().toLowerCase();
    return collection.items
      .filter((it) => cat === "all" || it.category === cat)
      .filter((it) => type === "all" || it.type === type)
      .filter((it) =>
        !s ||
        it.title.toLowerCase().includes(s) ||
        it.desc.toLowerCase().includes(s) ||
        (it.arName ?? "").includes(q.trim()) ||
        catTitle(it.category).toLowerCase().includes(s) ||
        (it.type ?? "").toLowerCase().includes(s) ||
        (it.tags ?? []).some((tg) => tg.toLowerCase().includes(s)) ||
        it.refs.some((r) => r.includes(s)),
      );
  }, [collection, q, cat, type]);

  if (!collection) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: tokens.text3 }}>Nothing to show.</Text>
      </View>
    );
  }

  const catOptions = [{ value: "all", label: "All" }, ...collection.categories.map((c) => ({ value: c.id, label: c.title }))];
  const typeOptions = collection.typeFilter
    ? [{ value: "all", label: "All" }, ...collection.typeFilter.map((o) => ({ value: o.value as string, label: o.label }))]
    : null;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <SegLabel>{collection.eyebrow}</SegLabel>
      <BlockTitle style={{ marginTop: 8, marginBottom: 6 }}>{collection.title}</BlockTitle>
      <Text style={{ fontSize: 13.5, lineHeight: 21, color: tokens.text2, marginBottom: 12 }}>{collection.subtitle}</Text>

      <View style={{ flexDirection: "row", gap: 9, alignItems: "flex-start", marginBottom: 14 }}>
        <Icon name="info" size={15} color={tokens.brand2} />
        <Text style={{ flex: 1, fontSize: 11.5, lineHeight: 17.5, color: tokens.text3 }}>{collection.sourceNote}</Text>
      </View>

      <TrustNote tokens={tokens}>{REF_TRUST}</TrustNote>

      <View style={{ marginBottom: 12 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder={`Search ${collection.title.toLowerCase()}…`} small />
      </View>

      {typeOptions ? <FilterChips options={typeOptions} value={type} onChange={setType} tokens={tokens} /> : null}
      <FilterChips options={catOptions} value={cat} onChange={setCat} tokens={tokens} />

      {!translationId ? (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <ActivityIndicator color={tokens.brand} />
        </View>
      ) : shown.length === 0 ? (
        <Text style={{ fontSize: 13.5, color: tokens.text3, paddingVertical: 18 }}>No matching references.</Text>
      ) : (
        <View style={{ gap: 14 }}>
          {shown.map((it) => (
            <Card
              key={it.id}
              item={it}
              translationId={translationId}
              showTafsir={collection.showTafsir}
              mainBadge={!!collection.mainBadge}
              typeBadge={!!collection.typeBadge}
              catTitle={catTitle(it.category)}
              tokens={tokens}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
