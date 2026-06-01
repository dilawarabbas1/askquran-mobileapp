// Color palette for Ask Quran mobile. Mirrors the web app's green/gold identity
// in both light and dark schemes. Consumed through ThemeContext.

export interface Palette {
  mode: "light" | "dark";
  bg: string; // app background
  surface: string; // cards / panels
  surfaceAlt: string; // subtle alternate fill (chips, inputs)
  border: string;
  text: string; // primary text
  textMuted: string; // secondary text
  heroBg: string; // hero / header band
  heroText: string;
  primary: string; // green brand
  accent: string; // gold accent
  accentSoft: string; // gold tint background
  mark: string; // highlight background
  markText: string;
  danger: string;
  verified: string;
  warn: string;
}

const light: Palette = {
  mode: "light",
  bg: "#f6f4ee",
  surface: "#ffffff",
  surfaceAlt: "#f0ede4",
  border: "#e2ddd0",
  text: "#1c241f",
  textMuted: "#5d6b60",
  heroBg: "#0f1b16",
  heroText: "#f3efe2",
  primary: "#1f5d44",
  accent: "#A8893A",
  accentSoft: "#f3ead2",
  mark: "#fbeec2",
  markText: "#5a4a14",
  danger: "#b3261e",
  verified: "#1f7a4d",
  warn: "#b06a12",
};

const dark: Palette = {
  mode: "dark",
  bg: "#0f1411",
  surface: "#19211c",
  surfaceAlt: "#222c26",
  border: "#2d382f",
  text: "#ecefe9",
  textMuted: "#9bab9e",
  heroBg: "#0a120e",
  heroText: "#f3efe2",
  primary: "#3f9a73",
  accent: "#D9BE7E",
  accentSoft: "#2a2417",
  mark: "#4a3f17",
  markText: "#f3e6b6",
  danger: "#f2776f",
  verified: "#4fbf86",
  warn: "#e0a64f",
};

export const PALETTES = { light, dark };
export type ThemeMode = "light" | "dark";
