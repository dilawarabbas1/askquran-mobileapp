// Quran Facts data — ported verbatim from the web frontend's quranFacts.ts so
// the mobile Facts page matches the web's 9 tabs. Source-backed reference data
// only (Tanzil metadata + direct ayah references); no interpretation. Display
// strings are the English source-of-truth (the web overlays i18n on the same).
//
// Surah metadata itself lives in ./data (SURAHS) and is reused here.

import { SURAHS } from "./data";

export interface Metric { n: string; ar: string; lbl: string; desc: string }
export interface HierNode { nm: string; ar: string; ds: string; lvl: number }
export interface SourceItem { name: string; prov: string; url: string }
export interface Topic { id: string; title: string; desc: string; refs: string[]; cat: string }
export interface MentionItem {
  name: string; refs: string[]; total?: number; totalLabel?: string;
  forms?: [string, number][]; related?: [string, number, string][];
}
export interface ProphetMention {
  n: string; ar: string; total: number;
  direct: [string, number][]; related: [string, number, string][]; combinedNote?: boolean;
}
export interface PunishmentGroup {
  title: string; desc: string;
  items: { name: string; context: string; summary: string; refs: string[]; chips: string[]; tags: string[] }[];
}
export interface QuranTermMention {
  id: string; name: string; arabicTerms: string[]; group: string; refs: string[]; note?: string;
}

/* ---------- surah name lookup (from SURAHS: [num, ar, name, cnt, place, order]) ---------- */
export const SURAH_NAME = new Map<number, { name: string; ar: string }>(
  SURAHS.map((r) => [r[0], { name: r[2], ar: r[1] }]),
);

/* ---------- Structure ---------- */
export const METRICS: Metric[] = [
  { n: "114", ar: "١١٤", lbl: "Surahs", desc: "Chapters of the Quran" },
  { n: "6,236", ar: "", lbl: "Ayahs", desc: "Verses across all surahs" },
  { n: "30", ar: "٣٠", lbl: "Juz", desc: "Traditional 30-part division" },
  { n: "60", ar: "٦٠", lbl: "Hizb", desc: "Each juz splits into two hizb" },
  { n: "240", ar: "", lbl: "Rubʿ al-Hizb", desc: "Quarter-hizb divisions" },
  { n: "15", ar: "١٥", lbl: "Sajdah Ayahs", desc: "Verses of prostration" },
];

export const HIER: HierNode[] = [
  { nm: "Quran", ar: "القرآن", ds: "The complete revealed text", lvl: 0 },
  { nm: "Surah", ar: "سورة", ds: "114 chapters", lvl: 1 },
  { nm: "Ayah", ar: "آية", ds: "6,236 verses", lvl: 2 },
  { nm: "Juz", ar: "جزء", ds: "30 equal parts for recitation", lvl: 1 },
  { nm: "Hizb", ar: "حزب", ds: "60 — two per juz", lvl: 2 },
  { nm: "Rubʿ al-Hizb", ar: "ربع الحزب", ds: "240 — four per hizb", lvl: 3 },
];

export const SOURCES: SourceItem[] = [
  { name: "Tanzil Quran Metadata", prov: "Surah names, ayah counts, and the core structural divisions of the Quran text.", url: "https://tanzil.net" },
  { name: "Tanzil Revelation Order", prov: "The traditional chronological order in which surahs were revealed.", url: "https://tanzil.net" },
  { name: "Quranic Arabic Corpus", prov: "Word-level Arabic data, morphology, and verse references for the Quran text.", url: "https://corpus.quran.com" },
  { name: "Quran Foundation / Quran.com", prov: "Verse, translation, and tafsir metadata used to display content with attribution.", url: "https://quran.com" },
];

export const INTEGRITY: { t: string; d: string }[] = [
  { t: "Verbatim text", d: "Quran Arabic is served exactly as stored from the Tanzil source — never altered." },
  { t: "Stored translation & tafsir", d: "Translations and tafsir are shown as stored, with attribution — never generated." },
  { t: "References, not claims", d: "Topics and facts are anchored to ayah references, not interpretive conclusions." },
  { t: "Traceable", d: "Every entry can be traced back to its surah:ayah reference and source." },
];

export const SAJDAH: string[] = ["7:206", "13:15", "16:50", "17:109", "19:58", "22:18", "22:77", "25:60", "27:26", "32:15", "38:24", "41:38", "53:62", "84:21", "96:19"];

export const MUQATTAAT: [number, string, string][] = [
  [2, "الم", "Alif Lam Mim"], [3, "الم", "Alif Lam Mim"], [7, "المص", "Alif Lam Mim Sad"],
  [10, "الر", "Alif Lam Ra"], [11, "الر", "Alif Lam Ra"], [12, "الر", "Alif Lam Ra"],
  [13, "المر", "Alif Lam Mim Ra"], [14, "الر", "Alif Lam Ra"], [15, "الر", "Alif Lam Ra"],
  [19, "كهيعص", "Kaf Ha Ya 'Ayn Sad"], [20, "طه", "Ta Ha"], [26, "طسم", "Ta Sin Mim"],
  [27, "طس", "Ta Sin"], [28, "طسم", "Ta Sin Mim"], [29, "الم", "Alif Lam Mim"],
  [30, "الم", "Alif Lam Mim"], [31, "الم", "Alif Lam Mim"], [32, "الم", "Alif Lam Mim"],
  [36, "يس", "Ya Sin"], [38, "ص", "Sad"], [40, "حم", "Ha Mim"], [41, "حم", "Ha Mim"],
  [42, "حم عسق", "Ha Mim · 'Ayn Sin Qaf"], [43, "حم", "Ha Mim"], [44, "حم", "Ha Mim"],
  [45, "حم", "Ha Mim"], [46, "حم", "Ha Mim"], [50, "ق", "Qaf"], [68, "ن", "Nun"],
];

/* ---------- Topics ---------- */
export const TOPIC_CATEGORIES: { id: string; title: string }[] = [
  { id: "worship", title: "Worship" },
  { id: "family", title: "Family & Society" },
  { id: "wealth", title: "Wealth & Justice" },
  { id: "character", title: "Character" },
  { id: "prohibitions", title: "Prohibitions" },
  { id: "afterlife", title: "Afterlife & Accountability" },
];

export const TOPICS: Topic[] = [
  { id: "prayer", cat: "worship", title: "Prayer / Salah", desc: "Quranic guidance on establishing prayer, its times, and steadfastness in it.", refs: ["2:238", "4:103", "17:78", "29:45"] },
  { id: "hajj", cat: "worship", title: "Hajj / Pilgrimage", desc: "Quranic guidance on pilgrimage to the Sacred House and its rites.", refs: ["3:96-97", "2:196-203", "22:27-29"] },
  { id: "fasting", cat: "worship", title: "Fasting", desc: "Quranic guidance on fasting, Ramadan, exemptions, and related rulings.", refs: ["2:183-187"] },
  { id: "repentance", cat: "worship", title: "Repentance", desc: "Quranic guidance on turning back to Allah and not despairing of His mercy.", refs: ["39:53-55", "25:70-71", "66:8"] },
  { id: "mercy", cat: "worship", title: "Mercy of Allah", desc: "Quran verses on the vastness of Allah's mercy, which He has prescribed for Himself.", refs: ["7:156", "6:54", "39:53"] },
  { id: "marriage", cat: "family", title: "Marriage", desc: "Quranic guidance on marriage, mutual rights, and tranquility between spouses.", refs: ["4:19-21", "30:21", "24:32"] },
  { id: "marriageDegrees", cat: "family", title: "Forbidden marriage degrees", desc: "Quran verses naming the relatives a person may not marry.", refs: ["4:22-24"] },
  { id: "womensRights", cat: "family", title: "Women's rights", desc: "Quranic guidance on the rights of women in family and property.", refs: ["4:19", "4:32", "2:228"] },
  { id: "children", cat: "family", title: "Children and provision", desc: "Quranic guidance on caring for children and not killing them out of fear of poverty.", refs: ["17:31", "6:151"] },
  { id: "kinship", cat: "family", title: "Relatives / kinship", desc: "Quranic guidance on upholding ties of kinship and giving relatives their due.", refs: ["4:36", "16:90", "17:26"] },
  { id: "orphans", cat: "family", title: "Orphans and their property", desc: "Quranic guidance on protecting orphans and safeguarding their property.", refs: ["4:2-6", "4:10", "2:220"] },
  { id: "inheritance", cat: "family", title: "Inheritance", desc: "Quranic guidance on inheritance shares and family rights.", refs: ["4:7", "4:11", "4:12", "4:176"] },
  { id: "divorce", cat: "family", title: "Divorce", desc: "Quranic guidance on divorce, waiting periods, fairness, and family responsibility.", refs: ["2:226-232", "65:1-7"] },
  { id: "parents", cat: "family", title: "Parents", desc: "Quranic guidance on kindness, respect, gratitude, and boundaries with parents.", refs: ["17:23-24", "31:14-15"] },
  { id: "wealthRights", cat: "wealth", title: "Wealth and property rights", desc: "Quranic guidance against consuming others' wealth unjustly.", refs: ["2:188", "4:29"] },
  { id: "debt", cat: "wealth", title: "Debt and contracts", desc: "Quranic guidance on recording debts and honouring contracts.", refs: ["2:282-283"] },
  { id: "fairTrade", cat: "wealth", title: "Fair trade / weights and measures", desc: "Quranic guidance on honest weights, measures, and fair dealing.", refs: ["83:1-6", "11:84-85", "26:181-183"] },
  { id: "riba", cat: "wealth", title: "Riba / usury", desc: "Quran verses prohibiting riba (usury/interest).", refs: ["2:275-281", "3:130"] },
  { id: "theft", cat: "wealth", title: "Theft and robbery", desc: "Quran verses on theft, unlawful taking, and corruption in the land.", refs: ["5:38-39", "5:33-34"] },
  { id: "charity", cat: "wealth", title: "Charity & Zakat", desc: "Quranic guidance on giving, purification of wealth, helping the needy, and social responsibility.", refs: ["2:110", "2:261-274", "2:267", "2:271", "9:60", "9:103"] },
  { id: "justice", cat: "wealth", title: "Justice", desc: "Quranic guidance on standing firmly for justice, even against oneself or one's own group.", refs: ["4:58", "4:135", "5:8"] },
  { id: "moralConduct", cat: "character", title: "Moral conduct", desc: "Quranic guidance gathering core commands of upright conduct.", refs: ["17:23-39", "31:12-19"] },
  { id: "backbiting", cat: "character", title: "Backbiting, mockery, suspicion", desc: "Quran verses against mockery, backbiting, and suspicion.", refs: ["49:11-12"] },
  { id: "truthfulSpeech", cat: "character", title: "Truthful speech", desc: "Quranic guidance on being truthful and standing with the truthful.", refs: ["9:119", "33:70-71"] },
  { id: "patience", cat: "character", title: "Patience", desc: "Quranic guidance on patience and perseverance through trials.", refs: ["2:153-157", "3:200", "103:1-3"] },
  { id: "forgiveness", cat: "character", title: "Forgiveness and pardoning", desc: "Quranic guidance on pardoning others and restraining anger.", refs: ["3:134", "42:40", "24:22"] },
  { id: "gratitude", cat: "character", title: "Gratitude", desc: "Quranic guidance on gratitude to Allah for His blessings.", refs: ["14:7", "31:12", "2:152"] },
  { id: "tawakkul", cat: "character", title: "Tawakkul / reliance on Allah", desc: "Quranic guidance on placing trust and reliance in Allah.", refs: ["3:159", "65:3", "11:123"] },
  { id: "intoxicants", cat: "prohibitions", title: "Intoxicants and gambling", desc: "Quran verses on intoxicants and gambling.", refs: ["2:219", "5:90-91"] },
  { id: "sanctityOfLife", cat: "prohibitions", title: "Sanctity of life", desc: "Quran verses on the sanctity of human life.", refs: ["5:32", "6:151", "17:31-33", "25:68"] },
  { id: "zina", cat: "prohibitions", title: "Zina / unlawful relations", desc: "Quran verses prohibiting unlawful sexual relations.", refs: ["17:32", "24:2"] },
  { id: "oppression", cat: "prohibitions", title: "Oppression and wrongdoing", desc: "Quran verses warning against oppression and wrongdoing.", refs: ["14:42", "42:39-43", "11:18"] },
  { id: "hereafter", cat: "afterlife", title: "Hereafter and resurrection", desc: "Quran verses on resurrection and the life to come.", refs: ["75:1-15", "99:1-8", "22:5-7"] },
  { id: "dayOfJudgement", cat: "afterlife", title: "Day of Judgement", desc: "Quran verses on the Day of Judgement and accountability.", refs: ["1:4", "82:17-19", "99:6-8"] },
  { id: "paradise", cat: "afterlife", title: "Paradise", desc: "Quran verses describing Paradise and its people.", refs: ["3:133-136", "47:15", "56:10-40"] },
  { id: "hellfire", cat: "afterlife", title: "Hellfire", desc: "Quran verses warning of the Fire and its causes.", refs: ["4:56", "67:6-11", "74:26-31"] },
];

/* ---------- Mentions (Prophets · Nations · Angels · Scriptures · Places) ---------- */
export const MENTION_CATS: { id: string; title: string }[] = [
  { id: "prophets", title: "Prophets" },
  { id: "nations", title: "Nations & Communities" },
  { id: "angels", title: "Angels" },
  { id: "scriptures", title: "Scriptures" },
  { id: "places", title: "Places" },
];

export const MENTIONS: Record<string, MentionItem[]> = {
  prophets: [
    { name: "Adam", refs: ["2:31-37", "3:33", "7:11-27", "20:115-123"] },
    { name: "Nuh", refs: ["7:59-64", "11:25-48", "23:23-30", "71:1-28"] },
    { name: "Ibrahim", refs: ["2:124-132", "6:74-83", "14:35-41", "21:51-73", "37:83-113"] },
    { name: "Lut", refs: ["7:80-84", "11:77-83", "26:160-175", "29:28-35"] },
    { name: "Ismail", refs: ["2:125-129", "19:54-55", "37:100-107"] },
    { name: "Ishaq", refs: ["11:71-73", "21:72-73", "37:112-113"] },
    { name: "Yaqub", refs: ["2:132-133", "12:6", "12:38", "12:84-87"] },
    { name: "Yusuf", refs: ["12:4-101"] },
    { name: "Musa", refs: ["2:49-61", "7:103-137", "20:9-98", "28:3-46"] },
    { name: "Harun", refs: ["20:29-36", "20:90-94", "25:35", "37:114-122"] },
    { name: "Dawud", refs: ["2:251", "21:78-80", "34:10-11", "38:17-26"] },
    { name: "Sulayman", refs: ["21:78-82", "27:15-44", "34:12-14", "38:30-40"] },
    { name: "Yunus", refs: ["10:98", "21:87-88", "37:139-148"] },
    { name: "Zakariya", refs: ["3:37-41", "19:2-15", "21:89-90"] },
    { name: "Yahya", refs: ["3:39", "19:7-15"] },
    { name: "Isa", refs: ["3:45-55", "5:110-118", "19:16-36", "61:6"] },
    { name: "Muhammad", refs: ["3:144", "33:40", "47:2", "48:29"] },
    { name: "Ilyas", refs: ["6:85", "37:123", "37:130"] },
    { name: "Al-Yasa", refs: ["6:86", "38:48"] },
  ],
  nations: [
    { name: "People of Nuh", refs: ["7:59-64", "11:25-48", "71:1-28"], total: 14, forms: [["قوم نوح", 14]] },
    { name: "Aad", refs: ["7:65-72", "11:50-60", "26:123-140", "41:15-16", "69:6-8"], total: 24, forms: [["عاد", 24]] },
    { name: "Thamud", refs: ["7:73-79", "11:61-68", "26:141-159", "91:11-15"], total: 26, forms: [["ثمود", 26]] },
    { name: "People of Lut", refs: ["7:80-84", "11:77-83", "26:160-175", "29:28-35"], total: 8, forms: [["قوم لوط", 7], ["إخوان لوط", 1]] },
    { name: "People of Madyan", refs: ["7:85-93", "11:84-95", "26:176-191"], total: 6, forms: [["مدين", 6]], related: [["أصحاب الأيكة", 4, "related form"]] },
    { name: "Pharaoh and his people", refs: ["7:103-137", "10:75-92", "20:43-79", "28:3-42"], total: 74, totalLabel: "Pharaoh (فرعون) mentions", forms: [["فرعون", 74]], related: [["آل فرعون", 14, "group phrase"], ["قوم فرعون", 4, "group phrase"]] },
    { name: "Children of Israel", refs: ["2:40-61", "5:20-26", "17:2-8", "20:80-98"], total: 40, forms: [["بني إسرائيل", 40]], related: [["إسرائيل", 3, "standalone form"]] },
    { name: "People of the Cave", refs: ["18:9-26"] },
    { name: "People of the Sabbath", refs: ["2:65-66", "4:154", "7:163-166"], total: 1, forms: [["أصحاب السبت", 1]], related: [["السبت", 5, "related form"]] },
    { name: "People of the Garden", refs: ["68:17-33"], total: 1, forms: [["أصحاب الجنة", 1]] },
    { name: "People of Ukhdud", refs: ["85:4-10"] },
    { name: "People of Saba", refs: ["34:15-19"], total: 2, forms: [["سبأ", 2]] },
    { name: "Companions of the Elephant", refs: ["105:1-5"], total: 1, forms: [["أصحاب الفيل", 1]] },
    { name: "People of the Town", refs: ["36:13-29"], total: 1, forms: [["أصحاب القرية", 1]] },
    { name: "People of Rass", refs: ["25:38-39", "50:12-14"], total: 2, forms: [["أصحاب الرس", 2]] },
    { name: "People of Tubba", refs: ["44:37", "50:14"], total: 2, forms: [["قوم تبع", 2]] },
  ],
  angels: [
    { name: "Jibril", refs: ["2:97-98", "66:4"], total: 3, forms: [["جبريل", 3]] },
    { name: "Mikail", refs: ["2:98"], total: 1, forms: [["ميكال", 1]] },
    { name: "Malik", refs: ["43:77"], total: 1, forms: [["مالك", 1]] },
    { name: "Harut and Marut", refs: ["2:102"], total: 2, forms: [["هاروت", 1], ["ماروت", 1]] },
    { name: "Angels generally", refs: ["2:30-34", "3:39-42", "8:9-12", "16:2", "35:1", "66:6"], forms: [["الملائكة", 53], ["ملائكة", 15], ["ملك / ملكا", 11], ["ملكين", 1], ["الملكين", 1]] },
  ],
  scriptures: [
    { name: "Quran", refs: ["2:2", "2:185", "10:37", "17:9", "56:77-80"], total: 68, forms: [["القرآن", 50], ["قرآن", 8], ["قرآنًا", 10]] },
    { name: "Tawrat", refs: ["3:3", "5:44", "5:68"], total: 18, forms: [["التوراة", 18]] },
    { name: "Injil", refs: ["3:3", "5:46", "5:68", "57:27"], total: 12, forms: [["الإنجيل", 12]] },
    { name: "Zabur", refs: ["4:163", "17:55", "21:105"], total: 3, forms: [["الزبور", 1], ["زبورًا", 2]] },
    { name: "Suhuf of Ibrahim and Musa", refs: ["53:36-37", "87:18-19"], total: 6, forms: [["الصحف", 3], ["صحف", 3]], related: [["صحف إبراهيم", 1, "phrase"], ["صحف موسى", 1, "phrase"]] },
  ],
  places: [
    { name: "Makkah / Bakkah", refs: ["3:96", "48:24"], total: 2, forms: [["مكة", 1], ["بكة", 1]] },
    { name: "Masjid al-Haram", refs: ["2:144", "2:149-150", "2:196", "9:28"], total: 15, forms: [["المسجد الحرام", 15]] },
    { name: "Kaaba / Sacred House", refs: ["2:125-127", "5:97", "22:26-29"], forms: [["الكعبة", 2], ["البيت الحرام", 2], ["البيت العتيق", 2], ["البيت", 7]] },
    { name: "Safa and Marwah", refs: ["2:158"], total: 2, forms: [["الصفا", 1], ["المروة", 1]] },
    { name: "Mount Sinai / Tur", refs: ["2:63", "7:143", "19:52", "23:20", "95:2"], total: 10, forms: [["الطور", 8], ["طور سيناء", 1], ["طور سينين", 1]] },
    { name: "Badr", refs: ["3:123"], total: 1, forms: [["بدر", 1]] },
    { name: "Hunayn", refs: ["9:25"], total: 1, forms: [["حنين", 1]] },
    { name: "Yathrib", refs: ["33:13"], total: 1, forms: [["يثرب", 1]] },
    { name: "Egypt", refs: ["10:87", "12:21", "12:99"], total: 5, forms: [["مصر", 5]] },
    { name: "Madyan", refs: ["7:85", "11:84", "28:22-28"], total: 10, forms: [["مدين", 10]] },
  ],
};

export const PROPHETS: ProphetMention[] = [
  { n: "Adam", ar: "آدم", total: 25, direct: [["آدم", 25]], related: [] },
  { n: "Idris", ar: "إدريس", total: 2, direct: [["إدريس", 2]], related: [] },
  { n: "Nuh", ar: "نوح", total: 43, direct: [["نوح", 43]], related: [] },
  { n: "Hud", ar: "هود", total: 7, direct: [["هود", 7]], related: [] },
  { n: "Salih", ar: "صالح", total: 9, direct: [["صالح", 9]], related: [] },
  { n: "Ibrahim", ar: "إبراهيم", total: 69, direct: [["إبراهيم", 69]], related: [] },
  { n: "Lut", ar: "لوط", total: 27, direct: [["لوط", 27]], related: [] },
  { n: "Ismail", ar: "إسماعيل", total: 12, direct: [["إسماعيل", 12]], related: [] },
  { n: "Ishaq", ar: "إسحاق", total: 17, direct: [["إسحاق", 17]], related: [] },
  { n: "Yaqub", ar: "يعقوب", total: 16, direct: [["يعقوب", 16]], related: [] },
  { n: "Yusuf", ar: "يوسف", total: 27, direct: [["يوسف", 27]], related: [] },
  { n: "Ayyub", ar: "أيوب", total: 4, direct: [["أيوب", 4]], related: [] },
  { n: "Shuayb", ar: "شعيب", total: 11, direct: [["شعيب", 11]], related: [] },
  { n: "Musa", ar: "موسى", total: 136, direct: [["موسى", 136]], related: [] },
  { n: "Harun", ar: "هارون", total: 20, direct: [["هارون", 20]], related: [] },
  { n: "Dhul-Kifl", ar: "ذا الكفل", total: 2, direct: [["ذا الكفل", 2]], related: [] },
  { n: "Dawud", ar: "داوود", total: 16, direct: [["داوود", 16]], related: [] },
  { n: "Sulayman", ar: "سليمان", total: 17, direct: [["سليمان", 17]], related: [] },
  { n: "Ilyas", ar: "إلياس", total: 2, direct: [["إلياس", 2]], related: [["إل ياسين", 1, "variant"]] },
  { n: "Al-Yasa", ar: "اليسع", total: 2, direct: [["اليسع", 2]], related: [] },
  { n: "Yunus", ar: "يونس", total: 4, direct: [["يونس", 4]], related: [["ذا النون", 1, "related"], ["صاحب الحوت", 1, "related"]] },
  { n: "Zakariya", ar: "زكريا", total: 7, direct: [["زكريا", 7]], related: [] },
  { n: "Yahya", ar: "يحيى", total: 5, direct: [["يحيى", 5]], related: [] },
  { n: "Isa", ar: "عيسى", total: 25, direct: [["عيسى", 25]], related: [["عيسى ابن مريم", 16, "phrase"], ["ابن مريم", 6, "standalone"], ["المسيح", 9, "related"]], combinedNote: true },
  { n: "Muhammad", ar: "محمد", total: 5, direct: [["محمد", 4], ["أحمد", 1]], related: [] },
];

/* ---------- Divine Punishment ---------- */
export const PUNISHMENT_FILTERS: { id: string; title: string }[] = [
  { id: "all", title: "All reasons" },
  { id: "rejected-messengers", title: "Rejected messengers" },
  { id: "rejected-signs", title: "Rejected signs" },
  { id: "corruption", title: "Corruption" },
  { id: "oppression", title: "Oppression" },
  { id: "arrogance", title: "Arrogance" },
  { id: "ingratitude", title: "Ingratitude" },
  { id: "transgression", title: "Transgression" },
];

export const PUNISHMENT: PunishmentGroup[] = [
  { title: "Rejecting Messengers and Warnings", desc: "Communities are repeatedly shown rejecting messengers, denying warnings, or refusing clear reminders.",
    items: [
      { name: "People of Nuh", context: "Nuh", summary: "They denied Nuh and rejected the warning.", refs: ["7:59-64", "11:25-49", "26:105-122", "54:9-16", "71:1-28"], chips: ["Denied messenger", "Rejected warning"], tags: ["rejected-messengers"] },
      { name: "People of the Town", context: "Messengers sent to a town", summary: "They rejected the messengers sent to them and were seized by a single blast.", refs: ["36:13-29"], chips: ["Rejected messengers", "Denied warning"], tags: ["rejected-messengers"] },
      { name: "People of Rass", context: "Mentioned among destroyed peoples", summary: "The Quran mentions them among peoples who denied messengers. Details are not expanded in the Quran.", refs: ["25:38-39", "50:12-14"], chips: ["Denied messengers", "Details not expanded"], tags: ["rejected-messengers"] },
      { name: "People of Tubba", context: "Mentioned among past peoples", summary: "The Quran mentions them among past peoples who denied.", refs: ["44:37", "50:14"], chips: ["Denied warning", "Details not expanded"], tags: ["rejected-messengers"] },
    ] },
  { title: "Rejecting Signs and Disobeying Messengers", desc: "The Quran links punishment to rejecting Allah's signs and disobeying messengers after guidance was made clear.",
    items: [
      { name: "Aad", context: "Hud", summary: "They rejected the signs of their Lord, disobeyed His messengers, and followed arrogant tyrants.", refs: ["7:65-72", "11:50-60", "26:123-140", "41:15-16", "69:6-8"], chips: ["Rejected signs", "Disobeyed messengers", "Arrogance"], tags: ["rejected-signs", "rejected-messengers", "arrogance"] },
      { name: "Thamud", context: "Salih", summary: "They denied Salih, rejected the sign of the she-camel, and transgressed.", refs: ["7:73-79", "11:61-68", "26:141-159", "54:23-31", "91:11-15"], chips: ["Denied messenger", "Rejected sign", "Transgressed"], tags: ["rejected-messengers", "rejected-signs", "transgression"] },
    ] },
  { title: "Corruption and Social Wrongdoing", desc: "The Quran mentions communities warned against corruption, cheating, and depriving people of their rights.",
    items: [
      { name: "People of Madyan", context: "Shuayb", summary: "They were warned not to decrease measure and scale, not to deprive people of their due, and not to spread corruption.", refs: ["7:85-93", "11:84-95", "26:176-191", "29:36-37"], chips: ["Cheating in measure", "Depriving people of rights", "Corruption"], tags: ["corruption"] },
      { name: "People of the Garden", context: "Surah Al-Qalam", summary: "They planned to harvest privately while withholding from the poor, then their garden was destroyed.", refs: ["68:17-33"], chips: ["Withholding from poor", "Greed", "Tested through loss"], tags: ["corruption"] },
    ] },
  { title: "Oppression and Arrogance", desc: "The Quran shows punishment for oppressive power, arrogance, and denial of clear signs.",
    items: [
      { name: "Pharaoh and his people", context: "Musa", summary: "They were arrogant, denied the signs, oppressed the Children of Israel, killed sons, and kept women alive.", refs: ["7:103-137", "10:75-92", "20:43-79", "28:3-42", "43:46-56"], chips: ["Arrogance", "Denied signs", "Oppression", "Killing sons"], tags: ["arrogance", "rejected-signs", "oppression"] },
      { name: "Companions of the Elephant", context: "Army against the Sacred House", summary: "The Quran says Allah made their plot go astray.", refs: ["105:1-5"], chips: ["Plot against the Sacred House", "Their plan was destroyed"], tags: ["oppression"] },
    ] },
  { title: "Open Indecency and Transgression", desc: "The Quran mentions communities punished after open indecency and transgression.",
    items: [
      { name: "People of Lut", context: "Lut", summary: "They committed open indecency and approached men with desire instead of women.", refs: ["7:80-84", "11:77-83", "26:160-175", "27:54-58", "29:28-35"], chips: ["Open indecency", "Sexual wrongdoing", "Corruption"], tags: ["transgression", "corruption"] },
    ] },
  { title: "Ingratitude After Blessings", desc: "The Quran mentions people who were given blessings but turned away.",
    items: [
      { name: "People of Saba", context: "Saba", summary: "They turned away after blessings were given to them.", refs: ["34:15-19"], chips: ["Turned away", "Ingratitude after blessings"], tags: ["ingratitude"] },
    ] },
  { title: "Breaking Command After Warning", desc: "The Quran mentions groups punished after knowingly transgressing a command.",
    items: [
      { name: "People of the Sabbath", context: "A group from Children of Israel", summary: "They transgressed concerning the Sabbath after being tested.", refs: ["2:65-66", "4:154", "7:163-166"], chips: ["Sabbath transgression", "Disobedience after warning"], tags: ["transgression"] },
    ] },
];

/* ---------- Plants / Animals / Natural Signs ---------- */
export const PLANT_GROUPS: { id: string; title: string }[] = [
  { id: "all", title: "All" }, { id: "fruits", title: "Fruits" }, { id: "trees", title: "Trees" }, { id: "plantFoods", title: "Plant Foods" },
];
export const PLANTS: QuranTermMention[] = [
  { id: "dates", name: "Dates / date-palm fruit", group: "fruits", arabicTerms: ["نخل", "نخيل", "نخلة"], refs: ["2:266", "6:99", "6:141", "13:4", "16:11", "16:67", "17:91", "18:32", "19:23", "19:25", "23:19", "36:34", "50:10", "55:11", "55:68"], note: "Some references mention the date-palm tree, its fruit, or date-palms in gardens." },
  { id: "grapes", name: "Grapes", group: "fruits", arabicTerms: ["أعناب", "عنب"], refs: ["2:266", "6:99", "13:4", "16:11", "16:67", "17:91", "18:32", "23:19", "36:34"] },
  { id: "olives", name: "Olives", group: "fruits", arabicTerms: ["زيتون", "زيتونة"], refs: ["6:99", "6:141", "16:11", "24:35", "95:1"], note: "24:35 mentions a blessed olive tree in the parable of light." },
  { id: "pomegranate", name: "Pomegranate", group: "fruits", arabicTerms: ["رمان"], refs: ["6:99", "6:141", "55:68"] },
  { id: "fig", name: "Fig", group: "fruits", arabicTerms: ["تين"], refs: ["95:1"] },
  { id: "fruitGeneral", name: "General fruit / fruits", group: "fruits", arabicTerms: ["فاكهة", "فواكه"], refs: ["23:19", "36:57", "37:42", "38:51", "43:73", "44:55", "52:22", "55:11", "55:52", "55:68", "56:20", "56:32", "77:42", "80:31"], note: "These references use general fruit wording rather than a specific named fruit." },
  { id: "datePalmTree", name: "Date palm", group: "trees", arabicTerms: ["نخل", "نخيل", "نخلة"], refs: ["2:266", "6:99", "6:141", "13:4", "16:11", "16:67", "17:91", "18:32", "19:23", "19:25", "20:71", "23:19", "26:148", "36:34", "50:10", "54:20", "55:11", "55:68", "69:7"], note: "This overlaps with dates because the Quran mentions date-palms as trees and in fruit/garden contexts." },
  { id: "oliveTree", name: "Olive tree", group: "trees", arabicTerms: ["زيتونة", "زيتون"], refs: ["6:99", "6:141", "16:11", "24:35", "95:1"] },
  { id: "lote", name: "Lote tree / Sidr", group: "trees", arabicTerms: ["سدر", "سدرة"], refs: ["34:16", "53:14", "53:16", "56:28"] },
  { id: "talh", name: "Talh", group: "trees", arabicTerms: ["طلح"], refs: ["56:29"], note: "Translations differ; some render it as layered banana, others as acacia or a thornless lote-like tree. No single botanical identification is forced." },
  { id: "gourd", name: "Gourd / Yaqtin", group: "trees", arabicTerms: ["يقطين"], refs: ["37:146"] },
  { id: "tamarisk", name: "Tamarisk / Athl", group: "trees", arabicTerms: ["أثل"], refs: ["34:16"] },
  { id: "khamt", name: "Khamt", group: "trees", arabicTerms: ["خمط"], refs: ["34:16"], note: "Often translated as bitter fruit/tree. The label is kept cautious." },
  { id: "zaqqum", name: "Zaqqum tree", group: "trees", arabicTerms: ["زقوم"], refs: ["37:62", "44:43", "56:52"] },
  { id: "treeGeneric", name: "Generic tree / trees", group: "trees", arabicTerms: ["شجرة", "شجر"], refs: ["2:35", "7:19", "7:20", "7:22", "14:24", "14:26", "16:10", "16:68", "20:120", "24:35", "27:60", "28:30", "31:27", "36:80", "37:62", "37:64", "37:146", "48:18", "56:52"], note: "These references use general tree wording or specific Quranic tree contexts." },
  { id: "cucumber", name: "Cucumber", group: "plantFoods", arabicTerms: ["قثاء"], refs: ["2:61"] },
  { id: "fum", name: "Fum", group: "plantFoods", arabicTerms: ["فوم"], refs: ["2:61"], note: "Translations differ; often rendered garlic, wheat, or grain. The label is kept cautious as “Fum”." },
  { id: "lentils", name: "Lentils", group: "plantFoods", arabicTerms: ["عدس"], refs: ["2:61"] },
  { id: "onions", name: "Onions", group: "plantFoods", arabicTerms: ["بصل"], refs: ["2:61"] },
  { id: "grain", name: "Grain / crops", group: "plantFoods", arabicTerms: ["حب", "زرع"], refs: ["6:99", "16:11", "18:32", "32:27", "36:33", "39:21", "50:9", "55:12", "78:15", "80:27"] },
  { id: "rayhan", name: "Rayhan / sweet plant", group: "plantFoods", arabicTerms: ["ريحان"], refs: ["55:12", "56:89"], note: "Often translated as basil, fragrant plant, or sweet-scented plant. The label is kept cautious." },
];

export const ANIMAL_GROUPS: { id: string; title: string }[] = [
  { id: "all", title: "All" }, { id: "livestock", title: "Livestock" }, { id: "animals", title: "Animals" }, { id: "birds", title: "Birds" }, { id: "seaLife", title: "Sea Life" }, { id: "insects", title: "Insects" }, { id: "other", title: "Other" },
];
export const ANIMALS: QuranTermMention[] = [
  { id: "cow", name: "Cow / heifer", group: "livestock", arabicTerms: ["بقرة"], refs: ["2:67-71"], note: "Mentioned in the account of the heifer in Surah Al-Baqarah." },
  { id: "calf", name: "Calf", group: "livestock", arabicTerms: ["عجل"], refs: ["2:51", "2:54", "7:148", "20:88"], note: "Mostly refers to the calf taken for worship by the people of Musa." },
  { id: "camel", name: "Camel", group: "livestock", arabicTerms: ["إبل", "ناقة", "جمل", "جمالت"], refs: ["6:144", "7:73", "11:64", "26:155", "54:27", "77:33", "88:17"], note: "Different terms are used, including the she-camel (نَاقَة) of Salih." },
  { id: "cattle", name: "Cattle / livestock", group: "livestock", arabicTerms: ["أنعام"], refs: ["6:142-144", "16:5", "22:28", "23:21", "36:71"], note: "The general term anʿām covers grazing livestock." },
  { id: "sheepGoat", name: "Sheep / goat", group: "livestock", arabicTerms: ["ضأن", "معز"], refs: ["6:143"], note: "Listed among the pairs of grazing livestock." },
  { id: "horse", name: "Horse", group: "animals", arabicTerms: ["خيل", "جياد"], refs: ["3:14", "8:60", "16:8", "38:31"] },
  { id: "mule", name: "Mule", group: "animals", arabicTerms: ["بغال"], refs: ["16:8"] },
  { id: "donkey", name: "Donkey", group: "animals", arabicTerms: ["حمير", "حمار"], refs: ["16:8", "31:19", "62:5"] },
  { id: "dog", name: "Dog", group: "animals", arabicTerms: ["كلب"], refs: ["7:176", "18:18", "18:22"], note: "Includes the dog of the companions of the cave." },
  { id: "wolf", name: "Wolf", group: "animals", arabicTerms: ["ذئب"], refs: ["12:13", "12:14", "12:17"], note: "Mentioned in the account of Yusuf." },
  { id: "elephant", name: "Elephant", group: "animals", arabicTerms: ["فيل"], refs: ["105:1"], note: "Referenced in the account of the companions of the elephant." },
  { id: "snake", name: "Snake / serpent", group: "animals", arabicTerms: ["حية", "ثعبان", "جان"], refs: ["7:107", "20:20", "26:32", "27:10", "28:31"], note: "Different terms are used; some occur in the account of Musa's staff." },
  { id: "bird", name: "Bird / birds", group: "birds", arabicTerms: ["طير", "طائر"], refs: ["2:260", "3:49", "5:110", "12:36", "16:79", "24:41", "27:16", "67:19"], note: "General references to birds across several contexts." },
  { id: "hoopoe", name: "Hoopoe", group: "birds", arabicTerms: ["هدهد"], refs: ["27:20"], note: "Mentioned in the account of Sulayman." },
  { id: "crow", name: "Crow / raven", group: "birds", arabicTerms: ["غراب"], refs: ["5:31"], note: "Mentioned in the account of the two sons of Adam." },
  { id: "fishWhale", name: "Fish / whale", group: "seaLife", arabicTerms: ["حوت", "حيتان", "نون", "سمك"], refs: ["7:163", "18:61", "18:63", "21:87", "37:142", "68:48"], note: "Includes the fish associated with Musa's journey and Yunus. Identification as fish or whale varies by translation." },
  { id: "bee", name: "Bee", group: "insects", arabicTerms: ["نحل"], refs: ["16:68-69"], note: "Surah An-Nahl is named after the bee." },
  { id: "ant", name: "Ant", group: "insects", arabicTerms: ["نملة", "نمل"], refs: ["27:18"], note: "Mentioned in the valley of the ants in the account of Sulayman." },
  { id: "spider", name: "Spider", group: "insects", arabicTerms: ["عنكبوت"], refs: ["29:41"], note: "Referenced in a parable about frail reliance." },
  { id: "fly", name: "Fly", group: "insects", arabicTerms: ["ذباب"], refs: ["22:73"], note: "Mentioned in a parable about the powerlessness of false objects of worship." },
  { id: "mosquito", name: "Mosquito / gnat", group: "insects", arabicTerms: ["بعوضة"], refs: ["2:26"], note: "Mentioned as an example Allah may use, however small." },
  { id: "locust", name: "Locust", group: "insects", arabicTerms: ["جراد"], refs: ["7:133", "54:7"], note: "Mentioned among the signs sent to Pharaoh's people, and at the gathering." },
  { id: "lice", name: "Lice", group: "insects", arabicTerms: ["قمل"], refs: ["7:133"], note: "Listed among the signs sent to Pharaoh's people." },
  { id: "frog", name: "Frog", group: "other", arabicTerms: ["ضفادع"], refs: ["7:133"], note: "Listed among the signs sent to Pharaoh's people." },
];

export const SIGN_GROUPS: { id: string; title: string }[] = [
  { id: "all", title: "All" }, { id: "sky", title: "Sky" }, { id: "time", title: "Time" }, { id: "earth", title: "Earth" }, { id: "landforms", title: "Landforms" }, { id: "water", title: "Water" }, { id: "weather", title: "Weather" }, { id: "creation", title: "Creation" },
];
export const NATURAL_SIGNS: QuranTermMention[] = [
  { id: "sun", name: "Sun", group: "sky", arabicTerms: ["شمس"], refs: ["6:78", "10:5", "13:2", "14:33", "21:33", "36:38", "91:1"] },
  { id: "moon", name: "Moon", group: "sky", arabicTerms: ["قمر"], refs: ["6:77", "10:5", "13:2", "14:33", "21:33", "36:39", "54:1", "91:2"] },
  { id: "stars", name: "Stars", group: "sky", arabicTerms: ["نجم", "نجوم", "كوكب", "كواكب"], refs: ["6:76", "16:12", "37:6", "53:1", "56:75", "86:3"], note: "Both 'star' (najm) and 'planet/heavenly body' (kawkab) terms are included." },
  { id: "sky", name: "Sky / heavens", group: "sky", arabicTerms: ["سماء", "سماوات"], refs: ["2:22", "2:164", "21:30", "41:11-12", "67:3-5"] },
  { id: "night", name: "Night", group: "time", arabicTerms: ["ليل"], refs: ["2:164", "3:190", "10:6", "17:12", "36:37", "92:1"] },
  { id: "day", name: "Day", group: "time", arabicTerms: ["نهار", "يوم"], refs: ["2:164", "3:190", "10:6", "17:12", "91:3", "92:2"] },
  { id: "earth", name: "Earth", group: "earth", arabicTerms: ["أرض"], refs: ["2:22", "2:164", "13:3", "15:19", "21:30", "31:10"] },
  { id: "mountains", name: "Mountains", group: "landforms", arabicTerms: ["جبال", "رواسي"], refs: ["13:3", "15:19", "16:15", "21:31", "27:88", "78:6-7"], note: "Includes the term rawāsī (firm, anchoring mountains)." },
  { id: "plants", name: "Plants / vegetation", group: "earth", arabicTerms: ["نبات", "زرع"], refs: ["6:99", "10:24", "16:11", "18:45", "39:21", "80:27-31"], note: "General references to vegetation Allah causes to grow." },
  { id: "seas", name: "Seas", group: "water", arabicTerms: ["بحر", "بحرين"], refs: ["16:14", "18:60", "25:53", "27:61", "35:12", "55:19-20"] },
  { id: "rivers", name: "Rivers", group: "water", arabicTerms: ["أنهار", "نهر"], refs: ["2:25", "13:3", "16:15", "47:15"] },
  { id: "rain", name: "Rain / water sent down", group: "water", arabicTerms: ["ماء", "مطر"], refs: ["2:22", "6:99", "16:10-11", "23:18", "24:43", "30:48", "39:21"] },
  { id: "clouds", name: "Clouds", group: "weather", arabicTerms: ["سحاب", "غمام"], refs: ["2:164", "7:57", "24:43", "30:48"] },
  { id: "wind", name: "Wind / winds", group: "weather", arabicTerms: ["ريح", "رياح"], refs: ["7:57", "15:22", "30:46", "30:48"] },
  { id: "lightningThunder", name: "Lightning / thunder", group: "weather", arabicTerms: ["برق", "رعد"], refs: ["2:19-20", "13:12-13", "24:43"] },
  { id: "humanCreation", name: "Human creation stages", group: "creation", arabicTerms: ["نطفة", "علقة", "سلالة", "تراب", "طين"], refs: ["22:5", "23:12-14", "40:67", "75:37-39"], note: "References to the stages of human creation. Terms are shown cautiously; no modern scientific claim is made." },
];

/** Count ayahs across refs, expanding "x-y" ranges (e.g. "2:183-187" = 5). */
export function refAyahCount(refs: string[]): number {
  return refs.reduce((t, r) => {
    const a = r.split(":")[1];
    if (a && a.includes("-")) { const [x, y] = a.split("-").map(Number); return t + (y - x + 1); }
    return t + 1;
  }, 0);
}
