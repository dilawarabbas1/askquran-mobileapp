// Integrity guard for the ported "Allah & Faith" / "Life Guidance" topics.
// Run: node scripts/verify-more-topics.mjs  (exit 0 = OK, 1 = problem)
//
// Asserts, without importing React Native:
//  - every id listed in the Library sub-tabs resolves to a real collection
//  - every ported item has a non-empty title, desc, and at least one ref
//  - every keyed (non-"names") item has its i18n title/label key in English.json
//  - the Asma al-Husna set has 99 names with unique ids

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const FAITH = ["names-of-allah", "allah-attributes", "worship-ibadah", "shirk", "duas", "quranic-parables", "prophet-stories", "repentance", "hypocrisy", "day-of-judgment", "people-of-paradise", "people-of-hellfire"];
const LIFE = ["commands-prohibitions", "marriage-family", "parents-relatives", "inheritance-wills", "riba-wealth", "charity-zakat", "crime-justice", "justice-testimony", "food-drink", "social-conduct", "relations-non-muslims", "brotherhood-community", "oaths-expiation", "ethical-character-map"];

const gen = read("src/design/refDataMore.gen.ts");
const refData = read("src/design/refData.ts");
const en = JSON.parse(read("src/i18n/locales/English.json"));

const errors = [];

// 1) all sub-tab ids resolve
const moreIds = new Set([...gen.matchAll(/id: "([^"]+)", ns:/g)].map((m) => m[1]));
const origIds = new Set([...refData.matchAll(/^\s*id: "([^"]+)", ns:/gm)].map((m) => m[1]));
const all = new Set([...moreIds, ...origIds]);
for (const id of [...FAITH, ...LIFE]) if (!all.has(id)) errors.push(`sub-tab id has no collection: ${id}`);

// 2) parse the generated collection blocks: extract each "<NS>_ITEMS" array + its ns
const collMeta = [...gen.matchAll(/id: "([^"]+)", ns: "([^"]+)", kind: "([^"]+)"[^]*?items: ([A-Z0-9]+)_ITEMS/g)]
  .map((m) => ({ id: m[1], ns: m[2], kind: m[3], itemsVar: `${m[4]}_ITEMS` }));

function extractItems(varName) {
  const re = new RegExp(`const ${varName}: RefCardItem\\[\\] = (\\[[^]*?\\]);\\n`);
  const m = re.exec(gen);
  if (!m) throw new Error(`cannot find ${varName}`);
  return JSON.parse(m[1]);
}

let itemCount = 0;
for (const c of collMeta) {
  const items = extractItems(c.itemsVar);
  for (const it of items) {
    itemCount++;
    if (!it.title) errors.push(`${c.id}/${it.id}: empty title`);
    if (!it.desc) errors.push(`${c.id}/${it.id}: empty desc`);
    // Quran-ref topics must cite at least one ayah; Asma al-Husna may include
    // hadith-tradition names (no Quran ref) marked with a `note` source.
    if (c.kind !== "names" && (!Array.isArray(it.refs) || it.refs.length === 0)) errors.push(`${c.id}/${it.id}: no refs`);
    if (c.kind === "names" && it.refs.length === 0 && !it.note) errors.push(`${c.id}/${it.id}: name with neither ref nor source note`);
    if (c.kind === "ref") {
      if (!(`${c.ns}.i.${it.id}.title` in en)) errors.push(`missing i18n: ${c.ns}.i.${it.id}.title`);
      if (!(`${c.ns}.i.${it.id}.label` in en)) errors.push(`missing i18n: ${c.ns}.i.${it.id}.label`);
    }
  }
  if (c.kind === "ref") {
    if (!(`${c.ns}.title` in en)) errors.push(`missing i18n: ${c.ns}.title`);
    if (!(`${c.ns}.subtitle` in en)) errors.push(`missing i18n: ${c.ns}.subtitle`);
    if (!(`${c.ns}.sourceNote` in en)) errors.push(`missing i18n: ${c.ns}.sourceNote`);
  }
}

// 3) Asma al-Husna: 99 unique names
const names = extractItems("NAMES_ITEMS");
if (names.length !== 99) errors.push(`expected 99 names, got ${names.length}`);
const nameIds = new Set(names.map((n) => n.id));
if (nameIds.size !== names.length) errors.push(`duplicate name ids`);

// sub-tab label keys
for (const k of ["nav.faithMenu", "nav.lifeMenu", "m.lib.faithSub", "m.lib.lifeSub"]) {
  if (!(k in en)) errors.push(`missing i18n: ${k}`);
}

if (errors.length) {
  console.error(`FAIL (${errors.length}):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`OK — ${collMeta.length} ref collections, ${itemCount} ref items, ${names.length} names, all sub-tab ids + i18n keys present.`);
