import { Text, type StyleProp, type TextStyle } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Render `text` with `terms` visually highlighted.
 *
 * IMPORTANT: this never changes the text — it only wraps exact matches in a
 * styled <Text> for emphasis. The concatenated content is identical to the
 * input. Terms that don't occur produce no highlight.
 */
export function Highlight({
  text,
  terms,
  style,
}: {
  text: string;
  terms: string[];
  style?: StyleProp<TextStyle>;
}) {
  const { colors } = useTheme();
  const usable = terms
    .filter((t) => t && t.length >= 2)
    .map(escapeRegExp)
    .sort((a, b) => b.length - a.length);

  if (usable.length === 0) return <Text style={style}>{text}</Text>;

  let re: RegExp;
  try {
    re = new RegExp(`(${usable.join("|")})`, "giu");
  } catch {
    return <Text style={style}>{text}</Text>;
  }

  const parts = text.split(re);
  const lower = new Set(usable.map((t) => t.toLowerCase()));

  return (
    <Text style={style}>
      {parts.map((part, i) =>
        lower.has(part.toLowerCase()) ? (
          <Text
            key={i}
            style={{ backgroundColor: colors.mark, color: colors.markText, fontWeight: "600" }}
          >
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}
