import { Audio, type AVPlaybackStatus } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import { useI18n } from "@/i18n/I18n";
import type { AyahAudio } from "@/types";

/**
 * Compact ayah recitation player. Streams the external recitation URL on demand
 * (no preload), with play/pause. `verseKey` is "surah:ayah".
 */
export function AudioPlayer({
  audio,
  verseKey,
  showLabel = false,
}: {
  audio: AyahAudio;
  verseKey: string;
  showLabel?: boolean;
}) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    };
  }, []);

  const onStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPlaying(status.isPlaying);
    if (status.didJustFinish) {
      soundRef.current?.setPositionAsync(0).catch(() => {});
      setPlaying(false);
    }
  };

  async function toggle() {
    try {
      if (!soundRef.current) {
        setLoading(true);
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(
          { uri: audio.url },
          { shouldPlay: true },
          onStatus,
        );
        soundRef.current = sound;
        setLoading(false);
        return;
      }
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded && status.isPlaying) await soundRef.current.pauseAsync();
      else await soundRef.current.playAsync();
    } catch {
      setLoading(false);
    }
  }

  return (
    <View style={styles.row}>
      <Pressable
        onPress={toggle}
        style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
        accessibilityLabel={`Play recitation for ${verseKey}`}
        hitSlop={6}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={[styles.icon, { color: colors.primary }]}>{playing ? "⏸" : "▶"}</Text>
        )}
      </Pressable>
      {showLabel && (
        <Text style={[styles.label, { color: colors.textMuted }]} numberOfLines={1}>
          {t("results.recitation")}: {audio.reciter}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 6 },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 14 },
  label: { fontSize: 12, flexShrink: 1 },
});
