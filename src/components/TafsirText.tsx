import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import { Highlight } from "./Highlight";

/**
 * Render stored tafsir text readably. The source keeps paragraph breaks, puts
 * quoted ayahs/hadith on their own lines, and marks some headings with leading
 * "##". We split on newlines and render headings, predominantly-Arabic lines as
 * RTL blocks, and everything else as paragraphs. Text is shown verbatim —
 * nothing is added or rewritten.
 */
const AR_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g;
function arabicRatio(s: string): number {
  const letters = (s.match(/\p{L}/gu) ?? []).length;
  if (!letters) return 0;
  return (s.match(AR_RE) ?? []).length / letters;
}

export function TafsirText({ text, terms }: { text: string; terms?: string[] }) {
  const { colors } = useTheme();
  const blocks = String(text ?? "")
    .split(/\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length === 0) return null;

  return (
    <View>
      {blocks.map((b, i) => {
        if (/^#{1,4}\s+/.test(b)) {
          return (
            <Text key={i} style={[styles.heading, { color: colors.text }]}>
              {b.replace(/^#{1,4}\s+/, "")}
            </Text>
          );
        }
        if (arabicRatio(b) > 0.5) {
          return (
            <Text key={i} style={[styles.arabic, { color: colors.text }]}>
              {b}
            </Text>
          );
        }
        return terms && terms.length ? (
          <Highlight key={i} text={b} terms={terms} style={[styles.para, { color: colors.textMuted }]} />
        ) : (
          <Text key={i} style={[styles.para, { color: colors.textMuted }]}>
            {b}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 15, fontWeight: "700", marginTop: 10, marginBottom: 4 },
  arabic: {
    fontSize: 20,
    lineHeight: 36,
    textAlign: "right",
    writingDirection: "rtl",
    marginVertical: 6,
  },
  para: { fontSize: 15, lineHeight: 24, marginVertical: 5 },
});
