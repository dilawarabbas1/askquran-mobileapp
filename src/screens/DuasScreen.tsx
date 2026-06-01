import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AyahBlocks } from "@/components/AyahBlocks";
import { TranslationControls } from "@/components/TranslationControls";
import { DUA_CATEGORIES, DUAS } from "@/data/quranicDuas";
import { useI18n } from "@/i18n/I18n";
import { useTheme } from "@/theme/ThemeContext";

/** Quranic Duas — only supplications present directly in the Quran, each
 *  anchored to ayah references rendered verbatim from the backend. */
export function DuasScreen() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const [duaCat, setDuaCat] = useState("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const catTitle = (id: string) => DUA_CATEGORIES.find((c) => c.id === id)?.title ?? "";
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return DUAS.filter((d) => duaCat === "all" || d.category === duaCat).filter(
      (d) =>
        !s ||
        d.title.toLowerCase().includes(s) ||
        d.context.toLowerCase().includes(s) ||
        catTitle(d.category).toLowerCase().includes(s) ||
        d.refs.some((r) => r.includes(s)),
    );
  }, [q, duaCat]);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <Text style={[styles.eyebrow, { color: colors.accent }]}>{t("duas.eyebrow")}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{t("duas.title")}</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>{t("duas.sub")}</Text>
      <View style={[styles.note, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>ℹ︎ {t("duas.disclaimer")}</Text>
      </View>

      <View style={{ marginVertical: 12 }}>
        <TranslationControls compact />
      </View>

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t("duas.search")}
        placeholderTextColor={colors.textMuted}
        style={[styles.search, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
        <View style={styles.filterRow}>
          {[{ id: "all", title: t("duas.all") }, ...DUA_CATEGORIES.map((c) => ({ id: c.id, title: t(`duas.cat.${c.id}`) }))].map(
            (c) => {
              const on = c.id === duaCat;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setDuaCat(c.id)}
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
        <Text style={[styles.sub, { color: colors.textMuted, marginTop: 16 }]}>{t("duas.none")}</Text>
      ) : (
        shown.map((d) => {
          const open = openId === d.id;
          return (
            <View key={d.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Pressable onPress={() => setOpenId(open ? null : d.id)}>
                <View style={styles.cardTop}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{t(`duas.d.${d.id}.t`)}</Text>
                  <Text style={[styles.catChip, { backgroundColor: colors.accentSoft, color: colors.accent }]}>
                    {t(`duas.cat.${d.category}`)}
                  </Text>
                </View>
                <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{t(`duas.d.${d.id}.c`)}</Text>
                <Text style={[styles.expand, { color: colors.accent }]}>
                  {t("duas.reference")} {open ? "▲" : "▼"}
                </Text>
              </Pressable>
              <AyahBlocks refs={d.refs} tafsir enabled={open} />
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
  cardTitle: { fontSize: 16, fontWeight: "700", flexShrink: 1 },
  catChip: { fontSize: 10, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: "hidden" },
  cardDesc: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  expand: { fontSize: 13, fontWeight: "700", marginTop: 12 },
});
