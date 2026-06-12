// AskQuran mobile — implements the Claude Design handoff (mobile/AskQuran Mobile
// App.html). Loads the design's font system, then mounts the app: splash →
// onboarding → bottom-tab app (Search · Facts · Saved · Settings) with the
// search → results → reader flow and the 44-language picker.

import React, { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  Newsreader_400Regular,
  Newsreader_500Medium,
  Newsreader_600SemiBold,
  Newsreader_400Regular_Italic,
  Newsreader_500Medium_Italic,
} from "@expo-google-fonts/newsreader";
import { Amiri_400Regular, Amiri_400Regular_Italic } from "@expo-google-fonts/amiri";
import { NotoNastaliqUrdu_400Regular, NotoNastaliqUrdu_500Medium } from "@expo-google-fonts/noto-nastaliq-urdu";

import { AQProvider, useApp } from "@/design/AQContext";
import { AppShell } from "@/design/AppShell";
import { initPush } from "@/push";

/** Drives the OS status-bar colour from the resolved theme. */
function ThemedStatusBar() {
  const { mode } = useApp();
  return <StatusBar style={mode === "dark" ? "light" : "dark"} />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Newsreader_400Regular,
    Newsreader_500Medium,
    Newsreader_600SemiBold,
    Newsreader_400Regular_Italic,
    Newsreader_500Medium_Italic,
    Amiri_400Regular,
    Amiri_400Regular_Italic,
    NotoNastaliqUrdu_400Regular,
    NotoNastaliqUrdu_500Medium,
    // Quran faces. The Arabic body + ayah-end rosette render in Amiri (FONTS.ar) —
    // its U+06DD end-of-ayah glyph is a clean solid ring enclosing the verse number,
    // matching the web. UthmanicHafs (full KFGQPC Uthmani face) stays bundled but is
    // no longer the body font: its rosette is the dashed mushaf ring, which read as a
    // "broken/dotted circle" on the By Surah view. SurahNameV2 draws the calligraphic
    // surah titles (PUA U+E001…) for the By Surah header band.
    UthmanicHafs: require("./assets/fonts/UthmanicHafs.ttf"),
    SurahNameV2: require("./assets/fonts/SurahNameV2.ttf"),
    // Bundled for parity with the web font set. JuzName = decorative Juz/Para
    // boundary headers (web `--font-juz`); QuranSymbols = KFGQPC Arabic Symbols
    // (tajweed/waqf/sajdah marks, PUA U+F020…). Neither is wired to a visible
    // surface yet.
    JuzName: require("./assets/fonts/JuzName.ttf"),
    QuranSymbols: require("./assets/fonts/QuranSymbols.ttf"),
  });

  // Register this install for xNotify push once, after the app is interactive.
  // No-op when the SDK isn't linked or no Push Key is configured.
  useEffect(() => {
    initPush();
  }, []);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: "#F4EEE0" }} />;

  return (
    <SafeAreaProvider>
      <AQProvider>
        <ThemedStatusBar />
        <AppShell />
      </AQProvider>
    </SafeAreaProvider>
  );
}
