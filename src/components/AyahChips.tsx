import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSearchBus } from "@/context/SearchBus";
import { useTheme } from "@/theme/ThemeContext";

/** Tappable ayah-reference chips. Tapping one runs that reference as a search
 *  (mirrors the web's `/?q=<ref>` deep link). */
export function AyahChips({ refs }: { refs: string[] }) {
  const { colors } = useTheme();
  const { requestSearch } = useSearchBus();
  return (
    <View style={styles.row}>
      {refs.map((r) => (
        <Pressable
          key={r}
          onPress={() => requestSearch(r)}
          style={[styles.chip, { backgroundColor: colors.accentSoft }]}
        >
          <Text style={[styles.text, { color: colors.accent }]}>{r}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  text: { fontSize: 12, fontWeight: "700" },
});
