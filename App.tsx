// AskQuran mobile — implements the Claude Design handoff (mobile/AskQuran Mobile
// App.html). Loads the design's font system, then mounts the app: splash →
// onboarding → bottom-tab app (Search · Facts · Saved · Settings) with the
// search → results → reader flow and the 44-language picker.

import React from "react";
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
  });

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
