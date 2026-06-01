import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useI18n } from "@/i18n/I18n";
import { useTheme } from "@/theme/ThemeContext";

/** Hub for the "More from Quran" reference pages. */
export function MoreHubScreen() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const nav = useNavigation<any>();

  const links: { route: string; label: string; emoji: string }[] = [
    { route: "ProphetStories", label: t("nav.prophetStories"), emoji: "👤" },
    { route: "Parables", label: t("nav.quranicParables"), emoji: "📜" },
    { route: "Commands", label: t("nav.commandsProhibitions"), emoji: "⚖️" },
    { route: "Warnings", label: t("nav.quranicWarnings"), emoji: "⚠️" },
    { route: "Character", label: t("nav.ethicalCharacterMap"), emoji: "🛡️" },
  ];

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      {links.map((l) => (
        <Pressable
          key={l.route}
          onPress={() => nav.navigate(l.route)}
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={styles.emoji}>{l.emoji}</Text>
          <Text style={[styles.label, { color: colors.text }]}>{l.label}</Text>
          <Text style={{ color: colors.textMuted }}>›</Text>
        </Pressable>
      ))}
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  emoji: { fontSize: 22 },
  label: { fontSize: 16, fontWeight: "600", flex: 1 },
  spacer: { height: 20 },
});
