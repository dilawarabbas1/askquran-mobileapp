import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVolunteerCode } from "../parseReferrer";

test("parses the bare utm_volunteer param", () => {
  assert.equal(parseVolunteerCode("utm_volunteer=ABC123"), "ABC123");
});

test("parses utm_volunteer from a full query string", () => {
  assert.equal(
    parseVolunteerCode("utm_source=play&utm_volunteer=XYZ&utm_medium=referral"),
    "XYZ",
  );
});

test("URL-decodes the code value", () => {
  assert.equal(parseVolunteerCode("utm_volunteer=a%20b"), "a b");
});

test("returns null for organic installs (no utm_volunteer)", () => {
  assert.equal(parseVolunteerCode("utm_source=google-play&utm_medium=organic"), null);
});

test("returns null for empty/missing referrer", () => {
  assert.equal(parseVolunteerCode(null), null);
  assert.equal(parseVolunteerCode(undefined), null);
  assert.equal(parseVolunteerCode(""), null);
});

test("ignores a present-but-empty utm_volunteer", () => {
  assert.equal(parseVolunteerCode("utm_volunteer="), null);
});
