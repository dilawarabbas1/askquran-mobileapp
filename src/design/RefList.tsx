// Shared reference-page UI for the mobile Library — the mobile counterpart of
// the web's RefItemsPage. Renders a collection of Quran-backed reference cards
// (Duas, Prophet Stories, Parables, Commands & Prohibitions, Warnings, Ethical
// Character, Legal Rulings). Each card lazily loads its verbatim Arabic +
// translation from the backend (GET /api/verses) when expanded, and stored
// tafsir on demand (?tafsir=1). Nothing is generated; all text is source-backed.

import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Text } from "./AppText";
import { useApp } from "./AQContext";
import { BlockTitle, SegLabel } from "./atoms";
import { Icon } from "./Icon";
import { SearchBar } from "./SearchBar";
import { FONTS, mix, type Tokens } from "./tokens";
import { countAyahs } from "./lib/refs";
import { COLLECTION_BY_ID, type RefCardItem } from "./refData";
import { translationIdForLanguage } from "@/api";

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

function Card({ item, title, desc, note, typeLabel, catTitle, showTafsir, mainBadge, typeBadge, tokens }: {
  item: RefCardItem;
  title: string;
  desc: string;
  note?: string;
  typeLabel?: string;
  catTitle: string;
  showTafsir: boolean;
  mainBadge: boolean;
  typeBadge: boolean;
  tokens: Tokens;
}) {
  const app = useApp();
  const { t } = app;
  return (
    <View style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingHorizontal: 16, paddingTop: 15, paddingBottom: 14 }, tokens.cardShadow]}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 11 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 7 }}>
            <Text style={{ fontFamily: FONTS.serif[600], fontSize: 17, color: tokens.text }}>{title}</Text>
            {item.arName ? <Text style={{ fontFamily: FONTS.ar, fontSize: 16, color: tokens.text3 }}>{item.arName}</Text> : null}
            {typeBadge && item.type && typeLabel ? (
              <View style={{ backgroundColor: mix(tokens.brand, 12), borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ fontSize: 9.5, fontFamily: FONTS.sans[700], letterSpacing: 0.3, color: tokens.brand }}>{typeLabel.toUpperCase()}</Text>
              </View>
            ) : null}
            {item.severity === "major" ? (
              <View style={{ backgroundColor: mix(tokens.mecca, 16, tokens.surface2), borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ fontSize: 9.5, fontFamily: FONTS.sans[700], letterSpacing: 0.3, color: tokens.mecca }}>{t("more.major")}</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[600], letterSpacing: 0.4, textTransform: "uppercase", color: tokens.text3, marginTop: 3 }}>
            {t("more.ayahCount", { n: countAyahs(item.refs) })}{catTitle ? ` · ${catTitle}` : ""}
          </Text>
        </View>
      </View>

      <Text style={{ marginTop: 10, fontSize: 13, lineHeight: 20, color: tokens.text2 }}>{desc}</Text>
      {note ? <Text style={{ marginTop: 6, fontSize: 12, fontStyle: "italic", color: tokens.text3 }}>{note}</Text> : null}

      {item.tags && item.tags.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {item.tags.map((tg) => (
            <View key={tg} style={{ backgroundColor: tokens.surface2, borderWidth: 1, borderColor: tokens.lineSoft, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[600], color: tokens.text3 }}>{t(`more.tag.${tg.toLowerCase().replace(/[^a-z0-9]+/g, "")}`)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={{ height: 1, backgroundColor: tokens.lineSoft, marginTop: 13 }} />
      <Pressable
        onPress={() => app.openPassage({ refs: item.refs, mainRefs: item.mainRefs, title, subtitle: desc, showTafsir, mainBadge })}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 13, paddingVertical: 11, borderRadius: 11, borderWidth: 1, borderColor: mix(tokens.brand, 26, tokens.line), backgroundColor: mix(tokens.brand, 9) }}
      >
        <Icon name="recite" size={16} w={2.1} color={tokens.brand} />
        <Text style={{ fontSize: 13.5, fontFamily: FONTS.sans[700], color: tokens.brand }}>{t("m.readPassage")}</Text>
      </Pressable>
    </View>
  );
}

/* Compact Asma al-Husna tile — rendered two-per-row in the names grid. Mirrors
   the web NamesOfAllah `name-card`: number, Arabic, transliteration, meaning,
   and verse-reference chips (hadith-only names show their source instead). */
function NameTile({ item, no, tokens }: { item: RefCardItem; no: number; tokens: Tokens }) {
  const app = useApp();
  const hadith = item.refs.length === 0;
  return (
    <View
      style={[
        { width: "48.5%", backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 13, alignItems: "center" },
        tokens.cardShadow,
      ]}
    >
      <Text style={{ fontSize: 10, fontFamily: FONTS.sans[700], color: tokens.text3, letterSpacing: 0.5 }}>
        {String(no).padStart(2, "0")}
      </Text>
      <Text style={{ fontFamily: FONTS.ar, fontSize: 24, lineHeight: 40, color: tokens.arColor, textAlign: "center", writingDirection: "rtl", marginTop: 2 }}>
        {item.arName}
      </Text>
      <Text style={{ fontFamily: FONTS.serif[600], fontSize: 14.5, color: tokens.text, textAlign: "center", marginTop: 4 }}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 11.5, lineHeight: 16, color: tokens.text2, textAlign: "center", marginTop: 3 }}>
        {app.t(`names.i.${item.id}.label`)}
      </Text>
      <View style={{ width: "100%", alignItems: "center", marginTop: 9 }}>
        {hadith ? (
          <View style={{ backgroundColor: mix(tokens.gold, 12, tokens.surface2), borderWidth: 1, borderColor: mix(tokens.gold, 28, tokens.line), borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
            <Text style={{ fontSize: 9.5, fontFamily: FONTS.sans[600], color: tokens.text3 }}>{item.note}</Text>
          </View>
        ) : (
          /* Each verse reference is individually tappable and runs an Ayah
             search (consistent with refs everywhere else, e.g. facts Chips). */
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
            {item.refs.map((r) => (
              <Pressable
                key={r}
                onPress={() => app.runSearch(r)}
                style={{ borderWidth: 1, borderColor: mix(tokens.brand, 26, tokens.line), backgroundColor: mix(tokens.brand, 9), borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 }}
              >
                <Text style={{ fontSize: 11.5, fontFamily: FONTS.sans[600], color: tokens.brand }}>{r}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
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

  // Per-collection catalog key shapes (duas/prophet use bespoke keys; the rest
  // share the ns.i.<id>.title/.label "ref" shape).
  const ns = collection.ns;
  const kind = collection.kind;
  // "names" (Asma al-Husna) carries no i18n keys — its strings are the English
  // source-of-truth stored on each item, mirroring the web NamesOfAllah grid.
  const names = kind === "names";
  const itemTitleKey = (id: string) => (kind === "duas" ? `duas.d.${id}.t` : kind === "prophet" ? `prophet.p.${id}.name` : `${ns}.i.${id}.title`);
  const itemDescKey = (id: string) => (kind === "duas" ? `duas.d.${id}.c` : kind === "prophet" ? `prophet.p.${id}.summary` : `${ns}.i.${id}.label`);
  const headTitle = names ? app.t("names.title") : app.t(`${ns}.title`);
  const headSub = names ? app.t("names.sub") : app.t(kind === "ref" ? `${ns}.subtitle` : `${ns}.sub`);
  const headSource = names ? app.t("names.sourceNote") : app.t(kind === "ref" ? `${ns}.sourceNote` : `${ns}.disclaimer`);
  const headEyebrow = names ? app.t("names.eyebrow") : kind === "ref" ? app.t("nav.more") : app.t(`${ns}.eyebrow`);
  const trustText = kind === "ref" || names ? app.t("more.trust") : app.t(`${ns}.trust`);
  const catLabel = (id: string) => app.t(`${ns}.cat.${id}`);

  const catOptions = [{ value: "all", label: app.t("more.all") }, ...collection.categories.map((c) => ({ value: c.id, label: catLabel(c.id) }))];
  const typeOptions = collection.typeFilter
    ? [{ value: "all", label: app.t("more.all") }, ...collection.typeFilter.map((o) => ({ value: o.value as string, label: app.t(`more.${o.value}`) }))]
    : null;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <SegLabel>{headEyebrow}</SegLabel>
      <BlockTitle style={{ marginTop: 8, marginBottom: 6 }}>{headTitle}</BlockTitle>
      <Text style={{ fontSize: 13.5, lineHeight: 21, color: tokens.text2, marginBottom: 12 }}>{headSub}</Text>

      <View style={{ flexDirection: "row", gap: 9, alignItems: "flex-start", marginBottom: 14 }}>
        <Icon name="info" size={15} color={tokens.brand2} />
        <Text style={{ flex: 1, fontSize: 11.5, lineHeight: 17.5, color: tokens.text3 }}>{headSource}</Text>
      </View>

      <TrustNote tokens={tokens}>{trustText}</TrustNote>

      <View style={{ marginBottom: 12 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder={app.t("more.searchPlaceholder")} small />
      </View>

      {typeOptions ? <FilterChips options={typeOptions} value={type} onChange={setType} tokens={tokens} /> : null}
      {collection.categories.length ? <FilterChips options={catOptions} value={cat} onChange={setCat} tokens={tokens} /> : null}

      {!translationId ? (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <ActivityIndicator color={tokens.brand} />
        </View>
      ) : shown.length === 0 ? (
        <Text style={{ fontSize: 13.5, color: tokens.text3, paddingVertical: 18 }}>{app.t("more.noResults")}</Text>
      ) : collection.namesGrid ? (
        // Asma al-Husna — two names per row (mirrors the web NamesOfAllah grid).
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 }}>
          {shown.map((it) => (
            <NameTile key={it.id} item={it} no={collection.items.indexOf(it) + 1} tokens={tokens} />
          ))}
        </View>
      ) : (
        <View style={{ gap: 14 }}>
          {shown.map((it) => (
            <Card
              key={it.id}
              item={it}
              title={names ? it.title : app.t(itemTitleKey(it.id))}
              desc={names ? it.desc : app.t(itemDescKey(it.id))}
              note={it.note ? (kind === "prophet" ? app.t(`prophet.p.${it.id}.note`) : it.note) : undefined}
              typeLabel={it.type ? app.t(`more.${it.type}`) : undefined}
              showTafsir={collection.showTafsir}
              mainBadge={!!collection.mainBadge}
              typeBadge={!!collection.typeBadge}
              catTitle={catLabel(it.category)}
              tokens={tokens}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
