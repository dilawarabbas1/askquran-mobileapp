// Reading Plan / Khatm tracker — PAGE-BASED (604-page Madinah mushaf). Pick a pace
// (30 / 60 / 365-day preset, or a custom pages-a-day), then each day the plan shows
// today's exact portion (how many pages, which pages, which juzʼ + surah it begins
// at), a progress ring, an ahead/behind indicator, juzʼ milestones, and a lifetime
// khatam (completions) counter.

import React, { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Text } from "../AppText";
import { useApp } from "../AQContext";
import { BlockTitle, FieldLabel, OrnDivider, Switch } from "../atoms";
import { Icon } from "../Icon";
import { FONTS, mix } from "../tokens";
import { juzOf } from "../lib/juz";
import { pageStartRef, QPC_PAGE_COUNT } from "../../quran/qpcIndex";
import { SURAHS } from "../data";

const PAGES = QPC_PAGE_COUNT; // 604
const PRESETS = [30, 60, 365]; // days
const CUSTOM_MIN = 1;
const CUSTOM_MAX = 40;
const BLOCK_SIZE = 21;                          // pages per milestone block (≈ one juzʼ)
const BLOCKS = Math.ceil(PAGES / BLOCK_SIZE);   // 29 blocks over 604 pages (no clamped duplicate)
const QUICK_PPD = [1, 5, 10, 21];              // quick pages-a-day picks (21 ≈ one juzʼ)

const surahName = (n: number): string => SURAHS.find((s) => s[0] === n)?.[2] ?? `Surah ${n}`;

/* ---------- circular progress ring ---------- */
function Ring({ pct, color, track, size = 132, stroke = 11, children }: {
  pct: number; color: string; track: string; size?: number; stroke?: number; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(1, pct / 100)))}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

export function Plan() {
  const app = useApp();
  const { tokens } = app;
  const k = app.khatm;
  const [custom, setCustom] = useState(1); // pages/day chooser (defaults to a gentle 1/day)

  /* ---------- no active plan → pace picker ---------- */
  if (!k) {
    const customDays = Math.ceil(PAGES / custom);
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center" }}>
          <BlockTitle>{app.t("m.plan.title")}</BlockTitle>
        </View>
        <Text style={{ fontSize: 13.5, lineHeight: 21, color: tokens.text2, textAlign: "center", marginTop: 4, paddingHorizontal: 8 }}>
          {app.t("m.plan.lede")}
        </Text>

        {app.khatmCompletions > 0 ? (
          <View style={{ flexDirection: "row", alignSelf: "center", alignItems: "center", gap: 7, marginTop: 14, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: mix(tokens.gold, 14, tokens.surface), borderWidth: 1, borderColor: mix(tokens.gold, 30, tokens.line) }}>
            <Icon name="award" size={16} w={1.9} color={tokens.goldDeep} />
            <Text style={{ fontSize: 13, fontFamily: FONTS.sans[700], color: tokens.goldDeep }}>{app.t("m.plan.completedTimes", { n: app.khatmCompletions })}</Text>
          </View>
        ) : null}

        <OrnDivider />

        {/* PRIMARY: how many pages a day */}
        <FieldLabel>{app.t("m.plan.pagesPerDayQ")}</FieldLabel>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 9, marginBottom: 12 }}>
          {QUICK_PPD.map((n) => {
            const on = custom === n;
            return (
              <Pressable key={n} onPress={() => setCustom(n)} style={[{ borderWidth: 1, borderColor: on ? tokens.brand : tokens.line, backgroundColor: on ? tokens.brand : tokens.surface, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 15 }, on ? null : tokens.cardShadow]}>
                <Text style={{ fontSize: 13.5, fontFamily: FONTS.sans[600], color: on ? tokens.onBrand : tokens.text }}>{app.t("m.plan.pagesPerDay", { n })}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, padding: 16 }, tokens.cardShadow]}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Stepper value={custom} min={CUSTOM_MIN} max={CUSTOM_MAX} onChange={setCustom} tokens={tokens} />
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontFamily: FONTS.serif[600], fontSize: 16, color: tokens.text }}>{app.t("m.plan.pagesPerDay", { n: custom })}</Text>
              <Text style={{ fontSize: 12, color: tokens.text2, marginTop: 2 }}>{app.t("m.plan.finishInDays", { n: customDays })}</Text>
            </View>
          </View>
          <Pressable onPress={() => app.startKhatm(custom)} style={[{ marginTop: 14, backgroundColor: tokens.brand, borderRadius: 13, paddingVertical: 14, alignItems: "center" }, tokens.cardShadow]}>
            <Text style={{ fontSize: 15, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>{app.t("m.plan.startPlan")}</Text>
          </Pressable>
        </View>

        {/* SECONDARY: finish in a set time (presets set the pages/day for you) */}
        <FieldLabel>{app.t("m.plan.orByTime")}</FieldLabel>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {PRESETS.map((days) => {
            const ppd = Math.ceil(PAGES / days);
            const kindKey = days === 30 ? "30" : days === 60 ? "60" : "365";
            return (
              <Pressable key={days} onPress={() => setCustom(ppd)} style={[{ flex: 1, alignItems: "center", backgroundColor: custom === ppd ? mix(tokens.brand, 10, tokens.surface) : tokens.surface, borderWidth: 1, borderColor: custom === ppd ? tokens.brand : tokens.line, borderRadius: 14, paddingVertical: 12 }, tokens.cardShadow]}>
                <Text style={{ fontFamily: FONTS.serif[600], fontSize: 14.5, color: tokens.text }}>{app.t(`m.plan.days${kindKey}`)}</Text>
                <Text style={{ fontSize: 11, color: tokens.text3, marginTop: 2 }}>{app.t("m.plan.pagesPerDay", { n: ppd })}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  /* ---------- active plan ---------- */
  const done = k.pagesRead;
  const pct = Math.round((done / PAGES) * 100);
  const planDays = Math.ceil(PAGES / k.pagesPerDay);
  const elapsedDays = Math.min(planDays, Math.floor((Date.now() - k.startedAt) / 86400000) + 1);
  const expectedPages = Math.min(PAGES, elapsedDays * k.pagesPerDay);
  const diffDays = Math.round((done - expectedPages) / k.pagesPerDay);
  const complete = done >= PAGES;

  const statusText = complete
    ? app.t("m.plan.done")
    : diffDays > 0 ? app.t("m.plan.aheadDays", { n: diffDays })
    : diffDays === 0 ? app.t("m.plan.onTrack")
    : app.t("m.plan.behindDays", { n: -diffDays });
  const statusColor = complete || diffDays >= 0 ? tokens.brand : tokens.goldDeep;

  // today's portion
  const fromPage = Math.min(PAGES, done + 1);
  const toPage = Math.min(PAGES, done + k.pagesPerDay);
  const startRef = pageStartRef(fromPage);
  const startJuz = juzOf(startRef.surah, startRef.ayah);

  const confirmReset = () => {
    Alert.alert(app.t("m.plan.title"), app.t("m.plan.resetConfirm"), [
      { text: app.t("m.plan.cancel"), style: "cancel" },
      { text: app.t("m.plan.reset"), style: "destructive", onPress: () => app.resetKhatm() },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 16, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      {/* pace + streak */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONTS.serif[600], fontSize: 18, color: tokens.text }}>{app.t("m.plan.pagesPerDay", { n: k.pagesPerDay })}</Text>
          <Text style={{ fontSize: 12.5, color: tokens.text2, marginTop: 2 }}>{app.t("m.plan.dayOf", { day: elapsedDays, total: planDays })}</Text>
        </View>
        {k.streak > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: mix(tokens.gold, 16, tokens.surface), borderWidth: 1, borderColor: mix(tokens.gold, 34, tokens.line) }}>
            <Icon name="flame" size={15} w={1.9} color={tokens.goldDeep} />
            <Text style={{ fontSize: 13, fontFamily: FONTS.sans[700], color: tokens.goldDeep }}>{app.t("m.plan.streak", { n: k.streak })}</Text>
          </View>
        ) : null}
      </View>

      {/* progress ring */}
      <View style={{ alignItems: "center", marginTop: 18 }}>
        <Ring pct={pct} color={tokens.brand} track={tokens.lineSoft}>
          <Text style={{ fontFamily: FONTS.serif[600], fontSize: 32, color: tokens.brand }}>{pct}%</Text>
          {/* wrap in LTR isolates (U+2066…U+2069) so the done/total fraction never
              reverses under RTL (Urdu etc.) — reads "61 / 604", not "604 / 61". */}
          <Text style={{ fontSize: 12.5, fontFamily: FONTS.sans[600], color: tokens.text3, marginTop: 2 }}>{`⁦${done} / ${PAGES}⁩`}</Text>
          <Text style={{ fontSize: 10, color: tokens.text3, letterSpacing: 0.3 }}>{app.t("m.plan.pagesUnit")}</Text>
        </Ring>
        <Text style={{ fontSize: 13.5, fontFamily: FONTS.sans[700], color: statusColor, marginTop: 12 }}>{statusText}</Text>
        {app.khatmCompletions > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
            <Icon name="award" size={14} w={1.9} color={tokens.goldDeep} />
            <Text style={{ fontSize: 12.5, color: tokens.text2 }}>{app.t("m.plan.completedTimes", { n: app.khatmCompletions })}</Text>
          </View>
        ) : null}
      </View>

      {/* today's portion (or completion) */}
      {complete ? (
        <View style={[{ marginTop: 18, backgroundColor: mix(tokens.brand, 8, tokens.surface), borderWidth: 1, borderColor: mix(tokens.brand, 26, tokens.line), borderRadius: 18, padding: 18, alignItems: "center" }, tokens.cardShadow]}>
          <Text style={{ fontFamily: FONTS.ar, fontSize: 20, color: tokens.gold, marginBottom: 8 }}>﷽</Text>
          <Text style={{ fontFamily: FONTS.serif[600], fontSize: 18, color: tokens.brand, textAlign: "center" }}>{app.t("m.plan.done")}</Text>
          <Pressable onPress={() => app.startKhatm(k.pagesPerDay)} style={[{ marginTop: 14, backgroundColor: tokens.brand, borderRadius: 13, paddingVertical: 13, paddingHorizontal: 32 }, tokens.cardShadow]}>
            <Text style={{ fontSize: 15, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>{app.t("m.plan.startAgain")}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[{ marginTop: 18, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 18, padding: 16 }, tokens.cardShadow]}>
          <Text style={{ fontSize: 11.5, fontFamily: FONTS.sans[700], letterSpacing: 0.5, textTransform: "uppercase", color: tokens.gold }}>{app.t("m.plan.todayReading")}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
            <View style={{ minWidth: 58, height: 50, paddingHorizontal: 8, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 10), borderWidth: 1, borderColor: mix(tokens.brand, 22, tokens.line) }}>
              <Text style={{ fontFamily: FONTS.serif[600], fontSize: 19, color: tokens.brand }}>{toPage - fromPage + 1}</Text>
              <Text style={{ fontSize: 9.5, color: tokens.text3, marginTop: -1 }}>{app.t("m.plan.pagesUnit")}</Text>
            </View>
            <View style={{ flex: 1 }}>
              {/* LRI before {from} + PDI after {to} wraps the "62–82" run as one LTR
                  isolate so the page range never reverses under RTL. */}
              <Text style={{ fontFamily: FONTS.serif[600], fontSize: 16, color: tokens.text }}>{app.t("m.plan.pagesRange", { from: `⁦${fromPage}`, to: `${toPage}⁩` })}</Text>
              <Text style={{ fontSize: 12.5, color: tokens.text2, marginTop: 2 }}>{app.t("m.plan.juzN", { n: startJuz })} · {surahName(startRef.surah)} {startRef.surah}:{startRef.ayah}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <Pressable onPress={() => app.openReadingSession()} style={[{ flex: 1, backgroundColor: tokens.brand, borderRadius: 13, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, tokens.cardShadow]}>
              <Icon name="recite" size={17} w={2} color={tokens.onBrand} />
              <Text style={{ fontSize: 15, fontFamily: FONTS.sans[700], color: tokens.onBrand }}>{app.t("m.plan.readNow")}</Text>
            </Pressable>
            <Pressable onPress={() => app.markDayRead()} style={{ backgroundColor: tokens.surface2, borderWidth: 1, borderColor: tokens.line, borderRadius: 13, paddingVertical: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 7 }}>
              <Icon name="check" size={16} w={2.2} color={tokens.brand} />
              <Text style={{ fontSize: 14.5, fontFamily: FONTS.sans[700], color: tokens.text }}>{app.t("m.plan.markDone")}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* daily reminder */}
      <View style={[{ marginTop: 18, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 16 }, tokens.cardShadow]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11), borderWidth: 1, borderColor: mix(tokens.brand, 22, tokens.line) }}>
            <Icon name="bell" size={18} w={1.9} color={tokens.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.serif[600], fontSize: 15.5, color: tokens.text }}>{app.t("m.plan.reminder")}</Text>
            <Text style={{ fontSize: 12, color: tokens.text2, marginTop: 1 }}>{app.t("m.plan.reminderSub")}</Text>
          </View>
          <Switch on={app.planReminder.enabled} onPress={() => app.setPlanReminder({ enabled: !app.planReminder.enabled })} />
        </View>
        {app.planReminder.enabled ? (
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            {([[7, "m.set.dvMorning"], [13, "m.set.dvMidday"], [20, "m.set.dvEvening"]] as [number, string][]).map(([h, l]) => {
              const on = app.planReminder.hour === h;
              return (
                <Pressable key={h} onPress={() => app.setPlanReminder({ hour: h, minute: 0 })} style={{ flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 11, borderWidth: 1, borderColor: on ? tokens.brand : tokens.line, backgroundColor: on ? mix(tokens.brand, 10, tokens.surface) : tokens.surface }}>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.sans[600], color: on ? tokens.brand : tokens.text2 }}>{app.t(l)}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

      <OrnDivider />

      {/* page milestones — each cell ≈ BLOCK_SIZE pages, labelled by its checkpoint page */}
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
        <FieldLabel>{app.t("m.plan.milestones")}</FieldLabel>
        <Text style={{ fontSize: 11.5, color: tokens.text3 }}>{app.t("m.plan.milestonesSub", { n: BLOCK_SIZE })}</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {Array.from({ length: BLOCKS }, (_, i) => i + 1).map((b) => {
          const blockEnd = Math.min(PAGES, b * BLOCK_SIZE);   // checkpoint page
          const blockStart = (b - 1) * BLOCK_SIZE + 1;
          const isDone = done >= blockEnd;
          const isCurrent = !isDone && done + 1 >= blockStart && done + 1 <= blockEnd;
          let bg = tokens.surface, border = tokens.line, fg = tokens.text2, bw = 1;
          if (isDone) { bg = tokens.brand; border = tokens.brand; fg = tokens.onBrand; }
          else if (isCurrent) { bg = mix(tokens.gold, 10, tokens.surface); border = tokens.gold; fg = tokens.goldDeep; bw = 2; }
          return (
            <View key={b} style={{ width: 52, height: 52, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: bg, borderWidth: bw, borderColor: border }}>
              {isDone
                ? <Icon name="check" size={18} w={2.4} color={tokens.onBrand} />
                : <Text style={{ fontSize: 13, fontFamily: FONTS.sans[700], color: fg }}>{blockEnd}</Text>}
            </View>
          );
        })}
      </View>

      {/* footer */}
      <Pressable onPress={confirmReset} style={{ marginTop: 24, alignItems: "center", paddingVertical: 10 }}>
        <Text style={{ fontSize: 14, fontFamily: FONTS.sans[600], color: tokens.text3 }}>{app.t("m.plan.reset")}</Text>
      </Pressable>
    </ScrollView>
  );
}

/* ---------- small stepper ---------- */
function Stepper({ value, min, max, onChange, tokens }: {
  value: number; min: number; max: number; onChange: (v: number) => void; tokens: ReturnType<typeof useApp>["tokens"];
}) {
  const btn = (label: string, delta: number, disabled: boolean) => (
    <Pressable
      onPress={() => onChange(Math.min(max, Math.max(min, value + delta)))}
      disabled={disabled}
      style={{ width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: disabled ? tokens.surface2 : tokens.brand, opacity: disabled ? 0.5 : 1 }}
    >
      <Text style={{ fontSize: 22, fontFamily: FONTS.sans[700], color: disabled ? tokens.text3 : tokens.onBrand, lineHeight: 24 }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      {btn("−", -1, value <= min)}
      <Text style={{ fontFamily: FONTS.serif[600], fontSize: 22, color: tokens.text, minWidth: 26, textAlign: "center" }}>{value}</Text>
      {btn("+", 1, value >= max)}
    </View>
  );
}
