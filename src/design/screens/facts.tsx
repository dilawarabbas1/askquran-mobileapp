// Quran Facts screen with five segmented sub-tabs, ported from aq-facts.jsx:
// Structure, Surahs (real 114-surah metadata), Topics, Sajdah, Sources.

import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useApp } from "../AQContext";
import { BlockTitle, SegLabel } from "../atoms";
import { Icon, RawIcon } from "../Icon";
import { SearchBar } from "../SearchBar";
import { FACT_TOPICS, HIER, METRICS, SAJDAH, SAJDAH_SURAH, SOURCES, SURAHS } from "../data";
import { FONTS, mix, type Tokens } from "../tokens";

function refCount(refs: string[]): number {
  return refs.reduce((acc, r) => {
    if (r.includes("-")) {
      const [a, b] = r.split("-");
      const s1 = +a.split(":")[1];
      const s2 = +(b.split(":")[1] || s1);
      return acc + (s2 - s1 + 1);
    }
    return acc + 1;
  }, 0);
}

const FACT_TABS = [
  { id: "structure", label: "Structure", icon: "grid" },
  { id: "surahs", label: "Surahs", icon: "layers" },
  { id: "topics", label: "Topics", icon: "bookmark" },
  { id: "sajdah", label: "Sajdah", icon: "prostrate" },
  { id: "sources", label: "Sources", icon: "info" },
];

function TrustNote({ tokens, children }: { tokens: Tokens; children: React.ReactNode; }) {
  return (
    <View style={{ flexDirection: "row", gap: 11, alignItems: "flex-start", backgroundColor: mix(tokens.brand, 6, tokens.surface), borderWidth: 1, borderColor: mix(tokens.brand, 22, tokens.line), borderRadius: 14, padding: 13, marginBottom: 14 }}>
      <View style={{ width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 12) }}>
        <Icon name="shield" size={15} color={tokens.brand} />
      </View>
      <Text style={{ flex: 1, fontSize: 12, lineHeight: 18.6, color: tokens.text2 }}>{children}</Text>
    </View>
  );
}

function FactsStructure({ tokens }: { tokens: Tokens }) {
  return (
    <View>
      <SegLabel>At a glance</SegLabel>
      <BlockTitle style={{ marginTop: 8, marginBottom: 14 }}>Structure of the Quran</BlockTitle>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 11 }}>
        {METRICS.map((m, i) => (
          <View key={i} style={[{ width: "47.5%", overflow: "hidden", backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 15, paddingHorizontal: 15, paddingTop: 15, paddingBottom: 13 }, tokens.cardShadow]}>
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: tokens.brand, opacity: 0.85 }} />
            <View style={{ width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11), marginBottom: 10 }}>
              <RawIcon inner={m.ic} size={16} color={tokens.brand} />
            </View>
            <Text style={{ fontFamily: FONTS.serif[600], fontSize: 30, color: tokens.text }}>
              {m.n}{m.ar ? <Text style={{ fontFamily: FONTS.ar, fontSize: 17, color: tokens.orn }}>  {m.ar}</Text> : null}
            </Text>
            <Text style={{ marginTop: 6, fontSize: 13, fontFamily: FONTS.sans[700], color: tokens.text }}>{m.lbl}</Text>
            <Text style={{ marginTop: 2, fontSize: 11, lineHeight: 16, color: tokens.text2 }}>{m.desc}</Text>
          </View>
        ))}
      </View>
      <Text style={{ fontSize: 11, fontFamily: FONTS.sans[700], letterSpacing: 1.3, textTransform: "uppercase", color: tokens.text3, marginTop: 24, marginBottom: 11, marginHorizontal: 2 }}>Hierarchy</Text>
      <View style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 15, paddingHorizontal: 13 }, tokens.cardShadow]}>
        {HIER.map((h, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: i === HIER.length - 1 ? 0 : 1, borderBottomColor: tokens.lineSoft }}>
            <View style={{ width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 10) }}>
              <RawIcon inner={h.ic} size={15} color={tokens.brand} />
            </View>
            <Text style={{ fontSize: 14, fontFamily: FONTS.sans[700], color: tokens.text }}>
              {h.nm} <Text style={{ fontFamily: FONTS.ar, fontSize: 15, color: tokens.text2 }}>{h.ar}</Text>
            </Text>
            <Text style={{ marginLeft: "auto", fontSize: 12, color: tokens.text2, textAlign: "right" }}>{h.ds}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function FactsSurahs({ tokens }: { tokens: Tokens }) {
  const app = useApp();
  const [q, setQ] = useState("");
  const [place, setPlace] = useState<"all" | "Meccan" | "Medinan">("all");
  const S = SURAHS.map((r) => ({ num: r[0], ar: r[1], name: r[2], cnt: r[3], place: r[4] }));
  const t = q.trim().toLowerCase();
  const list = S.filter((s) => {
    if (place !== "all" && s.place !== place) return false;
    if (!t) return true;
    return s.name.toLowerCase().includes(t) || String(s.num) === t || s.ar.includes(t);
  });
  const shown = list.slice(0, 40);
  return (
    <View>
      <View style={{ marginBottom: 13 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder="Search surahs…" small />
      </View>
      <View style={{ flexDirection: "row", backgroundColor: tokens.surface2, borderWidth: 1, borderColor: tokens.line, borderRadius: 12, padding: 3, gap: 2, marginBottom: 13 }}>
        {([["all", "All"], ["Meccan", "Meccan"], ["Medinan", "Medinan"]] as const).map(([v, l]) => {
          const on = place === v;
          return (
            <Pressable key={v} onPress={() => setPlace(v)} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 7, borderRadius: 9, backgroundColor: on ? tokens.surface : "transparent" }}>
              {v !== "all" ? <View style={{ width: 7, height: 7, borderRadius: 2, backgroundColor: v === "Meccan" ? tokens.mecca : tokens.medina }} /> : null}
              <Text style={{ fontSize: 11.5, fontFamily: FONTS.sans[600], color: on ? tokens.text : tokens.text2 }}>{l}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 15, overflow: "hidden" }, tokens.cardShadow]}>
        {shown.map((s, i) => (
          <Pressable key={s.num} onPress={() => app.runSearch(s.name.replace(/^Al-|^An-|^Ar-|^As-|^At-/, ""))} style={{ flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: i === shown.length - 1 ? 0 : 1, borderBottomColor: tokens.lineSoft }}>
            <View style={{ width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 9) }}>
              <Text style={{ fontSize: 12, fontFamily: FONTS.sans[600], color: tokens.brand }}>{s.num}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontFamily: FONTS.sans[700], color: tokens.text }}>{s.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginTop: 1 }}>
                <Text style={{ fontSize: 11, fontFamily: FONTS.sans[700], color: s.place === "Meccan" ? tokens.mecca : tokens.medina }}>{s.place}</Text>
                <Text style={{ fontSize: 11, color: tokens.text3 }}>·</Text>
                <Text style={{ fontSize: 11, color: tokens.text3 }}>{s.cnt} ayahs</Text>
              </View>
            </View>
            <Text style={{ fontFamily: FONTS.ar, fontSize: 20, color: tokens.arColor }}>{s.ar}</Text>
          </Pressable>
        ))}
        <View style={{ paddingVertical: 11, paddingHorizontal: 15 }}>
          <Text style={{ fontSize: 11.5, color: tokens.text3, textAlign: "center" }}>
            {list.length > 40 ? <>Showing <Text style={{ color: tokens.text2 }}>40</Text> of {list.length} — scroll the full list in the app</> : <>Showing all <Text style={{ color: tokens.text2 }}>{list.length}</Text> surahs</>}
          </Text>
        </View>
      </View>
    </View>
  );
}

function FactsTopics({ tokens }: { tokens: Tokens }) {
  const app = useApp();
  return (
    <View>
      <TrustNote tokens={tokens}>
        <Text style={{ fontFamily: FONTS.sans[700], color: tokens.text }}>Quran-guided topics</Text> are anchored to ayah references only. Tap a reference to read it unchanged — no interpretive claims are added.
      </TrustNote>
      <View style={{ gap: 12 }}>
        {FACT_TOPICS.map((t) => (
          <View key={t.id} style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14 }, tokens.cardShadow]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
                <RawIcon inner={t.ic} size={20} color={tokens.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.serif[600], fontSize: 18, color: tokens.text }}>
                  {t.title} <Text style={{ fontFamily: FONTS.ar, fontSize: 15, color: tokens.text3 }}>{t.ar}</Text>
                </Text>
                <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[600], letterSpacing: 0.4, textTransform: "uppercase", color: tokens.text3, marginTop: 1 }}>
                  {refCount(t.refs)} ayahs · {t.refs.length} reference{t.refs.length > 1 ? "s" : ""}
                </Text>
              </View>
            </View>
            <Text style={{ marginTop: 11, fontSize: 13, lineHeight: 20, color: tokens.text2 }}>{t.desc}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
              {t.refs.map((r) => (
                <Pressable key={r} onPress={() => app.runSearch(t.title)} style={{ borderWidth: 1, borderColor: mix(tokens.brand, 24, tokens.line), backgroundColor: mix(tokens.brand, 8), borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ fontSize: 12, fontFamily: FONTS.sans[600], color: tokens.brand }}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function FactsSajdah({ tokens }: { tokens: Tokens }) {
  const [open, setOpen] = useState(false);
  const list = open ? SAJDAH : SAJDAH.slice(0, 9);
  return (
    <View>
      <TrustNote tokens={tokens}>
        <Text style={{ fontFamily: FONTS.sans[700], color: tokens.text }}>15 Sajdah ayahs</Text> are recorded in the Quran metadata. AskQuran lists the references only and does not explain their rulings here.
      </TrustNote>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {list.map((ref) => {
          const sn = SAJDAH_SURAH[+ref.split(":")[0]];
          return (
            <View key={ref} style={[{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 9 }, tokens.cardShadow]}>
              <Icon name="prostrate" size={15} color={tokens.mode === "dark" ? tokens.goldSoft : tokens.goldDeep} />
              <Text style={{ fontSize: 13, fontFamily: FONTS.sans[600], color: tokens.text }}>{ref}</Text>
              <Text style={{ fontSize: 11, color: tokens.text3 }}>{sn}</Text>
            </View>
          );
        })}
      </View>
      {!open ? (
        <Pressable onPress={() => setOpen(true)} style={{ marginTop: 16 }}>
          <Text style={{ color: tokens.brand2, fontFamily: FONTS.sans[700], fontSize: 14 }}>Show all 15 ▾</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function FactsSources({ tokens }: { tokens: Tokens }) {
  return (
    <View>
      <TrustNote tokens={tokens}>
        Every result is traceable to its source. Translations and tafsir are presented <Text style={{ fontFamily: FONTS.sans[700], color: tokens.text }}>unaltered</Text>, with no generated text.
      </TrustNote>
      <View style={{ gap: 11 }}>
        {SOURCES.map((s, i) => (
          <View key={i} style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 15, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14 }, tokens.cardShadow]}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 11 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
                <RawIcon inner={s.ic} size={19} color={tokens.brand} />
              </View>
              <Text style={{ flex: 1, fontFamily: FONTS.serif[600], fontSize: 16.5, color: tokens.text }}>{s.name}</Text>
            </View>
            <Text style={{ marginTop: 9, fontSize: 12.5, lineHeight: 19.4, color: tokens.text2 }}>{s.prov}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 13, paddingTop: 12, borderTopWidth: 1, borderTopColor: tokens.lineSoft }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: mix(tokens.brand, 10), borderWidth: 1, borderColor: mix(tokens.brand, 26), borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Icon name="check" size={12} w={2.4} color={tokens.brand} />
                <Text style={{ fontSize: 11, fontFamily: FONTS.sans[700], color: tokens.brand }}>{s.conf}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[700], color: tokens.brand2 }}>Learn more</Text>
                <Icon name="external" size={13} w={2} color={tokens.brand2} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function Facts() {
  const app = useApp();
  const { tokens } = app;
  const tab = app.factTab;
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 26 }} showsVerticalScrollIndicator={false}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16, flexGrow: 0 }} contentContainerStyle={{ backgroundColor: tokens.surface2, borderWidth: 1, borderColor: tokens.line, borderRadius: 13, padding: 3, gap: 3 }}>
        {FACT_TABS.map((t) => {
          const on = tab === t.id;
          return (
            <Pressable key={t.id} onPress={() => app.setFactTab(t.id)} style={{ flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 10, backgroundColor: on ? (tokens.mode === "dark" ? tokens.bg : tokens.surface) : "transparent" }}>
              <Icon name={t.icon} size={14} color={on ? tokens.brand : tokens.text2} />
              <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[600], color: on ? tokens.brand : tokens.text2 }}>{t.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {tab === "structure" ? <FactsStructure tokens={tokens} /> : null}
      {tab === "surahs" ? <FactsSurahs tokens={tokens} /> : null}
      {tab === "topics" ? <FactsTopics tokens={tokens} /> : null}
      {tab === "sajdah" ? <FactsSajdah tokens={tokens} /> : null}
      {tab === "sources" ? <FactsSources tokens={tokens} /> : null}
    </ScrollView>
  );
}
