import { test } from "node:test";
import assert from "node:assert/strict";
import { displayAyahNumber, scrollTargetForList, scrollTargetForFlow, flowCharFraction, flowLineYForMarker, scrollTargetForLine, topAyahForList, flowIndexAtScroll } from "../reciteScroll";

test("displayAyahNumber renumbers Al-Fatiha but leaves other surahs verbatim", () => {
  // Surah 1: source verse 2 (first after the lifted Bismillah) shows as 1, etc.
  assert.equal(displayAyahNumber(1, 2), 1);
  assert.equal(displayAyahNumber(1, 7), 6);
  // Every other surah is verbatim.
  assert.equal(displayAyahNumber(2, 1), 1);
  assert.equal(displayAyahNumber(2, 255), 255);
  assert.equal(displayAyahNumber(114, 6), 6);
});

test("scrollTargetForList offsets above the card but never goes negative", () => {
  assert.equal(scrollTargetForList(500), 404); // 500 - 96
  assert.equal(scrollTargetForList(50), 0); // 50 - 96 clamped to 0
  assert.equal(scrollTargetForList(0), 0);
  assert.equal(scrollTargetForList(200, 50), 150); // custom offset
});

test("flowCharFraction weights by cumulative characters, not ayah index", () => {
  // A long opening ayah pushes later ayahs far down even at a low index.
  // lengths: [900, 50, 50] — ayah at index 1 starts after 900/1000 = 0.9 of the page.
  assert.equal(flowCharFraction([900, 50, 50], 1), 0.9);
  assert.equal(flowCharFraction([900, 50, 50], 2), 0.95);
  // Uniform lengths fall back to index/count proportions.
  assert.equal(flowCharFraction([100, 100, 100, 100], 2), 0.5);
  // First ayah always at the top.
  assert.equal(flowCharFraction([900, 50, 50], 0), 0);
});

test("flowCharFraction is safe for degenerate inputs", () => {
  assert.equal(flowCharFraction([], 3), 0); // empty corpus
  assert.equal(flowCharFraction([0, 0, 0], 2), 0); // zero-length corpus
  assert.equal(flowCharFraction([100, 100], -1), 0); // unknown index
  assert.equal(flowCharFraction([100, 100], 99), 1); // out of range → clamped to end
});

test("scrollTargetForFlow maps a fraction over the measured card span", () => {
  const cardTop = 200;
  const cardHeight = 4000;
  // frac 0 → cardTop minus offset, clamped to 0 (200 - 120 = 80).
  assert.equal(scrollTargetForFlow(0, cardTop, cardHeight), 80);
  // frac 0.5 → cardTop + half the card - offset.
  assert.equal(scrollTargetForFlow(0.5, cardTop, cardHeight), 200 + 2000 - 120);
  // frac 1 → full card height.
  assert.equal(scrollTargetForFlow(1, cardTop, cardHeight), 200 + 4000 - 120);
  // custom offset.
  assert.equal(scrollTargetForFlow(0.25, 0, 4000, 50), 950);
});

test("scrollTargetForFlow is safe for degenerate inputs", () => {
  assert.equal(scrollTargetForFlow(0, 0, 0), 0); // nothing measured yet
  assert.equal(scrollTargetForFlow(-1, 100, 1000), 0); // negative frac clamped, then 100-120 → 0
  assert.equal(scrollTargetForFlow(2, 100, 1000), 980); // frac clamped to 1: 100+1000-120
  assert.equal(scrollTargetForFlow(0.5, 0, -500), 0); // negative height guarded
});

test("flowLineYForMarker finds the line carrying the previous ayah's marker", () => {
  const lines = [
    { text: "بداية السورة ۝١ ثم", y: 0 },
    { text: "تكملة الكلام ۝٢ وبعدها", y: 58 },
    { text: "آخر الكلام ۝٣", y: 116 },
  ];
  // First ayah always starts at the top of the text.
  assert.equal(flowLineYForMarker(lines, null), 0);
  // Ayah 2 begins on the line that carries ayah 1's marker (۝١).
  assert.equal(flowLineYForMarker(lines, "۝١"), 0);
  // Ayah 3 begins on the line carrying ayah 2's marker (۝٢).
  assert.equal(flowLineYForMarker(lines, "۝٢"), 58);
});

test("flowLineYForMarker rejects a short-number prefix matching a longer number", () => {
  const lines = [
    { text: "كلام ۝٥٠ المزيد", y: 0 }, // marker for ayah 50
    { text: "نص ۝٥ نهاية", y: 58 },    // marker for ayah 5
  ];
  // ۝٥ must match ayah 5's line (y 58), NOT ayah 50's line (y 0) by prefix.
  assert.equal(flowLineYForMarker(lines, "۝٥"), 58);
});

test("flowLineYForMarker returns null when the marker is absent or no lines", () => {
  assert.equal(flowLineYForMarker([], "۝٢"), null); // nothing measured yet
  assert.equal(flowLineYForMarker([{ text: "لا علامة هنا", y: 0 }], "۝٢"), null);
});

test("scrollTargetForLine lifts the line below the viewport top, never negative", () => {
  assert.equal(scrollTargetForLine(200, 300), 404); // 300 + 200 - 96
  assert.equal(scrollTargetForLine(0, 50), 0); // 50 - 96 clamped to 0
  assert.equal(scrollTargetForLine(100, 0, 30), 70); // custom offset
});

test("topAyahForList picks the card at the reading line and round-trips scrollTargetForList", () => {
  const ys = { 1: 0, 2: 300, 3: 700, 4: 1200 };
  // Scrolled so ayah 3 sits at the reading line: scrollY = scrollTargetForList(700) = 604.
  assert.equal(topAyahForList(ys, 604), 3); // 604 + 96 = 700 → ayah 3
  assert.equal(topAyahForList(ys, 0), 1); // near top → first card
  assert.equal(topAyahForList(ys, 5000), 4); // past the end → last card
});

test("topAyahForList is safe before any card is measured", () => {
  assert.equal(topAyahForList({}, 0), null);
});

test("flowIndexAtScroll inverts scrollTargetForFlow over the char-weighted span", () => {
  const lengths = [100, 100, 100, 100]; // four equal ayahs → quarters
  const cardTop = 200, cardHeight = 4000;
  // Top of card (frac 0, accounting for the 120 offset) → first ayah.
  assert.equal(flowIndexAtScroll(lengths, scrollTargetForFlow(0, cardTop, cardHeight), cardTop, cardHeight), 0);
  // Halfway down → third ayah (frac 0.5 lands in [0.5,0.75) → index 2).
  assert.equal(flowIndexAtScroll(lengths, scrollTargetForFlow(0.5, cardTop, cardHeight), cardTop, cardHeight), 2);
  assert.equal(flowIndexAtScroll(lengths, 99999, cardTop, cardHeight), 3); // clamped past end
});

test("flowIndexAtScroll is safe for degenerate inputs", () => {
  assert.equal(flowIndexAtScroll([], 500, 0, 4000), 0);
  assert.equal(flowIndexAtScroll([10, 20], 500, 0, 0), 0); // nothing measured
});
