import { View, StyleSheet } from "react-native";
import { useSettings } from "@/context/Settings";
import { useI18n } from "@/i18n/I18n";
import { languageLabel } from "@/languages";
import { Picker } from "./Picker";

/**
 * Language → Translation → Tafsir selectors, bound to the shared Settings.
 * `compact` drops the tafsir picker (used on reference pages that only show a
 * translation). Mirrors the web search-card controls.
 */
export function TranslationControls({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const {
    languages,
    editionsForLanguage,
    tafsirsForLanguage,
    language,
    translation,
    tafsir,
    changeLanguage,
    changeTranslation,
    changeTafsir,
  } = useSettings();

  return (
    <View style={styles.wrap}>
      <Picker
        label={t("search.language")}
        value={language}
        onChange={changeLanguage}
        options={languages.map((l) => ({ value: l, label: languageLabel(l) }))}
      />
      <Picker
        label={t("search.translation")}
        value={translation}
        onChange={changeTranslation}
        options={editionsForLanguage.map((e) => ({ value: e.id, label: e.name }))}
      />
      {!compact && tafsirsForLanguage.length > 0 && (
        <Picker
          label={t("search.tafsir")}
          value={tafsir}
          onChange={changeTafsir}
          options={[
            { value: "", label: t("search.tafsirAuto") },
            ...tafsirsForLanguage.map((tf) => ({ value: tf.id, label: tf.name })),
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
});
