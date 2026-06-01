import { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AyahChips } from "@/components/AyahChips";
import { useSearchBus } from "@/context/SearchBus";
import {
  AQ_MENTIONS,
  AQ_MUQATTAAT,
  AQ_PROPHETS,
  AQ_PUNISHMENT,
  AQ_SAJDAH,
  AQ_SURAHS,
  HIER,
  METRICS,
  QURAN_PLANTS,
  SOURCES,
  TOPIC_CATEGORIES,
  TOPICS,
  refAyahCount,
} from "@/data/quranFacts";
import { useI18n } from "@/i18n/I18n";
import { useTheme } from "@/theme/ThemeContext";

const TAB_IDS = ["structure", "surahs", "topics", "mentions", "punishment", "plants", "sources"] as const;
type TabId = (typeof TAB_IDS)[number];
const METRIC_KEYS = ["surahs", "ayahs", "juz", "hizb", "rub", "sajdah", "meccan", "medinan"];
const HIER_KEYS = ["quran", "surah", "ayah", "juz", "hizb", "rub"];
const SOURCE_KEYS = ["tanzilMeta", "tanzilOrder", "corpus", "qf"];
const MENTION_CATS = ["prophets", "nations", "angels", "scriptures", "places"] as const;

type Surah = { num: number; ar: string; name: string; cnt: number; place: string };
const SURAHS: Surah[] = (AQ_SURAHS as [number, string, string, number, string, number][]).map((r) => ({
  num: r[0],
  ar: r[1],
  name: r[2],
  cnt: r[3],
  place: r[4],
}));

export function FactsScreen() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const { requestSearch } = useSearchBus();
  const [tab, setTab] = useState<TabId>("structure");

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <Text style={[styles.eyebrow, { color: colors.accent }]}>{t("facts.eyebrow")}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{t("facts.title")}</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>{t("facts.sub")}</Text>
      <View style={[styles.note, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>ℹ︎ {t("facts.disclaimer")}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 14 }}>
        <View style={styles.tabs}>
          {TAB_IDS.map((id) => {
            const on = tab === id;
            return (
              <Pressable
                key={id}
                onPress={() => setTab(id)}
                style={[styles.tab, { borderColor: colors.border }, on && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              >
                <Text style={{ color: on ? "#fff" : colors.text, fontWeight: "600", fontSize: 13 }}>
                  {t(`facts.tab.${id}`)}
                  {id === "surahs" ? " · 114" : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {tab === "structure" && <StructureTab />}
      {tab === "surahs" && <SurahsTab onOpen={(n) => requestSearch(`${n}:1`)} />}
      {tab === "topics" && <TopicsTab />}
      {tab === "mentions" && <MentionsTab />}
      {tab === "punishment" && <PunishmentTab />}
      {tab === "plants" && <PlantsTab />}
      {tab === "sources" && <SourcesTab />}
    </ScrollView>
  );
}

/* ---------------------------------------------------------------- structure */
function StructureTab() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const { requestSearch } = useSearchBus();
  const meccan = SURAHS.filter((s) => s.place === "Meccan").length;
  const medinan = SURAHS.length - meccan;
  const metrics = [...METRICS, { n: String(meccan) }, { n: String(medinan) }];

  return (
    <View style={{ gap: 16 }}>
      <BlockHead title={t("facts.structure.glanceTitle")} sub={t("facts.structure.glanceSub")} />
      <View style={styles.metrics}>
        {metrics.map((m, i) => (
          <View key={i} style={[styles.metric, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.metricNum, { color: colors.primary }]}>{m.n}</Text>
            <Text style={[styles.metricLbl, { color: colors.text }]}>{t(`facts.metric.${METRIC_KEYS[i]}`)}</Text>
            <Text style={[styles.metricDesc, { color: colors.textMuted }]}>{t(`facts.metric.${METRIC_KEYS[i]}D`)}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardH, { color: colors.text }]}>
          {t("facts.structure.sajdahTitle")} · {AQ_SAJDAH.length}
        </Text>
        <Text style={[styles.cardSub, { color: colors.textMuted }]}>{t("facts.structure.sajdahDesc")}</Text>
        <View style={styles.chipWrap}>
          {AQ_SAJDAH.map((r) => (
            <Pressable key={r} onPress={() => requestSearch(r)} style={[styles.dataChip, { backgroundColor: colors.accentSoft }]}>
              <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 12 }}>{r}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardH, { color: colors.text }]}>
          {t("facts.structure.muqattaatTitle")} · {AQ_MUQATTAAT.length}
        </Text>
        <Text style={[styles.cardSub, { color: colors.textMuted }]}>{t("facts.structure.muqattaatDesc")}</Text>
        <View style={styles.chipWrap}>
          {(AQ_MUQATTAAT as [number, string, string][]).map((m) => (
            <Pressable key={m[0]} onPress={() => requestSearch(`${m[0]}:1`)} style={[styles.dataChip, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={{ color: colors.text, fontSize: 12 }}>
                {t(`facts.s.${m[0]}`)} <Text style={{ color: colors.textMuted }}>{m[1]}</Text>
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <BlockHead title={t("facts.structure.hierTitle")} sub={t("facts.structure.hierSub")} />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {HIER.map((h, i) => (
          <View key={i} style={[styles.hrow, { paddingLeft: h.lvl * 16 }]}>
            <Text style={[styles.hName, { color: colors.text }]}>
              {h.lvl > 0 ? "└─ " : ""}
              {t(`facts.hier.${HIER_KEYS[i]}`)} <Text style={{ color: colors.textMuted }}>{h.ar}</Text>
            </Text>
            <Text style={[styles.hDesc, { color: colors.textMuted }]}>{t(`facts.hier.${HIER_KEYS[i]}D`)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------- surahs */
function SurahsTab({ onOpen }: { onOpen: (n: number) => void }) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const [q, setQ] = useState("");
  const [place, setPlace] = useState<"all" | "Meccan" | "Medinan">("all");

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return SURAHS.filter(
      (su) =>
        (place === "all" || su.place === place) &&
        (!s || su.name.toLowerCase().includes(s) || String(su.num) === s || su.ar.includes(q.trim())),
    );
  }, [q, place]);

  return (
    <View style={{ gap: 12 }}>
      <BlockHead title={t("facts.tab.surahs")} sub={t("facts.surahs.sub")} />
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t("facts.surahs.search")}
        placeholderTextColor={colors.textMuted}
        style={[styles.search, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />
      <Filters
        options={[
          { value: "all", label: t("facts.surahs.all") },
          { value: "Meccan", label: t("facts.place.meccan") },
          { value: "Medinan", label: t("facts.place.medinan") },
        ]}
        value={place}
        onChange={(v) => setPlace(v as typeof place)}
      />
      {shown.map((s) => (
        <Pressable
          key={s.num}
          onPress={() => onOpen(s.num)}
          style={[styles.surahRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.surahNum, { backgroundColor: colors.primary }]}>{s.num}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.surahName, { color: colors.text }]}>{t(`facts.s.${s.num}`)}</Text>
            <Text style={[styles.surahMeta, { color: colors.textMuted }]}>
              {s.cnt} · {s.place === "Meccan" ? t("facts.place.meccan") : t("facts.place.medinan")}
            </Text>
          </View>
          <Text style={[styles.surahAr, { color: colors.textMuted }]}>{s.ar}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------- topics */
function TopicsTab() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return TOPICS.filter((tp) => cat === "all" || tp.cat === cat).filter(
      (tp) => !s || tp.title.toLowerCase().includes(s) || tp.desc.toLowerCase().includes(s) || tp.refs.some((r) => r.includes(s)),
    );
  }, [q, cat]);

  return (
    <View style={{ gap: 12 }}>
      <BlockHead title={t("facts.topics.title")} sub={t("facts.topics.sub")} />
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t("facts.topics.search")}
        placeholderTextColor={colors.textMuted}
        style={[styles.search, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />
      <Filters
        options={[{ value: "all", label: t("facts.topics.all") }, ...TOPIC_CATEGORIES.map((c) => ({ value: c.id, label: t(`facts.topicCat.${c.id}`) }))]}
        value={cat}
        onChange={setCat}
      />
      {shown.map((tp) => (
        <View key={tp.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardTop}>
            <Text style={[styles.cardH, { color: colors.text, flexShrink: 1 }]}>{t(`facts.topic.${tp.id}`)}</Text>
            <Text style={[styles.catChip, { backgroundColor: colors.accentSoft, color: colors.accent }]}>
              {t(`facts.topicCat.${tp.cat}`)}
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>{t(`facts.topic.${tp.id}D`)}</Text>
          <Text style={[styles.evLabel, { color: colors.textMuted }]}>{t("facts.topics.evidence")}</Text>
          <AyahChips refs={tp.refs} />
        </View>
      ))}
    </View>
  );
}

/* ----------------------------------------------------------------- mentions */
function MentionsTab() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const [cat, setCat] = useState<(typeof MENTION_CATS)[number]>("prophets");
  const [q, setQ] = useState("");
  const M = AQ_MENTIONS as unknown as Record<
    string,
    { name: string; refs: string[]; total?: number; forms?: (string | number)[][] }[]
  >;
  const prophets = AQ_PROPHETS as unknown as { n: string; ar: string; total: number }[];
  const prophetRefByName = new Map(M.prophets.map((p) => [p.name, p.refs]));
  const s = q.trim().toLowerCase();

  return (
    <View style={{ gap: 12 }}>
      <BlockHead title={t("facts.mentions.title")} sub={t("facts.mentions.intro")} />
      <Filters
        options={MENTION_CATS.map((id) => ({ value: id, label: t(`facts.cat.${id}`) }))}
        value={cat}
        onChange={(v) => {
          setCat(v as typeof cat);
          setQ("");
        }}
      />
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t("facts.mentions.searchCat")}
        placeholderTextColor={colors.textMuted}
        style={[styles.search, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      {cat === "prophets"
        ? prophets
            .map((p, pi) => ({ p, pi }))
            .filter(({ p }) => !s || p.n.toLowerCase().includes(s) || p.ar.includes(q.trim()))
            .map(({ p, pi }) => (
              <View key={p.n} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardH, { color: colors.text }]}>
                  {t(`facts.p.${pi}`)} <Text style={{ color: colors.textMuted }}>{p.ar}</Text>
                </Text>
                <Text style={[styles.cardSub, { color: colors.textMuted }]}>
                  {t("facts.mentions.directTotal")} {p.total}
                </Text>
                <Text style={[styles.evLabel, { color: colors.textMuted }]}>{t("facts.mentions.quranRefs")}</Text>
                <AyahChips refs={prophetRefByName.get(p.n) ?? []} />
              </View>
            ))
        : (M[cat] ?? [])
            .map((it, mi) => ({ it, mi }))
            .filter(({ it }) => !s || it.name.toLowerCase().includes(s))
            .map(({ it, mi }) => (
              <View key={it.name} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardH, { color: colors.text }]}>
                  {t(`facts.m.${cat}.${mi}`)}
                  {it.total != null ? ` · ${it.total} ${t("facts.mentions.mentions")}` : ""}
                </Text>
                {it.forms && it.forms.length > 0 && (
                  <View style={styles.chipWrap}>
                    {it.forms.map(([f, n]) => (
                      <Text key={String(f)} style={[styles.formChip, { backgroundColor: colors.surfaceAlt, color: colors.text }]}>
                        {f} · {n}
                      </Text>
                    ))}
                  </View>
                )}
                <Text style={[styles.evLabel, { color: colors.textMuted }]}>{t("facts.mentions.quranRefs")}</Text>
                <AyahChips refs={it.refs} />
              </View>
            ))}
    </View>
  );
}

/* --------------------------------------------------------------- punishment */
function PunishmentTab() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const groups = AQ_PUNISHMENT as unknown as {
    title: string;
    items: { name: string; refs: string[]; chips: string[] }[];
  }[];
  return (
    <View style={{ gap: 12 }}>
      <BlockHead title={t("facts.mentions.punishmentTitle")} sub={t("facts.mentions.punishmentSub")} />
      {groups.map((g, gi) => (
        <View key={g.title} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardH, { color: colors.text }]}>
            {gi + 1}. {t(`facts.dp.g.${gi}.t`)}
          </Text>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>{t(`facts.dp.g.${gi}.d`)}</Text>
          {g.items.map((it, ii) => (
            <View key={it.name} style={[styles.dpItem, { borderColor: colors.border }]}>
              <Text style={[styles.dpName, { color: colors.text }]}>{t(`facts.dp.i.${gi}.${ii}.n`)}</Text>
              <Text style={[styles.cardSub, { color: colors.textMuted }]}>{t(`facts.dp.i.${gi}.${ii}.s`)}</Text>
              <View style={styles.chipWrap}>
                {it.chips.map((c, ci) => (
                  <Text key={c} style={[styles.formChip, { backgroundColor: colors.surfaceAlt, color: colors.textMuted }]}>
                    {t(`facts.dp.i.${gi}.${ii}.c.${ci}`)}
                  </Text>
                ))}
              </View>
              <AyahChips refs={it.refs} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------- plants */
function PlantsTab() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<"all" | "fruits" | "trees" | "plantFoods">("all");
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return QURAN_PLANTS.filter((p) => group === "all" || p.group === group).filter(
      (p) => !s || p.name.toLowerCase().includes(s) || p.arabicTerms.some((a) => a.includes(q.trim())) || p.refs.some((r) => r.includes(s)),
    );
  }, [q, group]);

  return (
    <View style={{ gap: 12 }}>
      <BlockHead title={t("facts.plants.title")} sub={t("facts.plants.sub")} />
      <View style={[styles.note, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>ℹ︎ {t("facts.plants.sourceNote")}</Text>
      </View>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t("facts.plants.search")}
        placeholderTextColor={colors.textMuted}
        style={[styles.search, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />
      <Filters
        options={(["all", "fruits", "trees", "plantFoods"] as const).map((g) => ({ value: g, label: t(`facts.plants.${g}`) }))}
        value={group}
        onChange={(v) => setGroup(v as typeof group)}
      />
      {shown.length === 0 ? (
        <Text style={[styles.cardSub, { color: colors.textMuted }]}>{t("facts.plants.noResults")}</Text>
      ) : (
        shown.map((p) => (
          <View key={p.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardTop}>
              <Text style={[styles.cardH, { color: colors.text, flexShrink: 1 }]}>{t(`facts.plant.${p.id}`)}</Text>
              <Text style={[styles.catChip, { backgroundColor: colors.accentSoft, color: colors.accent }]}>
                {t(`facts.plants.${p.group}`)}
              </Text>
            </View>
            <Text style={[styles.evLabel, { color: colors.textMuted }]}>{t("facts.plants.terms")}</Text>
            <Text style={[styles.plTerms, { color: colors.text }]}>{p.arabicTerms.join("، ")}</Text>
            {p.note && (
              <Text style={[styles.cardSub, { color: colors.textMuted }]}>
                {t("facts.plants.note")}: {t(`facts.plant.${p.id}N`)}
              </Text>
            )}
            <Text style={[styles.evLabel, { color: colors.textMuted }]}>{t("facts.topics.evidence")}</Text>
            <AyahChips refs={p.refs} />
          </View>
        ))
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ sources */
function SourcesTab() {
  const { t } = useI18n();
  const { colors } = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <BlockHead title={t("facts.sources.integrityTitle")} sub={t("facts.sources.integritySub")} />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <Text style={[styles.dpName, { color: colors.text }]}>{t(`facts.integrity.${i}.t`)}</Text>
            <Text style={[styles.cardSub, { color: colors.textMuted }]}>{t(`facts.integrity.${i}.d`)}</Text>
          </View>
        ))}
      </View>

      <BlockHead title={t("facts.sources.metadataTitle")} sub={t("facts.sources.metadataSub")} />
      {SOURCES.map((s, i) => (
        <View key={s.name} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardH, { color: colors.text }]}>{t(`facts.source.${SOURCE_KEYS[i]}`)}</Text>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>{t(`facts.source.${SOURCE_KEYS[i]}D`)}</Text>
          <Pressable onPress={() => Linking.openURL(s.url)}>
            <Text style={[styles.link, { color: colors.accent }]}>{t("facts.sources.visit")} ↗</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

/* -------------------------------------------------------------------- atoms */
function BlockHead({ title, sub }: { title: string; sub: string }) {
  const { colors } = useTheme();
  return (
    <View>
      <Text style={[styles.blockTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.cardSub, { color: colors.textMuted }]}>{sub}</Text>
    </View>
  );
}

function Filters({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.filterRow}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              style={[styles.mf, { borderColor: colors.border }, on && { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}
            >
              <Text style={{ color: on ? colors.accent : colors.textMuted, fontSize: 13 }}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  eyebrow: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 },
  title: { fontSize: 26, fontWeight: "800", marginTop: 4 },
  sub: { fontSize: 14, lineHeight: 21, marginTop: 6 },
  note: { borderRadius: 10, padding: 10, marginTop: 10 },
  tabs: { flexDirection: "row", gap: 8, paddingRight: 16 },
  tab: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  blockTitle: { fontSize: 18, fontWeight: "700" },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: { borderWidth: 1, borderRadius: 12, padding: 12, width: "47%" },
  metricNum: { fontSize: 22, fontWeight: "800" },
  metricLbl: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  metricDesc: { fontSize: 11, marginTop: 2 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  cardH: { fontSize: 16, fontWeight: "700" },
  cardSub: { fontSize: 13, lineHeight: 20, marginTop: 4 },
  catChip: { fontSize: 10, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: "hidden" },
  evLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, marginTop: 10 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  dataChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  formChip: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: "hidden" },
  hrow: { paddingVertical: 6 },
  hName: { fontSize: 15, fontWeight: "600" },
  hDesc: { fontSize: 12, marginTop: 2 },
  search: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  filterRow: { flexDirection: "row", gap: 8, paddingRight: 16, paddingVertical: 2 },
  mf: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  surahRow: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 12, padding: 12 },
  surahNum: { color: "#fff", fontSize: 12, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, overflow: "hidden" },
  surahName: { fontSize: 15, fontWeight: "700" },
  surahMeta: { fontSize: 12, marginTop: 2 },
  surahAr: { fontSize: 18 },
  dpItem: { borderTopWidth: 1, marginTop: 10, paddingTop: 10 },
  dpName: { fontSize: 14, fontWeight: "700" },
  plTerms: { fontSize: 18, textAlign: "right", writingDirection: "rtl", marginTop: 4 },
  link: { fontSize: 14, fontWeight: "700", marginTop: 10 },
});
