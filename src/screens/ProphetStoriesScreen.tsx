import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AyahBlocks } from "@/components/AyahBlocks";
import { TranslationControls } from "@/components/TranslationControls";
import { PROPHET_CATEGORIES, PROPHET_STORIES } from "@/data/prophetStories";
import { useI18n } from "@/i18n/I18n";
import { useTheme } from "@/theme/ThemeContext";

/** Prophet Stories — Quran passage references for each prophet, shown with
 *  verbatim Arabic and translation. Names/summaries are localised; ayah text is
 *  never stored here (fetched verbatim from the backend). */
export function ProphetStoriesScreen() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return PROPHET_STORIES.filter((p) => cat === "all" || p.category === cat).filter(
      (p) =>
        !s ||
        p.prophet.toLowerCase().includes(s) ||
        p.arabicName.includes(s) ||
        p.summary.toLowerCase().includes(s) ||
        p.refs.some((r) => r.includes(s)),
    );
  }, [q, cat]);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <Text style={[styles.eyebrow, { color: colors.accent }]}>{t("prophet.eyebrow")}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{t("prophet.title")}</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>{t("prophet.sub")}</Text>
      <View style={[styles.note, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>ℹ︎ {t("prophet.disclaimer")}</Text>
      </View>

      <View style={{ marginVertical: 12 }}>
        <TranslationControls compact />
      </View>

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t("prophet.search")}
        placeholderTextColor={colors.textMuted}
        style={[styles.search, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
        <View style={styles.filterRow}>
          {[{ id: "all", title: t("prophet.all") }, ...PROPHET_CATEGORIES.map((c) => ({ id: c.id, title: t(`prophet.cat.${c.id}`) }))].map(
            (c) => {
              const on = c.id === cat;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCat(c.id)}
                  style={[styles.mf, { borderColor: colors.border }, on && { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}
                >
                  <Text style={{ color: on ? colors.accent : colors.textMuted, fontSize: 13 }}>{c.title}</Text>
                </Pressable>
              );
            },
          )}
        </View>
      </ScrollView>

      {shown.length === 0 ? (
        <Text style={[styles.sub, { color: colors.textMuted, marginTop: 16 }]}>{t("prophet.none")}</Text>
      ) : (
        shown.map((p) => {
          const open = openId === p.id;
          return (
            <View key={p.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Pressable onPress={() => setOpenId(open ? null : p.id)}>
                <View style={styles.cardTop}>
                  <View style={{ flexShrink: 1 }}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{t(`prophet.p.${p.id}.name`)}</Text>
                    <Text style={[styles.arName, { color: colors.textMuted }]}>{p.arabicName}</Text>
                  </View>
                  <Text style={[styles.catChip, { backgroundColor: colors.accentSoft, color: colors.accent }]}>
                    {t(`prophet.cat.${p.category}`)}
                  </Text>
                </View>
                <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{t(`prophet.p.${p.id}.summary`)}</Text>
                <Text style={[styles.expand, { color: colors.accent }]}>
                  {open ? t("prophet.hidePassage") + " ▲" : t("more.references") + " ▼"}
                </Text>
              </Pressable>
              <AyahBlocks refs={p.refs} enabled={open} />
            </View>
          );
        })
      )}
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
  cardTitle: { fontSize: 16, fontWeight: "700" },
  arName: { fontSize: 16, marginTop: 2 },
  catChip: { fontSize: 10, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: "hidden" },
  cardDesc: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  expand: { fontSize: 13, fontWeight: "700", marginTop: 12 },
});
