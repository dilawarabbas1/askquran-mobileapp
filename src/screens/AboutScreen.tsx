import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useI18n } from "@/i18n/I18n";
import { useTheme } from "@/theme/ThemeContext";

/** About / No-Generation policy page. All copy comes from the i18n catalogs. */
export function AboutScreen() {
  const { t } = useI18n();
  const { colors } = useTheme();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.h2, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
  const P = ({ children }: { children: React.ReactNode }) => (
    <Text style={[styles.p, { color: colors.textMuted }]}>{children}</Text>
  );
  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.bulletRow}>
      <Text style={{ color: colors.accent }}>•</Text>
      <Text style={[styles.p, { color: colors.textMuted, flex: 1 }]}>{children}</Text>
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <Text style={[styles.eyebrow, { color: colors.accent }]}>{t("about.eyebrow")}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{t("about.h1")}</Text>
      <Text style={[styles.lede, { color: colors.textMuted }]}>{t("about.lede")}</Text>

      <Section title={t("about.whatHead")}>
        <P>{t("about.whatP1")}</P>
      </Section>

      <Section title={t("about.doesTitle")}>
        {[1, 2, 3, 4].map((i) => (
          <Bullet key={i}>{t(`about.does${i}`)}</Bullet>
        ))}
      </Section>

      <Section title={t("about.doesNotTitle")}>
        {[1, 2, 3, 4].map((i) => (
          <Bullet key={i}>{t(`about.doesNot${i}`)}</Bullet>
        ))}
      </Section>

      <Section title={t("about.includesLabel")}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={{ marginBottom: 8 }}>
            <Text style={[styles.incB, { color: colors.text }]}>{t(`about.inc${i}b`)}</Text>
            <Text style={[styles.p, { color: colors.textMuted }]}>{t(`about.inc${i}s`)}</Text>
          </View>
        ))}
      </Section>

      <Section title={t("about.commitHead")}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ marginBottom: 8 }}>
            <Text style={[styles.incB, { color: colors.text }]}>{t(`about.pledge${i}b`)}</Text>
            <Text style={[styles.p, { color: colors.textMuted }]}>{t(`about.pledge${i}s`)}</Text>
          </View>
        ))}
      </Section>

      <Section title={t("about.sensitiveHead")}>
        <P>{t("about.sensitiveP1")}</P>
      </Section>

      <Section title={t("about.whyHead")}>
        <P>{t("about.whyP1")}</P>
        <P>{t("about.whyP2")}</P>
      </Section>

      <View style={[styles.note, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={[styles.incB, { color: colors.text }]}>{t("about.noteH3")}</Text>
        <Text style={[styles.p, { color: colors.textMuted }]}>{t("about.noteP")}</Text>
      </View>

      <Footer />
    </ScrollView>
  );
}

function Footer() {
  const { t } = useI18n();
  const { colors } = useTheme();
  return (
    <View style={styles.footer}>
      <Text style={[styles.footerText, { color: colors.textMuted }]}>{t("footer.dua")}</Text>
      <Text style={[styles.footerText, { color: colors.textMuted }]}>
        {t("footer.builtBy")} · {t("footer.src")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  eyebrow: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 },
  title: { fontSize: 26, fontWeight: "800", marginTop: 4 },
  lede: { fontSize: 15, lineHeight: 23, marginTop: 8, marginBottom: 6 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginTop: 14 },
  h2: { fontSize: 17, fontWeight: "700", marginBottom: 8 },
  p: { fontSize: 14, lineHeight: 22, marginTop: 2 },
  bulletRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  incB: { fontSize: 14, fontWeight: "700" },
  note: { borderRadius: 12, padding: 16, marginTop: 14 },
  footer: { marginTop: 24, alignItems: "center", gap: 4 },
  footerText: { fontSize: 12, textAlign: "center" },
});
