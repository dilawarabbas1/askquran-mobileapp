import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

export interface PickerOption {
  value: string;
  label: string;
}

/** A labelled field that opens a modal list to pick one option. */
export function Picker({
  label,
  value,
  options,
  onChange,
  style,
}: {
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (value: string) => void;
  style?: object;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.control, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
      >
        <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
          {current?.label ?? value}
        </Text>
        <Text style={{ color: colors.textMuted }}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              style={{ maxHeight: 420 }}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    style={[styles.option, active && { backgroundColor: colors.accentSoft }]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: active ? colors.accent : colors.text },
                        active && { fontWeight: "700" },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {active && <Text style={{ color: colors.accent }}>✓</Text>}
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
  field: { flex: 1, minWidth: 130 },
  label: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", marginBottom: 4, letterSpacing: 0.4 },
  control: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  value: { fontSize: 14, flexShrink: 1 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 24 },
  sheet: { borderWidth: 1, borderRadius: 16, padding: 16 },
  sheetTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  optionText: { fontSize: 15 },
});
