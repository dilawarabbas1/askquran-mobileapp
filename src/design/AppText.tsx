// Drop-in replacement for react-native's <Text> that makes the UI chrome render
// correctly in every language. It inspects the resolved style; when a Latin
// brand font (Plus Jakarta Sans / Newsreader) is about to render non-Latin text
// it swaps in a script-aware font (Amiri / Nastaliq / system) and a line-height
// that clears the script — so Arabic, Urdu, Bengali, Hindi, Thai, CJK, Cyrillic,
// etc. never lose their weight, clip, or overlap. Latin text and content already
// styled with Amiri/Nastaliq/serif pass through untouched (zero behaviour change
// for English). All decisions live in ./lib/uiType (pure + unit-tested).
//
// Usage: screens import { Text } from "../AppText" instead of "react-native".

import React from "react";
import { Text as RNText, StyleSheet, type TextProps } from "react-native";
import { applyUiFont, getUiIsUrdu, isBrandFont, type UiTextStyle } from "./lib/uiType";

/** Collect the visible string from children (strings/numbers, recursing into
 *  nested <Text> and arrays). Used only to detect the script, so a shallow,
 *  bounded walk is enough. */
function textOf(node: React.ReactNode, depth = 0): string {
  if (node == null || node === false || node === true) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map((n) => textOf(n, depth)).join("");
  if (depth < 4 && React.isValidElement(node)) {
    return textOf((node.props as { children?: React.ReactNode }).children, depth + 1);
  }
  return "";
}

export const Text = React.forwardRef<RNText, TextProps>(function AppText(props, ref) {
  const flat = (StyleSheet.flatten(props.style) ?? {}) as UiTextStyle;
  let style = props.style;
  // Only brand-font text can need remapping; content text (Amiri/Nastaliq/serif)
  // short-circuits here without scanning the string.
  if (isBrandFont(flat.fontFamily)) {
    const patched = applyUiFont(flat, textOf(props.children), getUiIsUrdu());
    // applyUiFont returns the flattened style with the font/weight/line-height
    // resolved; cast back to RN's style prop (UiTextStyle is intentionally loose).
    if (patched) style = patched as unknown as TextProps["style"];
  }
  // Default chrome to the leading edge. RN's implicit default is physical "left",
  // which leaves headings/labels stuck left under RTL; an explicit "left" instead
  // gets mirrored to "right" by swapLeftAndRightInRTL, so every label that doesn't
  // pin its own alignment follows the reading direction. Content that sets its own
  // textAlign (centered Arabic, translations) keeps it — this only fills the gap.
  if (flat.textAlign == null) {
    style = [style, styles.lead];
  }
  return <RNText ref={ref} {...props} style={style} />;
});

const styles = StyleSheet.create({ lead: { textAlign: "left" } });
