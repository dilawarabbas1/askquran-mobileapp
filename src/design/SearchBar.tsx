// Search input ported from the .searchbar styles in aq-app.css. Used on the
// home screen (with the emerald "go" button), the results app bar (compact),
// the surah filter, and the language picker.

import React, { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Icon } from "./Icon";
import { useApp } from "./AQContext";
import { FONTS, mix } from "./tokens";

export function SearchBar({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  showGo,
  compact,
  small,
  autoFocus,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  onSubmit?: () => void;
  showGo?: boolean;
  compact?: boolean;
  small?: boolean;
  autoFocus?: boolean;
}) {
  const { tokens } = useApp();
  const [focus, setFocus] = useState(false);
  const pad = compact ? { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 13 } : small ? { paddingVertical: 10, paddingHorizontal: 13, borderRadius: 12 } : { paddingVertical: 13, paddingHorizontal: 15, borderRadius: 15 };
  return (
    <View
      style={[
        { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: tokens.surface2, borderWidth: 1.5, borderColor: focus ? tokens.brand : tokens.line },
        pad,
        !compact && !small ? tokens.cardShadow : null,
        focus ? { borderColor: tokens.brand } : null,
      ]}
    >
      <Icon name="search" size={compact ? 17 : 19} w={2.2} color={tokens.text3} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tokens.text3}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        returnKeyType="search"
        style={{ flex: 1, minWidth: 0, fontSize: compact ? 14 : small ? 14 : 15.5, color: tokens.text, fontFamily: FONTS.sans[400], padding: 0 }}
      />
      {showGo ? (
        <Pressable onPress={onSubmit} style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: tokens.brand, alignItems: "center", justifyContent: "center" }}>
          <Icon name="search" size={17} w={2.4} color={tokens.onBrand} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Faint khatam-lattice ornament band that sits behind hero headers. */
export function OrnBand({ children }: { children: React.ReactNode }) {
  const { tokens } = useApp();
  void mix; // band tint handled by children; kept subtle to match design
  return <View style={{ overflow: "hidden", backgroundColor: tokens.bg }}>{children}</View>;
}
