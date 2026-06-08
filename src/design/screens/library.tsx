// Library — the mobile home for the "More from the Quran" reference collections
// (Quranic Duas, Prophet Stories, Parables, Commands & Prohibitions, Warnings,
// Ethical Character Map, Legal & Ruling References) plus About. Mirrors the web
// portal's "More" navigation; each entry opens a source-backed reference page.

import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "../AppText";
import { useApp } from "../AQContext";
import { BlockTitle, SegLabel } from "../atoms";
import { Icon, RawIcon } from "../Icon";
import { FONTS, mix } from "../tokens";
import { COLLECTION_BY_ID, type Collection } from "../refData";

// Two grouped menus, mirroring the web header's "Allah & Faith" / "Life Guidance"
// dropdowns (NavMore.tsx). Order matches the web FAITH_ITEMS / LIFE_ITEMS exactly.
const FAITH_IDS = [
  "names-of-allah", "allah-attributes", "worship-ibadah", "shirk",
  "tawakkul", "women-quran", "faith-not-lineage", "repentance", "hypocrisy",
  "day-of-judgment", "people-of-paradise", "people-of-hellfire",
  "signs-of-allah", "jinn-shaytan", "angels-quran", "heart-quran", "death-barzakh",
  "duas", "quranic-parables", "prophet-stories",
  "story-yusuf", "story-musa", "story-ibrahim", "people-cave",
];
const LIFE_IDS = [
  "commands-prohibitions", "marriage-family", "parents-relatives", "inheritance-wills",
  "riba-wealth", "charity-zakat", "crime-justice", "justice-testimony", "food-drink",
  "social-conduct", "relations-non-muslims", "brotherhood-community", "oaths-expiation",
  "ethical-character-map", "sabr-shukr", "knowledge-wisdom",
  "modesty-hijab", "arrogance-pride", "backbiting-slander",
];
// Book of Allah is a top-level destination on the web (a standalone header pill,
// not part of the Faith/Life dropdowns), so it gets its own Library tab too.
const BOOK_IDS = ["book-of-allah"];

type Group = "faith" | "life" | "book";

/** Title/subtitle resolution: keyed collections use i18n; names-of-allah carries
 *  its English source-of-truth strings on the collection itself. */
function collTitle(app: ReturnType<typeof useApp>, c: Collection): string {
  return c.kind === "names" ? c.title : app.t(`${c.ns}.title`);
}
function collSub(app: ReturnType<typeof useApp>, c: Collection): string {
  if (c.kind === "names") return c.subtitle;
  return app.t(c.kind === "ref" ? `${c.ns}.subtitle` : `${c.ns}.sub`);
}

function CollectionCard({ c }: { c: Collection }) {
  const app = useApp();
  const { tokens } = app;
  return (
    <Pressable
      onPress={() => app.openRef(c.id)}
      style={[{ flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 14 }, tokens.cardShadow]}
    >
      <View style={{ width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
        <RawIcon inner={c.icon} size={22} color={tokens.brand} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.serif[600], fontSize: 17, color: tokens.text }}>{collTitle(app, c)}</Text>
        <Text style={{ fontSize: 12, lineHeight: 17, color: tokens.text2, marginTop: 2 }}>{collSub(app, c)}</Text>
        <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[600], letterSpacing: 0.3, textTransform: "uppercase", color: tokens.text3, marginTop: 4 }}>{app.t("m.lib.entries", { n: c.items.length })}</Text>
      </View>
      <Icon name="chevR" size={17} color={tokens.text3} />
    </Pressable>
  );
}

export function Library() {
  const app = useApp();
  const { tokens } = app;
  const [group, setGroup] = useState<Group>("faith");

  const ids = group === "faith" ? FAITH_IDS : group === "life" ? LIFE_IDS : BOOK_IDS;
  const items = ids.map((id) => COLLECTION_BY_ID[id]).filter(Boolean) as Collection[];
  const tabs: { id: Group; label: string }[] = [
    { id: "faith", label: app.t("nav.faithMenu") },
    { id: "life", label: app.t("nav.lifeMenu") },
    { id: "book", label: app.t("nav.bookMenu") },
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <SegLabel>{app.t("m.lib.eyebrow")}</SegLabel>
      <BlockTitle style={{ marginTop: 8, marginBottom: 6 }}>{app.t("m.lib.title")}</BlockTitle>
      <Text style={{ fontSize: 13.5, lineHeight: 21, color: tokens.text2, marginBottom: 14 }}>
        {app.t(group === "faith" ? "m.lib.faithSub" : group === "life" ? "m.lib.lifeSub" : "m.lib.bookSub")}
      </Text>

      {/* segmented control: Allah & Faith / Life Guidance */}
      <View style={{ flexDirection: "row", gap: 8, backgroundColor: tokens.surface2, borderWidth: 1, borderColor: tokens.line, borderRadius: 13, padding: 4, marginBottom: 16 }}>
        {tabs.map((tb) => {
          const on = group === tb.id;
          return (
            <Pressable
              key={tb.id}
              onPress={() => setGroup(tb.id)}
              style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 9, borderRadius: 10, backgroundColor: on ? tokens.brand : "transparent" }}
            >
              <Text style={{ fontSize: 13, fontFamily: FONTS.sans[on ? 700 : 600], color: on ? tokens.onBrand : tokens.text2 }}>{tb.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: 11 }}>
        {items.map((c) => <CollectionCard key={c.id} c={c} />)}

        <Pressable
          onPress={app.openAbout}
          style={[{ flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 14, marginTop: 3 }, tokens.cardShadow]}
        >
          <View style={{ width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
            <Icon name="info" size={22} color={tokens.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.serif[600], fontSize: 17, color: tokens.text }}>{app.t("m.lib.aboutTitle")}</Text>
            <Text style={{ fontSize: 12, lineHeight: 17, color: tokens.text2, marginTop: 2 }}>{app.t("m.lib.aboutSub")}</Text>
          </View>
          <Icon name="chevR" size={17} color={tokens.text3} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

/* About — mirrors the web About page (about.* catalog keys). The quoted ayah
 * (2:2) Arabic + its translation are SOURCE TEXT and stay verbatim. */
export function About() {
  const app = useApp();
  const { tokens, t } = app;
  const includes: [string | null, string][] = [
    [null, "about.inc1s"], ["about.inc2b", "about.inc2s"], ["about.inc3b", "about.inc3s"],
    ["about.inc4b", "about.inc4s"], ["about.inc5b", "about.inc5s"], ["about.inc6b", "about.inc6s"],
  ];
  const does = ["about.does1", "about.does2", "about.does3", "about.does4"];
  const doesNot = ["about.doesNot1", "about.doesNot2", "about.doesNot3", "about.doesNot4"];
  const pledges: [string, string][] = [
    ["about.pledge1b", "about.pledge1s"], ["about.pledge2b", "about.pledge2s"],
    ["about.pledge3b", "about.pledge3s"], ["about.pledge4b", "about.pledge4s"],
  ];
  const Head = ({ label, head }: { label: string; head: string }) => (
    <View style={{ marginTop: 24, marginBottom: 10 }}>
      <SegLabel>{t(label)}</SegLabel>
      <BlockTitle style={{ marginTop: 8 }}>{t(head)}</BlockTitle>
    </View>
  );
  const P = ({ children }: { children: React.ReactNode }) => (
    <Text style={{ fontSize: 14, lineHeight: 23, color: tokens.text2, marginBottom: 10 }}>{children}</Text>
  );

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      {/* hero */}
      <SegLabel>{t("about.eyebrow")}</SegLabel>
      <BlockTitle style={{ marginTop: 8, marginBottom: 6, fontSize: 24 }}>{t("about.h1")}</BlockTitle>
      <Text style={{ fontSize: 14.5, lineHeight: 23, color: tokens.text2 }}>{t("about.lede")}</Text>

      {/* why */}
      <Head label="about.whyLabel" head="about.whyHead" />
      <P>{t("about.whyP1")}</P>
      <P>{t("about.whyP2")}</P>

      {/* ayah feature — SOURCE TEXT, verbatim */}
      <View style={[{ backgroundColor: mix(tokens.gold, 7, tokens.surface), borderWidth: 1, borderColor: mix(tokens.gold, 30, tokens.line), borderRadius: 16, paddingHorizontal: 18, paddingVertical: 18, marginTop: 6 }, tokens.cardShadow]}>
        <Text style={{ fontFamily: FONTS.ar, fontSize: 24, lineHeight: 46, color: tokens.arColor, textAlign: "center", writingDirection: "rtl" }}>ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ</Text>
        <View style={{ height: 1, backgroundColor: tokens.lineSoft, marginVertical: 12 }} />
        <Text style={{ fontFamily: FONTS.serif.italic, fontStyle: "italic", fontSize: 14, lineHeight: 22, color: tokens.text, textAlign: "center" }}>
          “This is the Book about which there is no doubt, a guidance for those conscious of Allah.”
        </Text>
        <Text style={{ fontSize: 11.5, fontFamily: FONTS.sans[600], color: tokens.text3, textAlign: "center", marginTop: 8 }}>Surah Al-Baqara · 2:2</Text>
      </View>

      <Text style={{ fontSize: 14, lineHeight: 23, color: tokens.text2, marginTop: 16 }}>
        {t("about.beliefLead")} <Text style={{ fontFamily: FONTS.sans[700], color: tokens.brand2 }}>{t("about.beliefHi")}</Text>
      </Text>

      {/* what */}
      <Head label="about.whatLabel" head="about.whatHead" />
      <P>{t("about.whatP1")}</P>
      <View style={{ marginTop: 6 }}><SegLabel>{t("about.includesLabel")}</SegLabel></View>
      <View style={{ gap: 9, marginTop: 10 }}>
        {includes.map(([b, s], i) => (
          <View key={s} style={[{ flexDirection: "row", alignItems: "flex-start", gap: 11, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 11 }, tokens.cardShadow]}>
            <View style={{ width: 24, height: 24, borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
              <Text style={{ fontSize: 12, fontFamily: FONTS.sans[700], color: tokens.brand }}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              {b ? <Text style={{ fontSize: 14, fontFamily: FONTS.sans[700], color: tokens.text }}>{t(b)}</Text>
                 : <Text style={{ fontFamily: FONTS.ar, fontSize: 18, color: tokens.arColor }}>اَلْآيَة</Text>}
              <Text style={{ fontSize: 12.5, lineHeight: 18, color: tokens.text2, marginTop: 2 }}>{t(s)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* where the line is — does / does not */}
      <Head label="about.lineLabel" head="about.lineHead" />
      <View style={{ gap: 11 }}>
        <View style={[{ backgroundColor: mix(tokens.brand, 6, tokens.surface), borderWidth: 1, borderColor: mix(tokens.brand, 22, tokens.line), borderRadius: 14, padding: 14 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 9 }}>
            <Icon name="check" size={16} w={2.6} color={tokens.brand} />
            <Text style={{ fontSize: 14, fontFamily: FONTS.sans[700], color: tokens.text }}>{t("about.doesTitle")}</Text>
          </View>
          {does.map((k) => (
            <View key={k} style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}>
              <Text style={{ color: tokens.brand }}>•</Text><Text style={{ flex: 1, fontSize: 13, lineHeight: 20, color: tokens.text2 }}>{t(k)}</Text>
            </View>
          ))}
        </View>
        <View style={[{ backgroundColor: mix(tokens.mecca, 7, tokens.surface), borderWidth: 1, borderColor: mix(tokens.mecca, 24, tokens.line), borderRadius: 14, padding: 14 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 9 }}>
            <Icon name="x" size={16} w={2.6} color={tokens.mecca} />
            <Text style={{ fontSize: 14, fontFamily: FONTS.sans[700], color: tokens.text }}>{t("about.doesNotTitle")}</Text>
          </View>
          {doesNot.map((k) => (
            <View key={k} style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}>
              <Text style={{ color: tokens.mecca }}>•</Text><Text style={{ flex: 1, fontSize: 13, lineHeight: 20, color: tokens.text2 }}>{t(k)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* sensitive */}
      <Head label="about.sensitiveLabel" head="about.sensitiveHead" />
      <P>{t("about.sensitiveP1")}</P>
      <View style={{ flexDirection: "row", gap: 11, alignItems: "flex-start", backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 14, padding: 13 }}>
        <Icon name="info" size={17} color={tokens.brand2} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13.5, fontFamily: FONTS.sans[700], color: tokens.text, marginBottom: 3 }}>{t("about.noteH3")}</Text>
          <Text style={{ fontSize: 12.5, lineHeight: 19, color: tokens.text2 }}>{t("about.noteP")}</Text>
        </View>
      </View>

      {/* commitments */}
      <Head label="about.commitLabel" head="about.commitHead" />
      <View style={{ gap: 10 }}>
        {pledges.map(([b, s]) => (
          <View key={b} style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 13 }, tokens.cardShadow]}>
            <Text style={{ fontFamily: FONTS.serif[600], fontSize: 15.5, color: tokens.text, marginBottom: 4 }}>{t(b)}</Text>
            <Text style={{ fontSize: 13, lineHeight: 20, color: tokens.text2 }}>{t(s)}</Text>
          </View>
        ))}
      </View>

      {/* closing */}
      <View style={{ alignItems: "center", marginTop: 28, paddingHorizontal: 8 }}>
        <SegLabel>{t("about.purposeLabel")}</SegLabel>
        <Text style={{ fontFamily: FONTS.serif.italic, fontStyle: "italic", fontSize: 15, lineHeight: 24, color: tokens.text, textAlign: "center", marginTop: 8 }}>
          {t("about.purposeLead")} <Text style={{ fontFamily: FONTS.sans[700], fontStyle: "normal", color: tokens.brand }}>{t("about.purposeHi")}</Text>
        </Text>
        <Pressable onPress={() => app.goTab("search")} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18, backgroundColor: tokens.brand, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 22 }}>
          <Icon name="search" size={17} w={2.4} color={tokens.onBrand} />
          <Text style={{ fontSize: 15, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>{t("about.cta")}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
