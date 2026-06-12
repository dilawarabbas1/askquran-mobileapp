// Unit tests for the pure xNotify event-property builders. No network, no native
// modules — plain deterministic functions. Run with `npm test`.

import assert from "node:assert/strict";
import { test } from "node:test";

import { surahNoFromRef, surahName, screenName, ayahText } from "../events";

test("surahNoFromRef parses the leading surah number", () => {
  assert.equal(surahNoFromRef("2:255"), 2);
  assert.equal(surahNoFromRef("39:53"), 39);
  assert.equal(surahNoFromRef("114:1"), 114);
});

test("surahNoFromRef is defensive on junk input", () => {
  assert.equal(surahNoFromRef(""), 0);
  assert.equal(surahNoFromRef("abc"), 0);
});

test("surahName strips the UI 'Surah ' prefix, case-insensitively", () => {
  assert.equal(surahName("Surah Al-Baqarah"), "Al-Baqarah");
  assert.equal(surahName("surah Az-Zumar"), "Az-Zumar");
  assert.equal(surahName("Al-Ma'ida"), "Al-Ma'ida"); // no prefix -> unchanged
  assert.equal(surahName("  Surah Yasin  "), "Yasin");
});

test("screenName maps internal screens to the taxonomy", () => {
  assert.equal(screenName("searchHome"), "home");
  assert.equal(screenName("results"), "search");
  assert.equal(screenName("reader"), "reader");
  assert.equal(screenName("recite"), "recite");
  assert.equal(screenName("facts"), "facts");
  assert.equal(screenName("library"), "library");
  assert.equal(screenName("passage"), "passage");
  assert.equal(screenName("about"), "about");
  assert.equal(screenName("saved"), "saved");
  assert.equal(screenName("settings"), "settings");
});

test("screenName resolves refList via the open collection id", () => {
  assert.equal(screenName("refList", "names-of-allah"), "names_of_allah");
  assert.equal(screenName("refList", "duas"), "duas");
  assert.equal(screenName("refList", null), "collection");
  assert.equal(screenName("refList"), "collection");
});

test("screenName passes unknown screens through unchanged", () => {
  assert.equal(screenName("somethingNew"), "somethingNew");
});

test("ayahText builds arabic-only text with the reference", () => {
  assert.equal(
    ayahText({ arabic: "ARB", translation: "ENG", reference: "2:255" }, "arabic"),
    "ARB (2:255)",
  );
});

test("ayahText builds translation-only text with the reference", () => {
  assert.equal(
    ayahText({ arabic: "ARB", translation: "ENG", reference: "2:255" }, "translation"),
    "ENG (2:255)",
  );
});

test("ayahText stacks arabic then translation for 'both'", () => {
  assert.equal(
    ayahText({ arabic: "ARB", translation: "ENG", reference: "2:255" }, "both"),
    "ARB\n\nENG (2:255)",
  );
});

test("ayahText skips missing parts without dangling separators", () => {
  assert.equal(ayahText({ translation: "ENG", reference: "2:255" }, "both"), "ENG (2:255)");
  assert.equal(ayahText({ arabic: "ARB" }, "both"), "ARB");
  assert.equal(ayahText({ arabic: "ARB" }, "arabic"), "ARB");
});
