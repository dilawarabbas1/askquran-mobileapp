import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useI18n } from "@/i18n/I18n";
import { countAyahs } from "@/lib/refs";
import { useTheme } from "@/theme/ThemeContext";
import { AyahBlocks } from "./AyahBlocks";
import { TranslationControls } from "./TranslationControls";

export interface RefItem {
  id: string;
  title: string;
  category: string;
  refs: string[];
  tags?: string[];
  shortLabel: string;
  type?: string;
  severity?: string;
  mainRefs?: string[];
}

export interface RefItemsConfig {
  ns: string; // i18n prefix
  items: RefItem[];
  categories: { id: string; title: string }[];
  showTafsir?: boolean;
  mainBadge?: boolean;
  typeBadge?: boolean;
  typeFilter?: { options: { value: string; labelKey: string }[] };
}

const tagSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "");

export function RefItemsScreen({ cfg }: { cfg: RefItemsConfig }) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const [cat, setCat] = useState("all");
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const catTitle = (id: string) => cfg.categories.find((c) => c.id === id)?.title ?? "";
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return cfg.items
      .filter((it) => cat === "all" || it.category === cat)
      .filter((it) => type === "all" || it.type === type)
      .filter(
        (it) =>
          !s ||
          it.title.toLowerCase().includes(s) ||
          (it.type ?? "").toLowerCase().includes(s) ||
          catTitle(it.category).toLowerCase().includes(s) ||
          it.shortLabel.toLowerCase().includes(s) ||
          (it.tags ?? []).some((tg) => tg.toLowerCase().includes(s)) ||
          it.refs.some((r) => r.includes(s)),
      );
  }, [q, cat, type, cfg.items]);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <Text style={[styles.eyebrow, { color: colors.accent }]}>{t("nav.more")}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{t(`${cfg.ns}.title`)}</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>{t(`${cfg.ns}.subtitle`)}</Text>
      <View style={[styles.note, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>ℹ︎ {t(`${cfg.ns}.sourceNote`)}</Text>
      </View>

      <View style={{ marginVertical: 12 }}>
        <TranslationControls compact />
      </View>

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t("more.searchPlaceholder")}
        placeholderTextColor={colors.textMuted}
        style={[styles.search, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      {cfg.typeFilter && (
        <FilterRow
          options={[
            { value: "all", label: t("more.all") },
            ...cfg.typeFilter.options.map((o) => ({ value: o.value, label: t(o.labelKey) })),
          ]}
          value={type}
          onChange={setType}
        />
      )}
      <FilterRow
        options={[
          { value: "all", label: t("more.all") },
          ...cfg.categories.map((c) => ({ value: c.id, label: t(`${cfg.ns}.cat.${c.id}`) })),
        ]}
        value={cat}
        onChange={setCat}
      />

      {shown.length === 0 ? (
        <Text style={[styles.sub, { color: colors.textMuted, marginTop: 16 }]}>{t("more.noResults")}</Text>
      ) : (
        shown.map((it) => {
          const open = openId === it.id;
          return (
            <View key={it.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Pressable onPress={() => setOpenId(open ? null : it.id)}>
                <View style={styles.cardTop}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {t(`${cfg.ns}.i.${it.id}.title`)}
                  </Text>
                  <Text style={[styles.catChip, { backgroundColor: colors.accentSoft, color: colors.accent }]}>
                    {t(`${cfg.ns}.cat.${it.category}`)}
                  </Text>
                </View>
                <View style={styles.badgeRow}>
                  {cfg.typeBadge && it.type && (
                    <Text style={[styles.typeBadge, { borderColor: colors.border, color: colors.textMuted }]}>
                      {t(`more.${it.type}`)}
                    </Text>
                  )}
                  {it.severity === "major" && (
                    <Text style={[styles.typeBadge, { backgroundColor: colors.warn, color: "#fff" }]}>
                      {t("more.major")}
                    </Text>
                  )}
                  <Text style={[styles.cardCount, { color: colors.textMuted }]}>
                    {t("more.ayahCount", { n: countAyahs(it.refs) })}
                  </Text>
                </View>
                <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
                  {t(`${cfg.ns}.i.${it.id}.label`)}
                </Text>
                {it.tags && it.tags.length > 0 && (
                  <View style={styles.tags}>
                    {it.tags.map((tg) => (
                      <Text key={tg} style={[styles.tag, { borderColor: colors.border, color: colors.textMuted }]}>
                        {t(`more.tag.${tagSlug(tg)}`)}
                      </Text>
                    ))}
                  </View>
                )}
                <Text style={[styles.expand, { color: colors.accent }]}>
                  {open ? t("more.references") + " ▲" : t("more.references") + " ▼"}
                </Text>
              </Pressable>

              <AyahBlocks
                refs={it.refs}
                mainRefs={it.mainRefs}
                tafsir={!!cfg.showTafsir}
                mainBadge={!!cfg.mainBadge}
                enabled={open}
              />
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

function FilterRow({
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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
      <View style={styles.filterRow}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              style={[
                styles.mf,
                { borderColor: colors.border },
                on && { backgroundColor: colors.accentSoft, borderColor: colors.accent },
              ]}
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
  search: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  filterRow: { flexDirection: "row", gap: 8, paddingRight: 16 },
  mf: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 14 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: "700", flexShrink: 1 },
  catChip: { fontSize: 10, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: "hidden" },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" },
  typeBadge: { fontSize: 10, fontWeight: "700", borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, overflow: "hidden" },
  cardCount: { fontSize: 11 },
  cardDesc: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  tag: { fontSize: 11, borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  expand: { fontSize: 13, fontWeight: "700", marginTop: 12 },
});
