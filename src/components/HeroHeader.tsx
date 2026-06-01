import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hasCatalog } from "@/i18n";
import { useI18n } from "@/i18n/I18n";
import { languageLabel, UI_LANGUAGES } from "@/languages";
import { useTheme } from "@/theme/ThemeContext";

/** App hero band: brand lockup, shahada, lede, plus the global UI-language
 *  picker and the light/dark toggle. Rendered atop the Search screen. */
export function HeroHeader() {
  const { t, lang, setLang } = useI18n();
  const { colors, mode, toggle } = useTheme();
  const insets = useSafeAreaInsets();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <View style={[styles.hero, { backgroundColor: colors.heroBg, paddingTop: insets.top + 12 }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => setLangOpen(true)}
          style={[styles.pill, { borderColor: "rgba(255,255,255,0.25)" }]}
        >
          <Text style={styles.pillText}>🌐 {languageLabel(lang)}</Text>
        </Pressable>
        <Pressable
          onPress={toggle}
          style={[styles.pill, { borderColor: "rgba(255,255,255,0.25)" }]}
        >
          <Text style={styles.pillText}>
            {mode === "dark" ? `☀ ${t("nav.light")}` : `☾ ${t("nav.dark")}`}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.shahadaAr, { color: colors.heroText }]}>
        لَا إِلٰهَ إِلَّا ٱللَّٰهُ مُحَمَّدٌ رَسُولُ ٱللَّٰهِ
      </Text>
      <Text style={[styles.shahadaEn, { color: colors.accent }]}>{t("hero.shahadaEn")}</Text>

      <Text style={[styles.brand, { color: colors.heroText }]}>
        Ask <Text style={{ fontWeight: "800" }}>Quran</Text>
      </Text>
      <Text style={[styles.lede, { color: colors.heroText }]}>{t("hero.lede")}</Text>

      <Modal visible={langOpen} transparent animationType="fade" onRequestClose={() => setLangOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setLangOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{t("nav.uiLanguage")}</Text>
            <FlatList
              data={UI_LANGUAGES}
              keyExtractor={(l) => l}
              style={{ maxHeight: 460 }}
              renderItem={({ item }) => {
                const active = item === lang;
                return (
                  <Pressable
                    onPress={() => {
                      setLang(item);
                      setLangOpen(false);
                    }}
                    style={[styles.option, active && { backgroundColor: colors.accentSoft }]}
                  >
                    <Text style={{ color: active ? colors.accent : colors.text, fontWeight: active ? "700" : "400" }}>
                      {languageLabel(item)}
                      {item !== "English" && !hasCatalog(item) ? " —" : ""}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 44, alignItems: "center" },
  topBar: { flexDirection: "row", justifyContent: "flex-end", alignSelf: "stretch", gap: 8 },
  pill: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  pillText: { color: "#f3efe2", fontSize: 12, fontWeight: "600" },
  shahadaAr: { fontSize: 22, lineHeight: 40, textAlign: "center", writingDirection: "rtl", marginTop: 14 },
  shahadaEn: { fontSize: 12, marginTop: 4, fontStyle: "italic" },
  brand: { fontSize: 34, fontWeight: "600", marginTop: 16 },
  lede: { fontSize: 14, textAlign: "center", marginTop: 8, opacity: 0.9, lineHeight: 21 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 24 },
  sheet: { borderWidth: 1, borderRadius: 16, padding: 16 },
  sheetTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  option: { paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8 },
});
