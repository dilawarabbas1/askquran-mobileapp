// Copy + share actions for a single ayah, shared by the result card (AyahCard)
// and the Reader so both behave identically and emit the same xNotify events.
// Copy goes through expo-clipboard; share through the RN system share sheet. Both
// default to "both" (Arabic + translation). The pure text shaping lives in
// analytics/events (ayahText) so it stays unit-tested and side-effect free here.

import { Platform, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { track } from "@/analytics";
import { ayahText, surahName, type AyahTextType } from "@/analytics/events";
import type { AyahItem } from "../data";

/** The translation slice to carry, chosen by the active translation language. */
function translationOf(item: AyahItem, lang: "en" | "ur"): string {
  return lang === "ur" ? item.ur : item.en;
}

/** Copy the ayah to the clipboard and emit `ayah_copied`. */
export async function copyAyah(item: AyahItem, lang: "en" | "ur", type: AyahTextType = "both"): Promise<void> {
  const text = ayahText(
    { arabic: item.arabic, translation: translationOf(item, lang), reference: item.ref },
    type,
  );
  try {
    await Clipboard.setStringAsync(text);
  } catch {
    /* clipboard unavailable (web/older runtime) — still record intent below */
  }
  track("ayah_copied", { surah_name: surahName(item.surah), ayah_no: item.ref, copy_type: type });
}

/** Open the system share sheet and emit `ayah_shared` only if the user completes
 *  a share (a cancel/dismiss emits nothing). `platform` is the chosen target on
 *  iOS (activityType); Android does not expose it, so it falls back to "android". */
export async function shareAyah(item: AyahItem, lang: "en" | "ur", type: AyahTextType = "both"): Promise<void> {
  const message = ayahText(
    { arabic: item.arabic, translation: translationOf(item, lang), reference: item.ref },
    type,
  );
  let platform = "unknown";
  try {
    const res = await Share.share({ message });
    if (res.action === Share.dismissedAction) return; // cancelled — no event
    if (res.action === Share.sharedAction) {
      platform = res.activityType ?? (Platform.OS === "ios" ? "unknown" : "android");
    }
  } catch {
    return; // share failed to open — no event
  }
  track("ayah_shared", { surah_name: surahName(item.surah), ayah_no: item.ref, share_type: type, platform });
}
