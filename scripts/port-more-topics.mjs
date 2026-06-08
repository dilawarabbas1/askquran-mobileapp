// One-shot porting tool: transforms the AskQuran web frontend's curated topic
// datasets (frontend/src/data/*.ts) + their English i18n strings into the mobile
// app's refData collection format and English catalog. Zero generated content —
// every string is copied verbatim from the web source-of-truth.
//
// Usage: node scripts/port-more-topics.mjs
// Outputs:
//   - src/design/refDataMore.gen.ts   (new Collection[] + group id arrays)
//   - merges new namespace keys into src/i18n/locales/English.json

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const WEB = "/Users/dilawarabbas/ClaudeCode/AskQuran/frontend/src";
const MOBILE = path.resolve(import.meta.dirname, "..");

// route id, web data file, CATEGORIES var, ITEMS var, ns, icon, group
// title/subtitle/sourceNote are pulled from the web English.json (<ns>.*).
const STD = [
  ["allah-attributes", "allahAttributes", "ATTR_CATEGORIES", "ATTR_ITEMS", "attr", "book", "faith"],
  ["worship-ibadah", "worshipIbadah", "WORSHIP_CATEGORIES", "WORSHIP_ITEMS", "worship", "hands", "faith"],
  ["shirk", "shirk", "SHIRK_CATEGORIES", "SHIRK_ITEMS", "shirk", "alert", "faith"],
  ["repentance", "repentance", "REPENT_CATEGORIES", "REPENT_ITEMS", "repent", "heart", "faith"],
  ["hypocrisy", "hypocrisy", "NIFAQ_CATEGORIES", "NIFAQ_ITEMS", "nifaq", "alert", "faith"],
  ["day-of-judgment", "dayOfJudgment", "DOJ_CATEGORIES", "DOJ_ITEMS", "doj", "scales", "faith"],
  ["people-of-paradise", "peopleOfParadise", "PARADISE_CATEGORIES", "PARADISE_ITEMS", "paradise", "heart", "faith"],
  ["people-of-hellfire", "peopleOfHellfire", "HELL_CATEGORIES", "HELL_ITEMS", "hell", "alert", "faith"],
  ["marriage-family", "marriageFamily", "MARRIAGE_CATEGORIES", "MARRIAGE_ITEMS", "marriage", "heart", "life"],
  ["parents-relatives", "parentsRelatives", "PARENTS_CATEGORIES", "PARENTS_ITEMS", "parents", "person", "life"],
  ["inheritance-wills", "inheritanceWills", "INHERIT_CATEGORIES", "INHERIT_ITEMS", "inherit", "scroll", "life"],
  ["riba-wealth", "ribaWealth", "RIBA_CATEGORIES", "RIBA_ITEMS", "riba", "scales", "life"],
  ["charity-zakat", "charityZakat", "CHARITY_CATEGORIES", "CHARITY_ITEMS", "charity", "hands", "life"],
  ["crime-justice", "crimeJustice", "CRIME_CATEGORIES", "CRIME_ITEMS", "crime", "scales", "life"],
  ["justice-testimony", "justiceTestimony", "JUSTICE_CATEGORIES", "JUSTICE_ITEMS", "justice", "scales", "life"],
  ["food-drink", "foodDrink", "FOOD_CATEGORIES", "FOOD_ITEMS", "food", "book", "life"],
  ["social-conduct", "socialConduct", "SOCIAL_CATEGORIES", "SOCIAL_ITEMS", "social", "person", "life"],
  ["relations-non-muslims", "relationsNonMuslims", "RELATIONS_CATEGORIES", "RELATIONS_ITEMS", "relations", "person", "life"],
  ["brotherhood-community", "brotherhoodCommunity", "BROTHERHOOD_CATEGORIES", "BROTHERHOOD_ITEMS", "brotherhood", "person", "life"],
  ["oaths-expiation", "oathsExpiation", "OATHS_CATEGORIES", "OATHS_ITEMS", "oaths", "scroll", "life"],
  // New pages added on the web after the first port pass (2026-06-05).
  ["signs-of-allah", "signsOfAllah", "SIGNS_CATEGORIES", "SIGNS_ITEMS", "signs", "star", "faith"],
  ["women-quran", "womenQuran", "WOMEN_CATEGORIES", "WOMEN_ITEMS", "women", "person", "faith"],
  ["faith-not-lineage", "faithNotLineage", "LINEAGE_CATEGORIES", "LINEAGE_ITEMS", "lineage", "person", "faith"],
  ["book-of-allah", "bookOfAllah", "BOOK_CATEGORIES", "BOOK_ITEMS", "book", "book", "faith"],
  ["sabr-shukr", "sabrShukr", "SABR_CATEGORIES", "SABR_ITEMS", "sabr", "heart", "life"],
  ["knowledge-wisdom", "knowledgeWisdom", "KNOWLEDGE_CATEGORIES", "KNOWLEDGE_ITEMS", "knowledge", "book", "life"],
  ["tawakkul", "tawakkul", "TAWAKKUL_CATEGORIES", "TAWAKKUL_ITEMS", "tawakkul", "heart", "faith"],
  // New pages added 2026-06-08 — faith topics and prophet stories.
  ["jinn-shaytan", "jinnShaytan", "JINN_CATEGORIES", "JINN_ITEMS", "jinn", "alert", "faith"],
  ["angels-quran", "angelsQuran", "ANGELS_CATEGORIES", "ANGELS_ITEMS", "angels", "star", "faith"],
  ["heart-quran", "heartQuran", "HEART_CATEGORIES", "HEART_ITEMS", "heart", "heart", "faith"],
  ["death-barzakh", "deathBarzakh", "DEATH_CATEGORIES", "DEATH_ITEMS", "death", "scroll", "faith"],
  ["story-yusuf", "storyYusuf", "YUSUF_CATEGORIES", "YUSUF_ITEMS", "yusuf", "scroll", "faith"],
  ["story-musa", "storyMusa", "MUSA_CATEGORIES", "MUSA_ITEMS", "musa", "scroll", "faith"],
  ["story-ibrahim", "storyIbrahim", "IBRAHIM_CATEGORIES", "IBRAHIM_ITEMS", "ibrahim", "scroll", "faith"],
  ["people-cave", "peopleCave", "CAVE_CATEGORIES", "CAVE_ITEMS", "cave", "book", "faith"],
  ["modesty-hijab", "modestyHijab", "MODESTY_CATEGORIES", "MODESTY_ITEMS", "modesty", "person", "life"],
  ["arrogance-pride", "arrogancePride", "ARROGANCE_CATEGORIES", "ARROGANCE_ITEMS", "arrogance", "alert", "life"],
  ["backbiting-slander", "backbitingSlander", "BACKBITING_CATEGORIES", "BACKBITING_ITEMS", "backbiting", "alert", "life"],
];

/** Pull a balanced `[ ... ]` array literal that follows `export const <VAR>` and return its JS value. */
function extractArray(src, varName) {
  const re = new RegExp(`export const ${varName}\\b[^=]*=\\s*`);
  const m = re.exec(src);
  if (!m) throw new Error(`missing ${varName}`);
  let i = m.index + m[0].length;
  if (src[i] !== "[") throw new Error(`${varName}: expected [ at ${i}`);
  let depth = 0, end = -1;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (c === "[") depth++;
    else if (c === "]") { depth--; if (depth === 0) { end = j + 1; break; } }
  }
  if (end < 0) throw new Error(`${varName}: unbalanced []`);
  const lit = src.slice(i, end);
  return vm.runInNewContext(`(${lit})`);
}

function readWebData(file) {
  return fs.readFileSync(path.join(WEB, "data", `${file}.ts`), "utf8");
}

// ---- load web English catalog ----
const webEn = JSON.parse(fs.readFileSync(path.join(WEB, "i18n/locales/English.json"), "utf8"));

const collected = {}; // namespace -> i18n keys to copy
const collections = [];
const faithIds = [];
const lifeIds = [];

for (const [routeId, file, catsVar, itemsVar, ns, icon, group] of STD) {
  const src = readWebData(file);
  const cats = extractArray(src, catsVar);
  const items = extractArray(src, itemsVar);

  // copy every <ns>.* key from web English.json
  for (const k of Object.keys(webEn)) {
    if (k === `${ns}.title` || k === `${ns}.subtitle` || k === `${ns}.sourceNote` ||
        k.startsWith(`${ns}.cat.`) || k.startsWith(`${ns}.i.`) || k === `${ns}.trust`) {
      collected[k] = webEn[k];
    }
  }

  // mobile items: web {id,category,refs,title,shortLabel,tags?,type?,severity?,mainRefs?}
  const mItems = items.map((it) => {
    const o = { id: it.id, title: it.title, category: it.category, refs: it.refs };
    if (it.mainRefs) o.mainRefs = it.mainRefs;
    if (it.tags) o.tags = it.tags;
    o.desc = it.shortLabel;
    if (it.note) o.note = it.note;
    if (it.type) o.type = it.type;
    if (it.severity) o.severity = it.severity;
    return o;
  });
  const mCats = cats.map((c) => ({ id: c.id, title: c.title }));

  collections.push({
    routeId, ns, icon,
    title: webEn[`${ns}.title`] ?? routeId,
    subtitle: webEn[`${ns}.subtitle`] ?? "",
    sourceNote: webEn[`${ns}.sourceNote`] ?? "",
    items: mItems,
    categories: mCats,
  });
  (group === "faith" ? faithIds : lifeIds).push(routeId);
}

// ---- names-of-allah (special Asma shape; English-only, like the web component) ----
const namesSrc = readWebData("namesOfAllah");
const names = extractArray(namesSrc, "ALLAH_NAMES");
const slug = (tr) => tr.toLowerCase().replace(/[^a-z0-9]+/g, "") || "name";
const seen = new Map();
const nameItems = names.map((n) => {
  let id = slug(n.tr);
  const c = (seen.get(id) ?? 0) + 1; seen.set(id, c);
  if (c > 1) id = `${id}${c}`;
  const o = { id, title: n.tr, arName: n.ar, category: "all", refs: n.refs ?? [], desc: n.mean };
  if (n.hadithRef) o.note = n.hadithRef;
  return o;
});

// ---- emit refDataMore.gen.ts ----
const j = (v) => JSON.stringify(v);
let out = `// AUTO-GENERATED by scripts/port-more-topics.mjs — do not edit by hand.
// Ported verbatim from the AskQuran web frontend's curated datasets
// (frontend/src/data/*). Display strings are the English source-of-truth; the
// mobile i18n engine overlays per-locale catalogs and falls back to English.
// Every passage's Arabic + translation (+ stored tafsir) loads VERBATIM from the
// backend at view time — none of that text is stored here. No generated content.

import type { Collection, RefCardItem, Category } from "./refData";

const IC = {
  hands: '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/>',
  person: '<circle cx="12" cy="8" r="3.4"/><path d="M5 21v-1.5a7 7 0 0 1 14 0V21"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v16h5.5A2.5 2.5 0 0 1 20 21.5z"/>',
  scroll: '<path d="M6 3h9l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M9 9h6M9 13h6M9 17h4"/>',
  alert: '<path d="M12 3l9 16H3z"/><line x1="12" y1="9" x2="12" y2="14"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/>',
  heart: '<path d="M12 21s-6.5-4.2-9-8.5C1.4 9.6 2.7 6 6 6c1.9 0 3.2 1.1 4 2.3C10.8 7.1 12.1 6 14 6c3.3 0 4.6 3.6 3 6.5-2.5 4.3-9 8.5-9 8.5z"/>',
  scales: '<path d="M12 3v18"/><path d="M5 7h14"/><path d="M7 7l-3 7a3 3 0 0 0 6 0z"/><path d="M17 7l-3 7a3 3 0 0 0 6 0z"/>',
  star: '<path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6L5.7 21 8 14 2 9.4h7.6z"/>',
};

`;

for (const c of collections) {
  const cid = c.ns.toUpperCase().replace(/[^A-Z0-9]/g, "");
  out += `const ${cid}_CATEGORIES: Category[] = ${j(c.categories)};\n`;
  out += `const ${cid}_ITEMS: RefCardItem[] = ${j(c.items)};\n\n`;
}

// names
out += `const NAMES_ITEMS: RefCardItem[] = ${j(nameItems)};\n\n`;

out += `export const MORE_COLLECTIONS: Collection[] = [\n`;
for (const c of collections) {
  const cid = c.ns.toUpperCase().replace(/[^A-Z0-9]/g, "");
  out += `  { id: ${j(c.routeId)}, ns: ${j(c.ns)}, kind: "ref", eyebrow: "From the Quran", title: ${j(c.title)}, subtitle: ${j(c.subtitle)}, sourceNote: ${j(c.sourceNote)}, icon: IC.${c.icon}, items: ${cid}_ITEMS, categories: ${cid}_CATEGORIES, showTafsir: true },\n`;
}
// names-of-allah collection (special kind)
out += `  { id: "names-of-allah", ns: "names", kind: "names", eyebrow: "From the Quran", title: "Names of Allah", subtitle: "The Most Beautiful Names of Allah (Asma al-Husna), each anchored to where it appears in the Quran.", sourceNote: "Names shown as they appear in the Quran as name (ism) forms. Names from the hadith tradition are marked with their source.", icon: IC.star, items: NAMES_ITEMS, categories: [], showTafsir: false, namesGrid: true },\n`;
out += `];\n\n`;

out += `export const FAITH_GROUP_IDS = ["names-of-allah", ${faithIds.map(j).join(", ")}, "duas", "quranic-parables", "prophet-stories"] as const;\n`;
// Note: ordering aligned to the web NavMore FAITH menu below in library.tsx.
out += `export const LIFE_GROUP_IDS = [${lifeIds.map(j).join(", ")}] as const;\n`;

fs.writeFileSync(path.join(MOBILE, "src/design/refDataMore.gen.ts"), out);

// ---- merge i18n keys into mobile English.json ----
const mEnPath = path.join(MOBILE, "src/i18n/locales/English.json");
const mEn = JSON.parse(fs.readFileSync(mEnPath, "utf8"));
let added = 0;
for (const [k, v] of Object.entries(collected)) {
  if (!(k in mEn)) { mEn[k] = v; added++; }
}
fs.writeFileSync(mEnPath, JSON.stringify(mEn, null, 2) + "\n");

console.log(`collections: ${collections.length} std + names(${nameItems.length})`);
console.log(`i18n keys copied: ${Object.keys(collected).length} (newly added: ${added})`);
console.log(`faith new ids: ${faithIds.join(", ")}`);
console.log(`life new ids: ${lifeIds.join(", ")}`);
