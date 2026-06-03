// Compact per-ayah recitation player — the mobile counterpart of the web's
// AudioPlayer. Streams the ayah's recitation MP3 (the `audio.url` the backend
// returns on every /api/ask and /api/verses result) via expo-av. Only one ayah
// plays at a time across the app: starting one pauses whatever was playing.

import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Audio, type AVPlaybackStatus } from "expo-av";
import { useApp } from "./AQContext";
import { Icon } from "./Icon";
import { FONTS, mix } from "./tokens";

// The currently-sounding player (module-level), so a new play stops the prior.
let active: { stop: () => void } | null = null;

type State = "idle" | "loading" | "playing" | "paused";

export function AudioBar({ url, reciter }: { url: string; reciter?: string }) {
  const { tokens } = useApp();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [state, setState] = useState<State>("idle");

  // A stable registry entry: pauses this player without unloading it.
  const selfRef = useRef<{ stop: () => void }>({
    stop: () => {
      const s = soundRef.current;
      if (s) s.pauseAsync().catch(() => {});
      setState("paused");
    },
  });

  useEffect(
    () => () => {
      // Unmount: release the sound and clear the global slot if it's ours.
      if (active === selfRef.current) active = null;
      const s = soundRef.current;
      soundRef.current = null;
      if (s) s.unloadAsync().catch(() => {});
    },
    [],
  );

  function onStatus(st: AVPlaybackStatus) {
    if (!st.isLoaded) return;
    if (st.didJustFinish) {
      const s = soundRef.current;
      soundRef.current = null;
      if (s) s.unloadAsync().catch(() => {});
      if (active === selfRef.current) active = null;
      setState("idle");
    }
  }

  async function toggle() {
    const s = soundRef.current;
    if (state === "playing") {
      if (s) { try { await s.pauseAsync(); } catch { /* noop */ } }
      setState("paused");
      return;
    }
    if (state === "paused" && s) {
      try { await s.playAsync(); setState("playing"); active = selfRef.current; } catch { /* noop */ }
      return;
    }
    // idle → load & play
    setState("loading");
    try {
      if (active && active !== selfRef.current) active.stop();
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
      const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true }, onStatus);
      soundRef.current = sound;
      active = selfRef.current;
      setState("playing");
    } catch {
      setState("idle");
    }
  }

  const on = state === "playing";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: tokens.lineSoft, backgroundColor: mix(tokens.brand, 5, tokens.surface2) }}>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={on ? "Pause recitation" : "Play recitation"}
        style={{ width: 34, height: 34, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: tokens.brand }}
      >
        {state === "loading" ? (
          <ActivityIndicator size="small" color={tokens.onBrand} />
        ) : (
          <Icon name={on ? "pause" : "play"} size={16} color={tokens.onBrand} />
        )}
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, fontFamily: FONTS.sans[700], letterSpacing: 0.3, textTransform: "uppercase", color: tokens.text3 }}>Recitation</Text>
        <Text numberOfLines={1} style={{ fontSize: 12.5, fontFamily: FONTS.sans[600], color: tokens.text2, marginTop: 1 }}>
          {reciter || "Quran recitation"}
        </Text>
      </View>
      <Icon name="recite" size={17} color={tokens.text3} />
    </View>
  );
}
