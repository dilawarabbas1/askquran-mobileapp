import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isBrandFont,
  weightFromFamily,
  detectScript,
  lineHeightFor,
  remapFont,
  applyUiFont,
} from "../uiType";

test("isBrandFont matches only the Latin brand families", () => {
  assert.equal(isBrandFont("PlusJakartaSans_700Bold"), true);
  assert.equal(isBrandFont("Newsreader_400Regular_Italic"), true);
  assert.equal(isBrandFont("Amiri_400Regular"), false);
  assert.equal(isBrandFont("NotoNastaliqUrdu_400Regular"), false);
  assert.equal(isBrandFont(undefined), false);
});

test("weightFromFamily reads the encoded weight", () => {
  assert.equal(weightFromFamily("PlusJakartaSans_800ExtraBold"), 800);
  assert.equal(weightFromFamily("PlusJakartaSans_700Bold"), 700);
  assert.equal(weightFromFamily("PlusJakartaSans_600SemiBold"), 600);
  assert.equal(weightFromFamily("Newsreader_500Medium_Italic"), 500);
  assert.equal(weightFromFamily("Newsreader_400Regular"), 400);
});

test("detectScript classifies by glyph block", () => {
  assert.equal(detectScript("Library"), "latin");
  assert.equal(detectScript("Bibliothèque"), "latin"); // Latin-1 accents
  assert.equal(detectScript("Juz 3 →"), "latin"); // digits + arrow are neutral
  assert.equal(detectScript("القرآن"), "arabic");
  assert.equal(detectScript("کتابِ الٰہی"), "urdu"); // contains ہ (U+06C1)
  assert.equal(detectScript("কুরআন"), "other"); // Bengali
  assert.equal(detectScript("कुरान"), "other"); // Devanagari
  assert.equal(detectScript("คัมภีร์"), "other"); // Thai
  assert.equal(detectScript("古兰经"), "other"); // CJK
  assert.equal(detectScript("Коран"), "other"); // Cyrillic
});

test("detectScript prefers urdu when urdu-specific letters are present", () => {
  // ے (U+06D2) is Urdu-specific; even mixed with plain Arabic letters → urdu
  assert.equal(detectScript("سورتیں ہے"), "urdu");
  // Pure Arabic without urdu-specific chars stays arabic
  assert.equal(detectScript("سورة البقرة"), "arabic");
});

test("lineHeightFor bumps tight values but never shrinks", () => {
  assert.equal(lineHeightFor("urdu", 14), 28); // 14 * 2.0
  assert.equal(lineHeightFor("arabic", 20, 30), 34); // 20*1.7=34 > 30 → bump
  assert.equal(lineHeightFor("other", 14, 30), undefined); // already tall enough
  assert.equal(lineHeightFor("other", undefined), undefined); // no fontSize → skip
});

test("remapFont picks the right family/weight per script", () => {
  assert.equal(remapFont("arabic", 700).fontFamily, "Amiri_400Regular");
  assert.equal(remapFont("urdu", 600).fontFamily, "NotoNastaliqUrdu_500Medium");
  assert.equal(remapFont("urdu", 400).fontFamily, "NotoNastaliqUrdu_400Regular");
  const other = remapFont("other", 700);
  assert.equal(other.fontFamily, undefined);
  assert.equal(other.fontWeight, "700");
});

test("applyUiFont is a no-op for Latin text or non-brand fonts", () => {
  assert.equal(applyUiFont({ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14 }, "Library"), null);
  assert.equal(applyUiFont({ fontFamily: "Amiri_400Regular", fontSize: 23 }, "القرآن"), null);
  assert.equal(applyUiFont({ fontSize: 14 }, "كتاب"), null); // no fontFamily
});

test("applyUiFont remaps a brand font over non-Latin glyphs", () => {
  const arabic = applyUiFont({ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14, lineHeight: 18 }, "القرآن");
  assert.equal(arabic?.fontFamily, "Amiri_400Regular");
  assert.equal(arabic?.lineHeight, 24); // 14*1.7 ≈ 24 > 18

  const other = applyUiFont({ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14 }, "কুরআন");
  assert.equal("fontFamily" in (other as object), false); // brand family unset
  assert.equal(other?.fontWeight, "700");
  assert.equal(other?.lineHeight, 20); // 14*1.45 ≈ 20

  const urdu = applyUiFont({ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 14 }, "کتابِ الٰہی ہے");
  assert.equal(urdu?.fontFamily, "NotoNastaliqUrdu_500Medium");
  assert.equal(urdu?.lineHeight, 28); // 14*2.0
});

test("applyUiFont keeps Urdu chrome on one script — shared-letter words go Nastaliq under an Urdu UI", () => {
  // "تلاش" (Search) uses only letters shared with Arabic, so by glyphs alone it
  // resolves to Amiri (naskh) — visibly smaller than a sibling tab like "کتب خانہ"
  // that carries an Urdu-specific letter and goes Nastaliq. With the Urdu-UI hint
  // every chrome label resolves to Nastaliq, so the bottom nav is one size.
  const naskh = applyUiFont({ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 10.5 }, "تلاش");
  assert.equal(naskh?.fontFamily, "Amiri_400Regular");

  const nastaliq = applyUiFont({ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 10.5 }, "تلاش", true);
  assert.equal(nastaliq?.fontFamily, "NotoNastaliqUrdu_500Medium");

  // The hint never overrides actual Arabic content (non-brand family passes through).
  assert.equal(applyUiFont({ fontFamily: "Amiri_400Regular", fontSize: 23 }, "القرآن", true), null);
});
