// Quran Facts — full parity with the web's 9-tab nav: Structure, Surahs,
// Topics, Mentions (Prophets · Nations · Angels · Scriptures · Places),
// Divine Punishment, Plants, Animals, Natural Signs, Sources. All content is
// source-backed reference data; ayah chips run a search (verbatim text loads
// from the backend). Ported from the web QuranFacts component + quranFacts data.

import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useApp } from "../AQContext";
import { BlockTitle } from "../atoms";
import { Icon, RawIcon } from "../Icon";
import { SearchBar } from "../SearchBar";
import { SURAHS } from "../data";
import {
  METRICS, HIER, SOURCES, INTEGRITY, SAJDAH, MUQATTAAT, SURAH_NAME,
  TOPICS, TOPIC_CATEGORIES, MENTIONS, MENTION_CATS, PROPHETS,
  PUNISHMENT, PUNISHMENT_FILTERS, PLANTS, PLANT_GROUPS, ANIMALS, ANIMAL_GROUPS,
  NATURAL_SIGNS, SIGN_GROUPS, refAyahCount, type QuranTermMention,
} from "../factsData";
import { FONTS, mix, type Tokens } from "../tokens";

/* ---------- tab + content icons (inner SVG, via RawIcon) ---------- */
const IC: Record<string, string> = {
  structure: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1.2" fill="currentColor"/><circle cx="3.5" cy="12" r="1.2" fill="currentColor"/><circle cx="3.5" cy="18" r="1.2" fill="currentColor"/>',
  topics: '<path d="M9 3v15l-3-2-3 2V3z"/><path d="M14 5h7M14 10h7M14 15h5"/>',
  mentions: '<path d="M21 11.5a8.5 8.5 0 0 1-11.8 7.8L4 21l1.7-5.2A8.5 8.5 0 1 1 21 11.5z"/>',
  punishment: '<path d="M12 3l9 16H3z"/><line x1="12" y1="9" x2="12" y2="14"/><circle cx="12" cy="16.6" r="0.7" fill="currentColor" stroke="none"/>',
  leaf: '<path d="M11 21c-4 0-7-3-7-7 0-6 6-10 16-10 0 10-4 16-9 17z"/><path d="M8.5 16.5C11 13 14 11 18 10"/>',
  animals: '<path d="M4.5 13.5a2 2 0 1 0 0-.01"/><path d="M9 9a2 2 0 1 0 0-.01"/><path d="M15 9a2 2 0 1 0 0-.01"/><path d="M19.5 13.5a2 2 0 1 0 0-.01"/><path d="M12 13c-2.5 0-4.5 2-4.5 4 0 1.7 1.5 2.5 4.5 2.5s4.5-.8 4.5-2.5c0-2-2-4-4.5-4z"/>',
  signs: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="7" y2="7"/><line x1="17" y1="17" x2="19" y2="19"/><line x1="5" y1="19" x2="7" y2="17"/><line x1="17" y1="7" x2="19" y2="5"/>',
  shield: '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>',
  person: '<circle cx="12" cy="8" r="3.4"/><path d="M5 21v-1.5a7 7 0 0 1 14 0V21"/>',
};

const FACT_TABS: { id: string; label: string; icon: string; badge?: string }[] = [
  { id: "structure", label: "Structure", icon: IC.structure },
  { id: "surahs", label: "Surahs", icon: IC.list, badge: "114" },
  { id: "topics", label: "Topics", icon: IC.topics },
  { id: "mentions", label: "Mentions", icon: IC.mentions },
  { id: "punishment", label: "Divine Punishment", icon: IC.punishment },
  { id: "plants", label: "Plants", icon: IC.leaf },
  { id: "animals", label: "Animals", icon: IC.animals },
  { id: "naturalSigns", label: "Natural Signs", icon: IC.signs },
  { id: "sources", label: "Sources", icon: IC.shield },
];

/* ---------- shared bits ---------- */
function Chips({ refs, tokens }: { refs: string[]; tokens: Tokens }) {
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

function Pills({ options, value, onChange, tokens }: { options: { id: string; title: string }[]; value: string; onChange: (v: string) => void; tokens: Tokens }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 12 }} contentContainerStyle={{ gap: 7, paddingRight: 8 }}>
      {options.map((o) => {
        const on = value === o.id;
        return (
          <Pressable key={o.id} onPress={() => onChange(o.id)} style={{ paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: on ? tokens.brand : tokens.line, backgroundColor: on ? mix(tokens.brand, 12) : tokens.surface2 }}>
            <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[600], color: on ? tokens.brand : tokens.text2 }}>{o.title}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

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

function SrcNote({ tokens, children }: { tokens: Tokens; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", gap: 9, alignItems: "flex-start", marginBottom: 14 }}>
      <Icon name="info" size={15} color={tokens.brand2} />
      <Text style={{ flex: 1, fontSize: 11.5, lineHeight: 17.5, color: tokens.text3 }}>{children}</Text>
    </View>
  );
}

function BlockHead({ title, sub, tokens }: { title: string; sub?: string; tokens: Tokens }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <BlockTitle>{title}</BlockTitle>
      {sub ? <Text style={{ fontSize: 13, lineHeight: 20, color: tokens.text2, marginTop: 4 }}>{sub}</Text> : null}
    </View>
  );
}

/* ---------- STRUCTURE ---------- */
function FactsStructure({ tokens }: { tokens: Tokens }) {
  const app = useApp();
  const meccan = SURAHS.filter((s) => s[4] === "Meccan").length;
  const medinan = SURAHS.length - meccan;
  const longest = SURAHS.reduce((a, b) => (b[3] > a[3] ? b : a));
  const shortest = SURAHS.reduce((a, b) => (b[3] < a[3] ? b : a));
  const metrics = [
    ...METRICS,
    { n: String(meccan), ar: "", lbl: "Meccan Surahs", desc: "Revealed in the Meccan period" },
    { n: String(medinan), ar: "", lbl: "Medinan Surahs", desc: "Revealed in the Medinan period" },
  ];
  const statCards: { s: typeof SURAHS[number]; k: string }[] = [
    { s: longest, k: "Longest surah" },
    { s: shortest, k: "Shortest surah" },
  ];
  return (
    <View>
      <BlockHead title="At a glance" sub="The structural divisions of the Quran, from Tanzil metadata." tokens={tokens} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 11 }}>
        {metrics.map((m, i) => (
          <View key={i} style={[{ width: "47.5%", overflow: "hidden", backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 15, paddingHorizontal: 15, paddingTop: 15, paddingBottom: 13 }, tokens.cardShadow]}>
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: tokens.brand, opacity: 0.85 }} />
            <Text style={{ fontFamily: FONTS.serif[600], fontSize: 30, color: tokens.text }}>
              {m.n}{m.ar ? <Text style={{ fontFamily: FONTS.ar, fontSize: 17, color: tokens.orn }}>  {m.ar}</Text> : null}
            </Text>
            <Text style={{ marginTop: 6, fontSize: 13, fontFamily: FONTS.sans[700], color: tokens.text }}>{m.lbl}</Text>
            <Text style={{ marginTop: 2, fontSize: 11, lineHeight: 16, color: tokens.text2 }}>{m.desc}</Text>
          </View>
        ))}
      </View>

      {/* longest / shortest */}
      <View style={{ flexDirection: "row", gap: 11, marginTop: 14 }}>
        {statCards.map(({ s, k }) => {
          const meta = SURAH_NAME.get(s[0]);
          return (
            <Pressable key={k} onPress={() => app.runSearch(`${s[0]}:1`)} style={[{ flex: 1, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 15, padding: 14 }, tokens.cardShadow]}>
              <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[700], letterSpacing: 0.5, textTransform: "uppercase", color: tokens.text3 }}>{k}</Text>
              <Text style={{ fontFamily: FONTS.serif[600], fontSize: 17, color: tokens.text, marginTop: 4 }}>
                {meta?.name} <Text style={{ fontFamily: FONTS.ar, fontSize: 15, color: tokens.orn }}>{s[1]}</Text>
              </Text>
              <Text style={{ fontSize: 12, color: tokens.text2, marginTop: 2 }}><Text style={{ fontFamily: FONTS.sans[700], color: tokens.text }}>{s[3]}</Text> ayahs · Surah {s[0]}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Sajdah (folded into Structure, like web) */}
      <Text style={{ fontSize: 11, fontFamily: FONTS.sans[700], letterSpacing: 1.3, textTransform: "uppercase", color: tokens.text3, marginTop: 24, marginBottom: 11, marginHorizontal: 2 }}>
        Sajdah ayahs · {SAJDAH.length}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {SAJDAH.map((ref) => (
          <SajdahChip key={ref} refKey={ref} tokens={tokens} />
        ))}
      </View>

      {/* Muqatta'at */}
      <Text style={{ fontSize: 11, fontFamily: FONTS.sans[700], letterSpacing: 1.3, textTransform: "uppercase", color: tokens.text3, marginTop: 24, marginBottom: 11, marginHorizontal: 2 }}>
        Disjoint letters · {MUQATTAAT.length} surahs
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {MUQATTAAT.map((m) => (
          <MuqChip key={`${m[0]}-${m[1]}`} num={m[0]} ar={m[1]} tr={m[2]} tokens={tokens} />
        ))}
      </View>

      {/* hierarchy */}
      <Text style={{ fontSize: 11, fontFamily: FONTS.sans[700], letterSpacing: 1.3, textTransform: "uppercase", color: tokens.text3, marginTop: 24, marginBottom: 11, marginHorizontal: 2 }}>Hierarchy</Text>
      <View style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 15, paddingHorizontal: 13 }, tokens.cardShadow]}>
        {HIER.map((h, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: i === HIER.length - 1 ? 0 : 1, borderBottomColor: tokens.lineSoft }}>
            <View style={{ width: h.lvl * 14 }} />
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

function SajdahChip({ refKey, tokens }: { refKey: string; tokens: Tokens }) {
  const app = useApp();
  const sn = SURAH_NAME.get(+refKey.split(":")[0]);
  return (
    <Pressable onPress={() => app.runSearch(refKey)} style={[{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 9 }, tokens.cardShadow]}>
      <Icon name="prostrate" size={15} color={tokens.mode === "dark" ? tokens.goldSoft : tokens.goldDeep} />
      <Text style={{ fontSize: 13, fontFamily: FONTS.sans[600], color: tokens.text }}>{refKey}</Text>
      <Text style={{ fontSize: 11, color: tokens.text3 }}>{sn?.name}</Text>
    </Pressable>
  );
}

function MuqChip({ num, ar, tr, tokens }: { num: number; ar: string; tr: string; tokens: Tokens }) {
  const app = useApp();
  const sn = SURAH_NAME.get(num);
  return (
    <Pressable onPress={() => app.runSearch(`${num}:1`)} style={[{ width: "47.5%", flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }, tokens.cardShadow]}>
      <Text style={{ fontFamily: FONTS.ar, fontSize: 20, color: tokens.orn }}>{ar}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[700], color: tokens.text }}>{sn?.name}</Text>
        <Text style={{ fontSize: 10.5, color: tokens.text3 }}>{tr}</Text>
      </View>
    </Pressable>
  );
}

/* ---------- SURAHS ---------- */
function FactsSurahs({ tokens }: { tokens: Tokens }) {
  const app = useApp();
  const [q, setQ] = useState("");
  const [place, setPlace] = useState<"all" | "Meccan" | "Medinan">("all");
  const S = SURAHS.map((r) => ({ num: r[0], ar: r[1], name: r[2], cnt: r[3], place: r[4] }));
  const t = q.trim().toLowerCase();
  const list = S.filter((s) => {
    if (place !== "all" && s.place !== place) return false;
    if (!t) return true;
    return s.name.toLowerCase().includes(t) || String(s.num) === t || s.ar.includes(q.trim());
  });
  return (
    <View>
      <View style={{ marginBottom: 13 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder={app.t("recite.searchSurahs")} small />
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
        {list.map((s, i) => (
          <Pressable key={s.num} onPress={() => app.runSearch(`${s.num}:1`)} style={{ flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: i === list.length - 1 ? 0 : 1, borderBottomColor: tokens.lineSoft }}>
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
      </View>
      <Text style={{ fontSize: 11.5, color: tokens.text3, textAlign: "center", marginTop: 11 }}>
        {list.length === 114 ? "All 114 surahs · Tanzil metadata" : `${list.length} of 114 surahs`}
      </Text>
    </View>
  );
}

/* ---------- generic reference card (topics / plants / animals / signs) ---------- */
function TermCard({ title, count, chip, terms, note, refs, icon, tokens }: {
  title: string; count: string; chip?: string; terms?: string[]; note?: string; refs: string[]; icon: string; tokens: Tokens;
}) {
  return (
    <View style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingHorizontal: 16, paddingTop: 15, paddingBottom: 14 }, tokens.cardShadow]}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 11 }}>
        <View style={{ width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
          <RawIcon inner={icon} size={20} color={tokens.brand} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONTS.serif[600], fontSize: 16.5, color: tokens.text }}>{title}</Text>
          <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[600], letterSpacing: 0.4, textTransform: "uppercase", color: tokens.text3, marginTop: 2 }}>{count}</Text>
        </View>
        {chip ? (
          <View style={{ backgroundColor: mix(tokens.brand, 10), borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[600], color: tokens.brand }}>{chip}</Text>
          </View>
        ) : null}
      </View>
      {terms && terms.length ? (
        <Text style={{ fontFamily: FONTS.ar, fontSize: 18, color: tokens.arColor, textAlign: "right", writingDirection: "rtl", marginTop: 10 }}>{terms.join("، ")}</Text>
      ) : null}
      {note ? <Text style={{ marginTop: 8, fontSize: 12, lineHeight: 18, color: tokens.text2 }}>{note}</Text> : null}
      <Text style={{ fontSize: 10, fontFamily: FONTS.sans[700], letterSpacing: 0.5, textTransform: "uppercase", color: tokens.text3, marginTop: 12, marginBottom: 7 }}>References</Text>
      <Chips refs={refs} tokens={tokens} />
    </View>
  );
}

/* ---------- TOPICS ---------- */
function FactsTopics({ tokens }: { tokens: Tokens }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const catTitle = (id: string) => TOPIC_CATEGORIES.find((c) => c.id === id)?.title ?? "";
  const s = q.trim().toLowerCase();
  const shown = TOPICS.filter((tp) => cat === "all" || tp.cat === cat).filter(
    (tp) => !s || tp.title.toLowerCase().includes(s) || tp.desc.toLowerCase().includes(s) || catTitle(tp.cat).toLowerCase().includes(s) || tp.refs.some((r) => r.includes(s)),
  );
  return (
    <View>
      <BlockHead title="Quran-guided topics" sub="Each topic is anchored to ayah references only — tap a reference to read it unchanged." tokens={tokens} />
      <TrustNote tokens={tokens}>Topics are anchored to ayah references. No interpretive or generated claims are added.</TrustNote>
      <View style={{ marginBottom: 12 }}><SearchBar value={q} onChangeText={setQ} placeholder="Search topics…" small /></View>
      <Pills options={[{ id: "all", title: "All" }, ...TOPIC_CATEGORIES]} value={cat} onChange={setCat} tokens={tokens} />
      <View style={{ gap: 12 }}>
        {shown.map((tp) => (
          <TermCard key={tp.id} title={tp.title} count={`${refAyahCount(tp.refs)} ayahs · ${tp.refs.length} reference${tp.refs.length > 1 ? "s" : ""}`} chip={catTitle(tp.cat)} note={tp.desc} refs={tp.refs} icon={IC.topics} tokens={tokens} />
        ))}
      </View>
    </View>
  );
}

/* ---------- MENTIONS (second-level sub-tabs) ---------- */
function FactsMentions({ tokens }: { tokens: Tokens }) {
  const [cat, setCat] = useState("prophets");
  const [q, setQ] = useState("");
  const mq = q.trim().toLowerCase();

  return (
    <View>
      <BlockHead title="Quran Mentions" sub="Who and what the Quran names — by direct ayah reference." tokens={tokens} />
      <Pills options={MENTION_CATS} value={cat} onChange={(v) => { setCat(v); setQ(""); }} tokens={tokens} />
      <View style={{ marginBottom: 14 }}><SearchBar value={q} onChangeText={setQ} placeholder={`Search ${MENTION_CATS.find((c) => c.id === cat)?.title.toLowerCase()}…`} small /></View>

      {cat === "prophets" ? (
        <View style={{ gap: 12 }}>
          {PROPHETS.filter((p) => !mq || p.n.toLowerCase().includes(mq) || p.ar.includes(q.trim())).map((p) => {
            const refs = MENTIONS.prophets.find((m) => m.name === p.n)?.refs ?? [];
            return (
              <View key={p.n} style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingHorizontal: 16, paddingTop: 15, paddingBottom: 14 }, tokens.cardShadow]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
                  <View style={{ width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
                    <RawIcon inner={IC.person} size={20} color={tokens.brand} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONTS.serif[600], fontSize: 17, color: tokens.text }}>
                      {p.n} <Text style={{ fontFamily: FONTS.ar, fontSize: 16, color: tokens.orn }}>{p.ar}</Text>
                    </Text>
                    <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[600], textTransform: "uppercase", letterSpacing: 0.4, color: tokens.text3, marginTop: 1 }}>Prophet · {p.total} direct mentions</Text>
                  </View>
                </View>
                {refs.length ? (
                  <>
                    <Text style={{ fontSize: 10, fontFamily: FONTS.sans[700], letterSpacing: 0.5, textTransform: "uppercase", color: tokens.text3, marginTop: 12, marginBottom: 7 }}>Quran references</Text>
                    <Chips refs={refs} tokens={tokens} />
                  </>
                ) : null}
                <View style={{ marginTop: 12, gap: 5 }}>
                  {p.direct.map(([form, n], i) => (
                    <View key={i} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text style={{ fontFamily: FONTS.ar, fontSize: 16, color: tokens.text }}>{form}</Text>
                      <Text style={{ fontSize: 12, fontFamily: FONTS.sans[700], color: tokens.text2 }}>{n}</Text>
                    </View>
                  ))}
                  {p.related.length ? <Text style={{ fontSize: 10, fontFamily: FONTS.sans[700], letterSpacing: 0.4, textTransform: "uppercase", color: tokens.text3, marginTop: 4 }}>Related forms</Text> : null}
                  {p.related.map(([form, n, kind], i) => (
                    <View key={`r${i}`} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <Text style={{ fontFamily: FONTS.ar, fontSize: 15, color: tokens.text2 }}>{form}</Text>
                      <Text style={{ flex: 1, fontSize: 10.5, color: tokens.text3, textAlign: "right" }}>{kind}</Text>
                      <Text style={{ fontSize: 12, fontFamily: FONTS.sans[700], color: tokens.text2 }}>{n}</Text>
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: tokens.lineSoft }}>
                  <Icon name="check" size={13} w={2.4} color={tokens.brand} />
                  <Text style={{ fontSize: 11.5, fontFamily: FONTS.sans[600], color: tokens.brand }}>Verified from the Quran text</Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {(MENTIONS[cat] ?? []).filter((it) => !mq || it.name.toLowerCase().includes(mq)).map((it) => (
            <View key={it.name} style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingHorizontal: 16, paddingTop: 15, paddingBottom: 14 }, tokens.cardShadow]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
                  <RawIcon inner={IC.mentions} size={18} color={tokens.brand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.serif[600], fontSize: 16, color: tokens.text }}>{it.name}</Text>
                  {it.total != null ? <Text style={{ fontSize: 11, color: tokens.text3, marginTop: 1 }}>{it.totalLabel ?? `${it.total} mentions`}</Text> : null}
                </View>
              </View>
              {it.forms && it.forms.length ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 11 }}>
                  {it.forms.map(([f, n]) => (
                    <View key={f} style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: tokens.surface2, borderWidth: 1, borderColor: tokens.lineSoft, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 }}>
                      <Text style={{ fontFamily: FONTS.ar, fontSize: 15, color: tokens.text }}>{f}</Text>
                      <Text style={{ fontSize: 11, fontFamily: FONTS.sans[700], color: tokens.brand2 }}>{n}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              <Text style={{ fontSize: 10, fontFamily: FONTS.sans[700], letterSpacing: 0.5, textTransform: "uppercase", color: tokens.text3, marginTop: 12, marginBottom: 7 }}>Quran references</Text>
              <Chips refs={it.refs} tokens={tokens} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/* ---------- DIVINE PUNISHMENT ---------- */
function FactsPunishment({ tokens }: { tokens: Tokens }) {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<Set<number>>(() => new Set(PUNISHMENT.map((_, i) => i)));
  const toggle = (i: number) => setOpen((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  return (
    <View>
      <BlockHead title="Divine Punishment" sub="Quran-backed reasons, then the communities under each — references only, no speculation." tokens={tokens} />
      <Pills options={PUNISHMENT_FILTERS} value={filter} onChange={setFilter} tokens={tokens} />
      <View style={{ gap: 12 }}>
        {PUNISHMENT.map((g, gi) => {
          const items = g.items.filter((it) => filter === "all" || it.tags.includes(filter));
          if (!items.length) return null;
          const isOpen = open.has(gi);
          return (
            <View key={g.title} style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, overflow: "hidden" }, tokens.cardShadow]}>
              <Pressable onPress={() => toggle(gi)} style={{ flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 15, paddingVertical: 13 }}>
                <View style={{ width: 26, height: 26, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 12) }}>
                  <Text style={{ fontSize: 12, fontFamily: FONTS.sans[700], color: tokens.brand }}>{gi + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.serif[600], fontSize: 15.5, color: tokens.text }}>{g.title}</Text>
                  <Text style={{ fontSize: 11.5, color: tokens.text3, marginTop: 1 }}>{items.length} {items.length === 1 ? "community" : "communities"}</Text>
                </View>
                <Icon name={isOpen ? "chevDown" : "chevR"} size={16} color={tokens.text3} />
              </Pressable>
              {isOpen ? (
                <View style={{ paddingHorizontal: 15, paddingBottom: 14, gap: 11 }}>
                  <Text style={{ fontSize: 12.5, lineHeight: 19, color: tokens.text2 }}>{g.desc}</Text>
                  {items.map((it) => (
                    <View key={it.name} style={{ backgroundColor: tokens.surface2, borderWidth: 1, borderColor: tokens.lineSoft, borderRadius: 12, padding: 12 }}>
                      <Text style={{ fontFamily: FONTS.sans[700], fontSize: 14, color: tokens.text }}>{it.name}</Text>
                      <Text style={{ fontSize: 12.5, lineHeight: 19, color: tokens.text2, marginTop: 4 }}>{it.summary}</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
                        {it.chips.map((c) => (
                          <View key={c} style={{ backgroundColor: mix(tokens.gold, 12, tokens.surface), borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 }}>
                            <Text style={{ fontSize: 10.5, fontFamily: FONTS.sans[600], color: tokens.mode === "dark" ? tokens.goldSoft : tokens.goldDeep }}>{c}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={{ fontSize: 10, fontFamily: FONTS.sans[700], letterSpacing: 0.5, textTransform: "uppercase", color: tokens.text3, marginTop: 11, marginBottom: 7 }}>Quran references</Text>
                      <Chips refs={it.refs} tokens={tokens} />
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

/* ---------- PLANTS / ANIMALS / NATURAL SIGNS ---------- */
function TermTab({ title, sub, sourceNote, groups, items, icon, groupTitle, tokens }: {
  title: string; sub: string; sourceNote: string; groups: { id: string; title: string }[];
  items: QuranTermMention[]; icon: string; groupTitle: (id: string) => string; tokens: Tokens;
}) {
  const [group, setGroup] = useState("all");
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();
  const shown = items.filter((it) => group === "all" || it.group === group).filter(
    (it) => !s || it.name.toLowerCase().includes(s) || it.group.toLowerCase().includes(s) || (it.note ?? "").toLowerCase().includes(s) || it.arabicTerms.some((a) => a.includes(q.trim())) || it.refs.some((r) => r.includes(s)),
  );
  return (
    <View>
      <BlockHead title={title} sub={sub} tokens={tokens} />
      <SrcNote tokens={tokens}>{sourceNote}</SrcNote>
      <View style={{ marginBottom: 12 }}><SearchBar value={q} onChangeText={setQ} placeholder={`Search ${title.toLowerCase()}…`} small /></View>
      <Pills options={groups} value={group} onChange={setGroup} tokens={tokens} />
      {shown.length === 0 ? (
        <Text style={{ fontSize: 13.5, color: tokens.text3, paddingVertical: 16 }}>No matching entries.</Text>
      ) : (
        <View style={{ gap: 12 }}>
          {shown.map((it) => (
            <TermCard key={it.id} title={it.name} count={`${it.refs.length} reference${it.refs.length > 1 ? "s" : ""}`} chip={groupTitle(it.group)} terms={it.arabicTerms} note={it.note} refs={it.refs} icon={icon} tokens={tokens} />
          ))}
        </View>
      )}
    </View>
  );
}

/* ---------- SOURCES ---------- */
function FactsSources({ tokens }: { tokens: Tokens }) {
  return (
    <View>
      <BlockHead title="Source integrity" sub="How AskQuran handles the text it shows." tokens={tokens} />
      <View style={{ gap: 11, marginBottom: 22 }}>
        {INTEGRITY.map((p, i) => (
          <View key={i} style={[{ flexDirection: "row", gap: 11, alignItems: "flex-start", backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 14, padding: 13 }, tokens.cardShadow]}>
            <View style={{ width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
              <Icon name="check" size={16} w={2.3} color={tokens.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.sans[700], fontSize: 14, color: tokens.text }}>{p.t}</Text>
              <Text style={{ fontSize: 12.5, lineHeight: 19, color: tokens.text2, marginTop: 2 }}>{p.d}</Text>
            </View>
          </View>
        ))}
      </View>
      <BlockHead title="Metadata sources" sub="The external references behind the structural data." tokens={tokens} />
      <View style={{ gap: 11 }}>
        {SOURCES.map((s) => (
          <View key={s.name} style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 15, paddingHorizontal: 16, paddingTop: 15, paddingBottom: 13 }, tokens.cardShadow]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
                <RawIcon inner={IC.shield} size={18} color={tokens.brand} />
              </View>
              <Text style={{ flex: 1, fontFamily: FONTS.serif[600], fontSize: 16, color: tokens.text }}>{s.name}</Text>
            </View>
            <Text style={{ marginTop: 9, fontSize: 12.5, lineHeight: 19.4, color: tokens.text2 }}>{s.prov}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: tokens.lineSoft }}>
              <Icon name="check" size={12} w={2.4} color={tokens.brand} />
              <Text style={{ fontSize: 11, fontFamily: FONTS.sans[700], color: tokens.brand }}>Structural metadata</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------- root ---------- */
export function Facts() {
  const app = useApp();
  const { tokens } = app;
  const tab = app.factTab;
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16, flexGrow: 0 }} contentContainerStyle={{ gap: 7, paddingRight: 8 }}>
        {FACT_TABS.map((t) => {
          const on = tab === t.id;
          return (
            <Pressable key={t.id} onPress={() => app.setFactTab(t.id)} style={{ flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: on ? tokens.brand : tokens.line, backgroundColor: on ? mix(tokens.brand, 12) : tokens.surface2 }}>
              <RawIcon inner={t.icon} size={14} color={on ? tokens.brand : tokens.text2} />
              <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[600], color: on ? tokens.brand : tokens.text2 }}>{t.label}</Text>
              {t.badge ? (
                <View style={{ backgroundColor: on ? tokens.brand : mix(tokens.brand, 14), borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1 }}>
                  <Text style={{ fontSize: 9.5, fontFamily: FONTS.sans[700], color: on ? tokens.onBrand : tokens.brand }}>{t.badge}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {tab === "structure" ? <FactsStructure tokens={tokens} /> : null}
      {tab === "surahs" ? <FactsSurahs tokens={tokens} /> : null}
      {tab === "topics" ? <FactsTopics tokens={tokens} /> : null}
      {tab === "mentions" ? <FactsMentions tokens={tokens} /> : null}
      {tab === "punishment" ? <FactsPunishment tokens={tokens} /> : null}
      {tab === "plants" ? (
        <TermTab title="Fruits, Trees & Plants" sub="Plants the Quran names, by direct Arabic term." sourceNote="Direct term matches in the Quran text — no botanical, health, or symbolic claims." groups={PLANT_GROUPS} items={PLANTS} icon={IC.leaf} groupTitle={(id) => PLANT_GROUPS.find((g) => g.id === id)?.title ?? id} tokens={tokens} />
      ) : null}
      {tab === "animals" ? (
        <TermTab title="Animals & Insects" sub="Creatures the Quran mentions, by direct Arabic term." sourceNote="Factual mentions only — no classification, symbolism, or miracle claims." groups={ANIMAL_GROUPS} items={ANIMALS} icon={IC.animals} groupTitle={(id) => ANIMAL_GROUPS.find((g) => g.id === id)?.title ?? id} tokens={tokens} />
      ) : null}
      {tab === "naturalSigns" ? (
        <TermTab title="Natural Signs" sub="Created signs and phenomena the Quran references." sourceNote="A reference index — no modern scientific explanation or interpretation is added." groups={SIGN_GROUPS} items={NATURAL_SIGNS} icon={IC.signs} groupTitle={(id) => SIGN_GROUPS.find((g) => g.id === id)?.title ?? id} tokens={tokens} />
      ) : null}
      {tab === "sources" ? <FactsSources tokens={tokens} /> : null}
    </ScrollView>
  );
}
