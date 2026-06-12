import { test } from "node:test";
import assert from "node:assert/strict";
import { isRTL, scriptKind } from "../rtl";

// Languages this app ships in a right-to-left script. The flag drives
// whole-layout mirroring (I18nManager.forceRTL) AND translation-block direction,
// so a wrong entry mirrors the entire UI — guard the exact membership here.
const RTL = ["Arabic", "Persian", "Urdu", "Pashto", "Sindhi", "Divehi", "Uyghur"];

// Latin/Cyrillic/Indic etc. picker languages that MUST stay LTR. "Kurdish" is the
// regression: our edition is Kurmanji (native "Kurdî", Latin) — not Sorani — so
// it must NOT mirror the layout.
const LTR = ["English", "Kurdish", "Azerbaijani", "Tajik", "Tatar", "Uzbek", "Hausa", "Somali", "Amazigh", "Turkish", "Indonesian", "French", "Chinese", "Hindi", "Bengali"];

test("isRTL flags exactly the Arabic/Thaana-script editions", () => {
  for (const lang of RTL) assert.equal(isRTL(lang), true, `${lang} should be RTL`);
});

test("isRTL leaves Latin-script editions (incl. Kurmanji Kurdish) LTR", () => {
  for (const lang of LTR) assert.equal(isRTL(lang), false, `${lang} should be LTR`);
});

test("scriptKind: Urdu→ur, other RTL→rtl, everything else→ltr", () => {
  assert.equal(scriptKind("Urdu"), "ur");
  assert.equal(scriptKind("Arabic"), "rtl");
  assert.equal(scriptKind("Uyghur"), "rtl");
  assert.equal(scriptKind("Kurdish"), "ltr"); // Kurmanji — regression guard
  assert.equal(scriptKind("English"), "ltr");
});
