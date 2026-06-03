// Reference-page data for the mobile Library, ported from the web frontend's
// curated reference datasets (frontend/src/data/*). Each entry is Quran-backed:
// it carries only ayah references plus a short, neutral, source-backed label —
// no tafsir, hadith, history, or generated text. The Arabic + translation
// (+ stored tafsir) for every passage are loaded VERBATIM from the backend at
// view time (GET /api/verses); none of that text is stored here.
//
// Display strings are the English source-of-truth from the web datasets (the
// web overlays per-locale i18n on top of these same keys).

export type RefType = "command" | "prohibition" | "cultivate" | "avoid";

/** Normalised card item used by the shared RefList screen. */
export interface RefCardItem {
  id: string;
  title: string;
  arName?: string; // verbatim Arabic name (prophets) — never translated
  category: string;
  refs: string[];
  mainRefs?: string[];
  tags?: string[];
  desc: string; // shortLabel / summary / context (neutral, source-backed)
  note?: string;
  type?: RefType;
  severity?: string; // "major"
}

export interface Category {
  id: string;
  title: string;
}

export interface Collection {
  id: string; // route id
  eyebrow: string;
  title: string;
  subtitle: string;
  sourceNote: string; // disclaimer line
  icon: string; // inner-SVG markup (rendered via RawIcon)
  items: RefCardItem[];
  categories: Category[];
  typeFilter?: { value: RefType; label: string }[];
  showTafsir: boolean;
  mainBadge?: boolean;
  typeBadge?: boolean;
}

/* Shared trust note shown on every reference page. */
export const REF_TRUST =
  "Tap a passage to load its verbatim Arabic and a stored translation from the source. Tafsir, when shown, is served as stored — never machine-translated or generated.";

/* ---------- icons (inner SVG, rendered with RawIcon) ---------- */
const IC = {
  hands: '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/>',
  person: '<circle cx="12" cy="8" r="3.4"/><path d="M5 21v-1.5a7 7 0 0 1 14 0V21"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v16h5.5A2.5 2.5 0 0 1 20 21.5z"/>',
  scroll: '<path d="M6 3h9l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M9 9h6M9 13h6M9 17h4"/>',
  alert: '<path d="M12 3l9 16H3z"/><line x1="12" y1="9" x2="12" y2="14"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/>',
  heart: '<path d="M12 21s-6.5-4.2-9-8.5C1.4 9.6 2.7 6 6 6c1.9 0 3.2 1.1 4 2.3C10.8 7.1 12.1 6 14 6c3.3 0 4.6 3.6 3 6.5-2.5 4.3-9 8.5-9 8.5z"/>',
  scales: '<path d="M12 3v18"/><path d="M5 7h14"/><path d="M7 7l-3 7a3 3 0 0 0 6 0z"/><path d="M17 7l-3 7a3 3 0 0 0 6 0z"/>',
};

/* ===================================================================== */
/* Quranic Duas                                                          */
/* ===================================================================== */
const DUA_CATEGORIES: Category[] = [
  { id: "guidance", title: "Guidance" },
  { id: "forgiveness", title: "Forgiveness" },
  { id: "family", title: "Parents & Family" },
  { id: "knowledge", title: "Knowledge & Speech" },
  { id: "mercy", title: "Mercy" },
  { id: "protection", title: "Protection" },
  { id: "repentance", title: "Repentance" },
  { id: "provision", title: "Provision & Good" },
  { id: "patience", title: "Victory & Patience" },
];
const DUAS: RefCardItem[] = [
  { id: "seekingGuidance", category: "guidance", title: "Seeking guidance", refs: ["1:6"], desc: "Dua from Surah Al-Fatihah asking Allah to guide to the straight path." },
  { id: "heartsSteadfast", category: "guidance", title: "Hearts not deviating after guidance", refs: ["3:8"], desc: "Dua asking Allah not to let hearts deviate after guidance and asking for mercy." },
  { id: "pardonMercy", category: "forgiveness", title: "Forgiveness and mercy", refs: ["2:286"], desc: "Dua asking Allah for pardon, forgiveness, mercy, and help." },
  { id: "forgiveBelievers", category: "forgiveness", title: "Forgiveness for believers", refs: ["14:41"], desc: "Dua of Ibrahim asking forgiveness for himself, his parents, and believers on the Day of Account." },
  { id: "forgiveWrongdoing", category: "forgiveness", title: "Forgiveness after wrongdoing", refs: ["28:16"], desc: "Dua of Musa after acknowledging wrongdoing." },
  { id: "mercyParents", category: "family", title: "Mercy for parents", refs: ["17:24"], desc: "Dua asking Allah to have mercy on parents as they raised the child when young." },
  { id: "righteousFamily", category: "family", title: "Righteous family", refs: ["25:74"], desc: "Dua asking Allah for comfort from spouses and offspring and leadership among the righteous." },
  { id: "protectDescendants", category: "family", title: "Protection for family and descendants", refs: ["14:35-41"], desc: "Dua of Ibrahim for security, worship, provision, and forgiveness." },
  { id: "increaseKnowledge", category: "knowledge", title: "Increase in knowledge", refs: ["20:114"], desc: "Dua asking Allah to increase knowledge." },
  { id: "easeSpeech", category: "knowledge", title: "Ease speech and task", refs: ["20:25-28"], desc: "Dua of Musa asking Allah to open his chest, ease his task, and loosen his tongue." },
  { id: "mercyForgiveness", category: "mercy", title: "Mercy and forgiveness", refs: ["7:151"], desc: "Dua of Musa asking Allah for forgiveness and mercy." },
  { id: "believedForgive", category: "mercy", title: "We believed, so forgive us", refs: ["23:109"], desc: "Dua asking Allah for forgiveness and mercy." },
  { id: "mercyGuidance", category: "mercy", title: "Mercy from Allah", refs: ["18:10"], desc: "Dua of the youths of the cave asking for mercy and right guidance." },
  { id: "fromWrongdoers", category: "protection", title: "Protection from wrongdoing people", refs: ["10:85-86"], desc: "Dua asking Allah not to make believers a trial for wrongdoing people and to save them." },
  { id: "fromHellfire", category: "protection", title: "Protection from Hellfire", refs: ["3:191"], desc: "Dua asking Allah for protection from the punishment of the Fire." },
  { id: "fromSatan", category: "protection", title: "Protection from Satan", refs: ["23:97-98"], desc: "Dua seeking refuge from the incitements and presence of devils." },
  { id: "adamHawwa", category: "repentance", title: "Dua of Adam and Hawwa", refs: ["7:23"], desc: "Dua acknowledging wrongdoing and asking for forgiveness and mercy." },
  { id: "yunus", category: "repentance", title: "Dua of Yunus", refs: ["21:87"], desc: "Dua of Yunus in distress, declaring Allah's perfection and admitting wrongdoing." },
  { id: "acceptRepentance", category: "repentance", title: "Accept our repentance", refs: ["2:128"], desc: "Dua of Ibrahim and Ismail asking Allah to accept repentance." },
  { id: "goodBothWorlds", category: "provision", title: "Good in this world and next", refs: ["2:201"], desc: "Dua asking for good in this world, good in the Hereafter, and protection from the Fire." },
  { id: "needGood", category: "provision", title: "Need of good from Allah", refs: ["28:24"], desc: "Dua of Musa expressing need for whatever good Allah sends down." },
  { id: "makeGrateful", category: "provision", title: "Make me grateful", refs: ["27:19"], desc: "Dua of Sulayman asking to be grateful and to do righteous deeds pleasing to Allah." },
  { id: "patienceFirmFeet", category: "patience", title: "Patience and firm feet", refs: ["2:250"], desc: "Dua asking Allah for patience, firmness, and help." },
  { id: "pourPatience", category: "patience", title: "Pour patience upon us", refs: ["7:126"], desc: "Dua asking Allah to pour patience and cause death in submission." },
  { id: "helpDisbelievers", category: "patience", title: "Help against disbelieving people", refs: ["3:147"], desc: "Dua asking forgiveness, firmness, and help." },
];

/* ===================================================================== */
/* Prophet Stories                                                       */
/* ===================================================================== */
const PROPHET_CATEGORIES: Category[] = [
  { id: "foundational", title: "Foundational Stories" },
  { id: "familyTrials", title: "Family and Trials" },
  { id: "musaIsrael", title: "Musa and Bani Israel" },
  { id: "warnings", title: "Warnings and Rescue" },
  { id: "mercyCalling", title: "Mercy, Illness, and Calling" },
  { id: "finalMessenger", title: "Isa and Final Messenger" },
  { id: "other", title: "Other Prophets Mentioned" },
];
const PROPHET_STORIES: RefCardItem[] = [
  { id: "adam", title: "Adam", arName: "آدم", category: "foundational", refs: ["2:30-39", "7:11-27", "20:115-123"], desc: "Quran passages about Adam's creation, the command to the angels, Iblis refusing, the test, repentance, and descent." },
  { id: "nuh", title: "Nuh", arName: "نوح", category: "foundational", refs: ["7:59-64", "11:25-49", "23:23-30", "71:1-28"], desc: "Quran passages about Nuh calling his people, their rejection, the flood, and salvation." },
  { id: "ibrahim", title: "Ibrahim", arName: "إبراهيم", category: "foundational", refs: ["2:124-132", "6:74-83", "14:35-41", "21:51-73", "37:83-113"], desc: "Quran passages about Ibrahim's call to tawhid, rejection of idols, trials, family, and supplications." },
  { id: "yusuf", title: "Yusuf", arName: "يوسف", category: "familyTrials", refs: ["12:3-101"], desc: "Quran passage covering the story of Yusuf, his dream, family trial, slavery, imprisonment, authority, reunion, and gratitude to Allah.", note: "This is a long narrative range." },
  { id: "yaqub", title: "Yaqub", arName: "يعقوب", category: "familyTrials", refs: ["2:132-133", "12:6", "12:38", "12:84-87"], desc: "Quran passages connected to Yaqub's counsel, patience, and trust in Allah." },
  { id: "ismail", title: "Ismail", arName: "إسماعيل", category: "familyTrials", refs: ["2:125-129", "19:54-55", "37:100-107"], desc: "Quran passages connected to Ismail, the Sacred House, prayer, and the trial with Ibrahim." },
  { id: "ishaq", title: "Ishaq", arName: "إسحاق", category: "familyTrials", refs: ["11:71-73", "21:72-73", "37:112-113"], desc: "Quran passages mentioning Ishaq as a blessing and among the righteous." },
  { id: "musa", title: "Musa", arName: "موسى", category: "musaIsrael", refs: ["2:49-61", "7:103-137", "20:9-98", "26:10-68", "28:3-46"], desc: "Quran passages about Musa, Pharaoh, the signs, rescue of the Children of Israel, and lessons from their trials.", note: "These are long narrative ranges." },
  { id: "harun", title: "Harun", arName: "هارون", category: "musaIsrael", refs: ["20:29-36", "20:90-94", "25:35", "37:114-122"], desc: "Quran passages mentioning Harun's role with Musa and his counsel to the people." },
  { id: "dawud", title: "Dawud", arName: "داوود", category: "musaIsrael", refs: ["2:251", "21:78-80", "34:10-11", "38:17-26"], desc: "Quran passages about Dawud, judgement, wisdom, worship, and blessings." },
  { id: "sulayman", title: "Sulayman", arName: "سليمان", category: "musaIsrael", refs: ["21:78-82", "27:15-44", "34:12-14", "38:30-40"], desc: "Quran passages about Sulayman, wisdom, kingdom, the hoopoe, the Queen of Saba, and gratitude." },
  { id: "hud", title: "Hud", arName: "هود", category: "warnings", refs: ["7:65-72", "11:50-60", "26:123-140"], desc: "Quran passages about Hud calling Aad and warning against arrogance and rejection." },
  { id: "salih", title: "Salih", arName: "صالح", category: "warnings", refs: ["7:73-79", "11:61-68", "26:141-159", "91:11-15"], desc: "Quran passages about Salih, Thamud, the she-camel sign, and rejection." },
  { id: "lut", title: "Lut", arName: "لوط", category: "warnings", refs: ["7:80-84", "11:77-83", "26:160-175", "27:54-58", "29:28-35"], desc: "Quran passages about Lut warning his people and their wrongdoing." },
  { id: "shuayb", title: "Shuayb", arName: "شعيب", category: "warnings", refs: ["7:85-93", "11:84-95", "26:176-191", "29:36-37"], desc: "Quran passages about Shuayb warning against cheating in measure, corruption, and rejection." },
  { id: "yunus", title: "Yunus", arName: "يونس", category: "mercyCalling", refs: ["10:98", "21:87-88", "37:139-148"], desc: "Quran passages about Yunus, his distress, dua, and Allah's mercy." },
  { id: "ayyub", title: "Ayyub", arName: "أيوب", category: "mercyCalling", refs: ["21:83-84", "38:41-44"], desc: "Quran passages about Ayyub's trial, patience, dua, and relief." },
  { id: "zakariya", title: "Zakariya", arName: "زكريا", category: "mercyCalling", refs: ["3:37-41", "19:2-15", "21:89-90"], desc: "Quran passages about Zakariya's dua and the glad tidings of Yahya." },
  { id: "yahya", title: "Yahya", arName: "يحيى", category: "mercyCalling", refs: ["3:39", "19:7-15"], desc: "Quran passages mentioning Yahya, wisdom, purity, and righteousness." },
  { id: "isa", title: "Isa", arName: "عيسى", category: "finalMessenger", refs: ["3:45-55", "5:110-118", "19:16-36", "61:6"], desc: "Quran passages about Isa, Maryam, signs by Allah's permission, his message, and Allah's clarification." },
  { id: "muhammad", title: "Muhammad", arName: "محمد", category: "finalMessenger", refs: ["3:144", "33:40", "47:2", "48:29", "61:6"], desc: "Quran references naming Muhammad and Ahmad, his role as Messenger, and finality of prophethood." },
  { id: "idris", title: "Idris", arName: "إدريس", category: "other", refs: ["19:56-57", "21:85-86"], desc: "Quran references mentioning Idris among the truthful and patient." },
  { id: "dhulkifl", title: "Dhul-Kifl", arName: "ذا الكفل", category: "other", refs: ["21:85-86", "38:48"], desc: "Quran references mentioning Dhul-Kifl among the patient and chosen." },
  { id: "ilyas", title: "Ilyas", arName: "إلياس", category: "other", refs: ["6:85", "37:123-132"], desc: "Quran references mentioning Ilyas and his call." },
  { id: "alyasa", title: "Al-Yasa", arName: "اليسع", category: "other", refs: ["6:86", "38:48"], desc: "Quran references mentioning Al-Yasa among those favored and chosen." },
];

/* ===================================================================== */
/* Quranic Parables                                                      */
/* ===================================================================== */
const PARABLE_CATEGORIES: Category[] = [
  { id: "guidanceLight", title: "Guidance and Light" },
  { id: "faithFalsehood", title: "Faith and Falsehood" },
  { id: "charitySincerity", title: "Charity and Sincerity" },
  { id: "knowledgeResp", title: "Knowledge and Responsibility" },
  { id: "worldlyLife", title: "Worldly Life" },
  { id: "humanBehavior", title: "Human Behavior" },
  { id: "resurrection", title: "Resurrection and Accountability" },
];
const PARABLES: RefCardItem[] = [
  { id: "light", title: "Parable of Light", category: "guidanceLight", refs: ["24:35"], mainRefs: ["24:35"], tags: ["Light", "Guidance", "Faith", "Parable"], desc: "A Quranic parable about Allah's light and guidance." },
  { id: "goodBadWord", title: "Good Word and Bad Word", category: "faithFalsehood", refs: ["14:24-26"], mainRefs: ["14:24-26"], tags: ["Speech", "Truth", "Faith", "Falsehood"], desc: "A Quranic parable comparing a good word to a good tree and a bad word to a bad tree." },
  { id: "charityGrain", title: "Charity Like Grain", category: "charitySincerity", refs: ["2:261"], mainRefs: ["2:261"], tags: ["Charity", "Spending", "Reward", "Sadaqah"], desc: "A Quranic parable about spending in Allah's way and multiplied reward." },
  { id: "charityRuined", title: "Charity Ruined by Reminders and Showing Off", category: "charitySincerity", refs: ["2:264"], mainRefs: ["2:264"], tags: ["Charity", "Sincerity", "Showing Off", "Harm"], desc: "A Quranic parable about charity invalidated by reminders, injury, and showing off." },
  { id: "gardenHigh", title: "Garden on High Ground", category: "charitySincerity", refs: ["2:265"], mainRefs: ["2:265"], tags: ["Charity", "Sincerity", "Seeking Allah's Pleasure"], desc: "A Quranic parable about spending sincerely seeking Allah's pleasure." },
  { id: "burnedGarden", title: "Burned Garden", category: "charitySincerity", refs: ["2:266"], mainRefs: ["2:266"], tags: ["Charity", "Loss", "Need", "Reflection"], desc: "A Quranic parable asking people to reflect on loss after need." },
  { id: "spiderHouse", title: "Spider's House", category: "faithFalsehood", refs: ["29:41"], mainRefs: ["29:41"], tags: ["False Protection", "Reliance", "Shirk"], desc: "A Quranic parable comparing protectors besides Allah to the spider's house." },
  { id: "donkeyBooks", title: "Donkey Carrying Books", category: "knowledgeResp", refs: ["62:5"], mainRefs: ["62:5"], tags: ["Scripture", "Knowledge", "Responsibility", "Action"], desc: "A Quranic parable about being entrusted with scripture without carrying its responsibility." },
  { id: "dogExample", title: "Dog Example", category: "humanBehavior", refs: ["7:175-176"], mainRefs: ["7:175-176"], tags: ["Desire", "Rejection", "Signs", "Guidance"], desc: "A Quranic parable about one who was given signs but turned away and followed desire." },
  { id: "rainPlants", title: "Worldly Life Like Rain and Plants", category: "worldlyLife", refs: ["10:24"], mainRefs: ["10:24"], tags: ["Worldly Life", "Rain", "Plants", "Passing World"], desc: "A Quranic parable comparing worldly life to rain and vegetation that later disappears." },
  { id: "rainDebris", title: "Worldly Life: Rain, Growth, Then Debris", category: "worldlyLife", refs: ["18:45"], mainRefs: ["18:45"], tags: ["Worldly Life", "Temporary Life", "Plants"], desc: "A Quranic parable about the temporary nature of worldly life." },
  { id: "lifeRain", title: "Worldly Life and Rain", category: "worldlyLife", refs: ["57:20"], mainRefs: ["57:20"], tags: ["Worldly Life", "Play", "Boasting", "Temporary Life"], desc: "A Quranic parable describing worldly life as play, adornment, boasting, and vegetation that dries." },
  { id: "twoGardens", title: "Two Men and Two Gardens", category: "worldlyLife", refs: ["18:32-44"], mainRefs: ["18:32-44"], tags: ["Wealth", "Gratitude", "Arrogance", "Worldly Life"], desc: "A Quranic parable about two men, gardens, wealth, arrogance, and return to Allah." },
  { id: "servantProvision", title: "The Servant Owned by Another and the One Given Good Provision", category: "faithFalsehood", refs: ["16:75"], mainRefs: ["16:75"], tags: ["Tawhid", "Provision", "Comparison"], desc: "A Quranic parable contrasting one without power and one given good provision." },
  { id: "twoMenJustice", title: "Two Men: One Unable and One Commanding Justice", category: "faithFalsehood", refs: ["16:76"], mainRefs: ["16:76"], tags: ["Tawhid", "Justice", "Comparison"], desc: "A Quranic parable contrasting inability with one who commands justice." },
  { id: "slaveManyMasters", title: "Slave with Many Masters", category: "faithFalsehood", refs: ["39:29"], mainRefs: ["39:29"], tags: ["Tawhid", "Worship", "Comparison"], desc: "A Quranic parable comparing a man with disputing masters to a man devoted to one master." },
  { id: "flyParable", title: "Fly Parable", category: "faithFalsehood", refs: ["22:73"], mainRefs: ["22:73"], tags: ["False Gods", "Weakness", "Worship"], desc: "A Quranic parable about the weakness of those invoked besides Allah." },
  { id: "ashesWind", title: "Ashes Blown by Wind", category: "faithFalsehood", refs: ["14:18"], mainRefs: ["14:18"], tags: ["Deeds", "Disbelief", "Loss"], desc: "A Quranic parable comparing deeds of those who disbelieve to ashes blown by strong wind." },
  { id: "mirageDarkness", title: "Mirage and Deep Darkness", category: "faithFalsehood", refs: ["24:39-40"], mainRefs: ["24:39-40"], tags: ["Disbelief", "Deeds", "Darkness", "False Hope"], desc: "Quranic parables about deeds like a mirage and layers of darkness." },
  { id: "fireKindled", title: "Fire Kindled Then Light Removed", category: "faithFalsehood", refs: ["2:17-18"], mainRefs: ["2:17-18"], tags: ["Hypocrisy", "Light", "Darkness"], desc: "A Quranic parable about light being removed and people left in darkness." },
  { id: "rainstorm", title: "Rainstorm, Darkness, Thunder, and Lightning", category: "faithFalsehood", refs: ["2:19-20"], mainRefs: ["2:19-20"], tags: ["Hypocrisy", "Fear", "Uncertainty", "Guidance"], desc: "A Quranic parable using rainstorm, darkness, thunder, and lightning." },
  { id: "mosquito", title: "Mosquito Parable", category: "faithFalsehood", refs: ["2:26"], mainRefs: ["2:26"], tags: ["Parables", "Guidance", "Misguidance"], desc: "A Quranic statement that Allah is not ashamed to present a parable, even of a mosquito or what is above it." },
  { id: "goodBadLand", title: "Good Land and Bad Land", category: "humanBehavior", refs: ["7:58"], mainRefs: ["7:58"], tags: ["Gratitude", "Receptivity", "Signs"], desc: "A Quranic parable comparing good land that produces vegetation and bad land that barely produces." },
  { id: "gnatWeakness", title: "Gnat / Weakness of False Objects of Worship", category: "faithFalsehood", refs: ["22:73-74"], mainRefs: ["22:73"], tags: ["False Worship", "Weakness", "Allah's Power"], desc: "A Quranic parable showing the weakness of what is invoked besides Allah." },
];

/* ===================================================================== */
/* Commands & Prohibitions                                               */
/* ===================================================================== */
const CP_CATEGORIES: Category[] = [
  { id: "worship", title: "Worship" },
  { id: "familySociety", title: "Family and Society" },
  { id: "wealthJustice", title: "Wealth and Justice" },
  { id: "speechCharacter", title: "Speech and Character" },
  { id: "prohibitedActions", title: "Prohibited Actions" },
];
const COMMANDS_PROHIBITIONS: RefCardItem[] = [
  { id: "worshipAllah", title: "Worship Allah Alone", type: "command", category: "worship", refs: ["2:21-22", "4:36", "17:23"], tags: ["Tawhid", "Worship"], desc: "Quranic commands to worship Allah and not associate partners with Him." },
  { id: "establishPrayer", title: "Establish Prayer", type: "command", category: "worship", refs: ["2:43", "2:238", "4:103", "29:45"], tags: ["Prayer", "Salah"], desc: "Quranic commands and reminders about establishing and guarding prayer." },
  { id: "giveZakat", title: "Give Zakat and Charity", type: "command", category: "worship", refs: ["2:43", "2:110", "9:60", "9:103"], tags: ["Zakat", "Charity"], desc: "Quranic references to zakat, giving, and purification of wealth." },
  { id: "fastRamadan", title: "Fast in Ramadan", type: "command", category: "worship", refs: ["2:183-187"], tags: ["Fasting", "Ramadan"], desc: "Quranic guidance on fasting in Ramadan and related allowances." },
  { id: "performHajj", title: "Perform Hajj", type: "command", category: "worship", refs: ["3:96-97", "2:196-197", "22:27-29"], tags: ["Hajj", "Pilgrimage"], desc: "Quranic references to pilgrimage, rites, and the Sacred House." },
  { id: "honorParents", title: "Honor Parents", type: "command", category: "familySociety", refs: ["17:23-24", "31:14-15", "4:36"], tags: ["Parents", "Family"], desc: "Quranic commands to show goodness and gratitude to parents." },
  { id: "relativesDue", title: "Give Relatives Their Due", type: "command", category: "familySociety", refs: ["17:26", "16:90", "4:36"], tags: ["Relatives", "Kinship"], desc: "Quranic guidance on giving relatives their due and maintaining social rights." },
  { id: "protectOrphans", title: "Protect Orphans", type: "command", category: "familySociety", refs: ["4:2-6", "2:220"], tags: ["Orphans", "Property"], desc: "Quranic guidance on caring for orphans and protecting their property." },
  { id: "fulfillCovenants", title: "Fulfill Covenants and Contracts", type: "command", category: "wealthJustice", refs: ["5:1", "16:91", "17:34"], tags: ["Covenants", "Contracts"], desc: "Quranic commands to fulfill covenants and commitments." },
  { id: "writeDebts", title: "Write Debt Contracts", type: "command", category: "wealthJustice", refs: ["2:282-283"], tags: ["Debt", "Witnesses", "Contracts"], desc: "Quranic guidance on recording debts, witnesses, and trust." },
  { id: "standJustice", title: "Stand Firm for Justice", type: "command", category: "wealthJustice", refs: ["4:58", "4:135", "5:8"], tags: ["Justice", "Witness"], desc: "Quranic commands to judge with justice and stand firmly as witnesses." },
  { id: "speakTruth", title: "Speak Truthfully", type: "command", category: "speechCharacter", refs: ["9:119", "33:70-71"], tags: ["Truth", "Speech"], desc: "Quranic guidance on being with the truthful and speaking rightly." },
  { id: "bePatient", title: "Be Patient", type: "command", category: "speechCharacter", refs: ["2:153-157", "3:200", "103:1-3"], tags: ["Patience", "Steadfastness"], desc: "Quranic guidance on patience, steadfastness, and seeking help through patience." },
  { id: "forgivePardon", title: "Forgive and Pardon", type: "command", category: "speechCharacter", refs: ["3:134", "24:22", "42:40"], tags: ["Forgiveness", "Mercy"], desc: "Quranic guidance on restraining anger, pardoning, and forgiving." },
  { id: "noShirk", title: "Do Not Commit Shirk", type: "prohibition", category: "prohibitedActions", refs: ["4:36", "31:13", "4:48"], tags: ["Shirk", "Tawhid"], desc: "Quranic warnings against associating partners with Allah." },
  { id: "noUnlawfulKilling", title: "Do Not Kill Unlawfully", type: "prohibition", category: "prohibitedActions", refs: ["5:32", "6:151", "17:31-33", "25:68"], tags: ["Life", "Murder"], desc: "Quranic prohibitions against unlawful killing and killing children." },
  { id: "noZina", title: "Do Not Approach Zina", type: "prohibition", category: "prohibitedActions", refs: ["17:32", "24:2"], tags: ["Zina", "Modesty"], desc: "Quranic warning against approaching zina and its consequences." },
  { id: "noRiba", title: "Do Not Consume Riba", type: "prohibition", category: "wealthJustice", refs: ["2:275-281", "3:130"], tags: ["Riba", "Wealth"], desc: "Quranic references warning against riba." },
  { id: "noUnjustWealth", title: "Do Not Consume Wealth Unjustly", type: "prohibition", category: "wealthJustice", refs: ["2:188", "4:29"], tags: ["Property", "Fraud"], desc: "Quranic prohibitions against consuming wealth unjustly." },
  { id: "noOrphanProperty", title: "Do Not Consume Orphan Property Unjustly", type: "prohibition", category: "wealthJustice", refs: ["4:10", "4:2"], tags: ["Orphans", "Property"], desc: "Quranic warnings against consuming orphan property unjustly." },
  { id: "noCheatMeasure", title: "Do Not Cheat in Measure and Weight", type: "prohibition", category: "wealthJustice", refs: ["83:1-6", "11:84-85", "26:181-183"], tags: ["Trade", "Measure", "Fraud"], desc: "Quranic warnings against fraud in measure and weight." },
  { id: "noIntoxicants", title: "Avoid Intoxicants and Gambling", type: "prohibition", category: "prohibitedActions", refs: ["2:219", "5:90-91"], tags: ["Intoxicants", "Gambling"], desc: "Quranic references about intoxicants, gambling, harm, and avoidance." },
  { id: "noBackbiting", title: "Do Not Mock, Insult, Spy, or Backbite", type: "prohibition", category: "speechCharacter", refs: ["49:11-12"], tags: ["Mockery", "Backbiting", "Suspicion"], desc: "Quranic warnings against mockery, insulting one another, suspicion, spying, and backbiting." },
  { id: "noFollowNoKnowledge", title: "Do Not Follow What You Have No Knowledge Of", type: "prohibition", category: "speechCharacter", refs: ["17:36"], tags: ["Knowledge", "Speech", "Responsibility"], desc: "Quranic warning against following or speaking without knowledge." },
  { id: "noArrogance", title: "Do Not Be Arrogant", type: "prohibition", category: "speechCharacter", refs: ["17:37", "31:18"], tags: ["Arrogance", "Humility"], desc: "Quranic warnings against arrogance and pride." },
];

/* ===================================================================== */
/* Quranic Warnings                                                      */
/* ===================================================================== */
const WARNING_CATEGORIES: Category[] = [
  { id: "belief", title: "Belief and Guidance" },
  { id: "wealthRights", title: "Wealth and Rights" },
  { id: "familySociety", title: "Family and Society" },
  { id: "speechCharacter", title: "Speech and Character" },
  { id: "accountability", title: "Accountability" },
];
const WARNINGS: RefCardItem[] = [
  { id: "noDespair", title: "Do Not Despair of Allah's Mercy", category: "belief", refs: ["39:53"], tags: ["Mercy", "Repentance", "Hope"], desc: "Quranic warning not to despair of Allah's mercy." },
  { id: "shirk", title: "Beware of Shirk", severity: "major", category: "belief", refs: ["4:48", "31:13", "4:116"], tags: ["Shirk", "Tawhid"], desc: "Quranic warnings about associating partners with Allah." },
  { id: "shaytanSteps", title: "Do Not Follow Shaytan's Footsteps", category: "belief", refs: ["2:168-169", "24:21", "35:6"], tags: ["Shaytan", "Guidance"], desc: "Quranic warnings against following the footsteps of Shaytan." },
  { id: "worldlyDeception", title: "Do Not Be Deceived by Worldly Life", category: "belief", refs: ["31:33", "57:20", "3:185"], tags: ["Worldly Life", "Deception"], desc: "Quranic warnings about the temporary nature and deception of worldly life." },
  { id: "hypocrisy", title: "Warning Against Hypocrisy", category: "belief", refs: ["2:8-10", "4:145", "63:1-4"], tags: ["Hypocrisy", "Faith"], desc: "Quranic warnings about hypocrisy and its consequences." },
  { id: "unjustWealth", title: "Do Not Consume Wealth Unjustly", category: "wealthRights", refs: ["2:188", "4:29"], tags: ["Wealth", "Fraud", "Rights"], desc: "Quranic warnings against taking wealth unjustly." },
  { id: "riba", title: "Warning Against Riba", severity: "major", category: "wealthRights", refs: ["2:275-281", "3:130"], tags: ["Riba", "Wealth"], desc: "Quranic warnings about riba and accountability." },
  { id: "orphanAbuse", title: "Warning Against Orphan Property Abuse", category: "wealthRights", refs: ["4:10", "4:2"], tags: ["Orphans", "Property"], desc: "Quranic warning against consuming orphan property unjustly." },
  { id: "cheatMeasure", title: "Warning Against Cheating in Measure", category: "wealthRights", refs: ["83:1-6", "11:84-85"], tags: ["Trade", "Fraud", "Measure"], desc: "Quranic warnings against cheating in measure and weight." },
  { id: "killingChildren", title: "Warning Against Killing Children", category: "familySociety", refs: ["17:31", "6:151"], tags: ["Children", "Provision", "Life"], desc: "Quranic warnings against killing children out of fear of poverty." },
  { id: "zina", title: "Warning Against Zina", category: "familySociety", refs: ["17:32", "24:2"], tags: ["Zina", "Modesty"], desc: "Quranic warning not to approach zina." },
  { id: "backbiting", title: "Warning Against Backbiting and Suspicion", category: "speechCharacter", refs: ["49:11-12"], tags: ["Backbiting", "Suspicion", "Mockery"], desc: "Quranic warnings against mockery, suspicion, spying, and backbiting." },
  { id: "arrogance", title: "Warning Against Arrogance", category: "speechCharacter", refs: ["17:37", "31:18", "7:146"], tags: ["Arrogance", "Pride"], desc: "Quranic warnings against arrogance and turning away from signs." },
  { id: "lyingAboutAllah", title: "Warning Against Lying About Allah", severity: "major", category: "speechCharacter", refs: ["6:21", "7:33", "10:17"], tags: ["Lying", "Allah", "Knowledge"], desc: "Quranic warnings against inventing lies about Allah." },
  { id: "speakNoKnowledge", title: "Warning Against Speaking Without Knowledge", category: "speechCharacter", refs: ["17:36", "7:33"], tags: ["Knowledge", "Speech"], desc: "Quranic warning against following or saying what one has no knowledge of." },
  { id: "dayOfJudgement", title: "Warning About the Day of Judgement", category: "accountability", refs: ["99:6-8", "82:17-19", "75:1-15"], tags: ["Judgement", "Accountability"], desc: "Quranic warnings that deeds will be shown and people will be accountable." },
  { id: "hellfire", title: "Warning About Hellfire", severity: "major", category: "accountability", refs: ["4:56", "67:6-11", "74:26-31"], tags: ["Hellfire", "Accountability"], desc: "Quranic warnings about the Fire and accountability." },
  { id: "forgettingAllah", title: "Warning Against Forgetting Allah", category: "accountability", refs: ["59:19", "20:124-126"], tags: ["Forgetfulness", "Accountability"], desc: "Quranic warnings against forgetting Allah and turning away from remembrance." },
];

/* ===================================================================== */
/* Ethical Character Map                                                 */
/* ===================================================================== */
const CHAR_CATEGORIES: Category[] = [
  { id: "heartFaith", title: "Heart and Faith" },
  { id: "speech", title: "Speech" },
  { id: "socialConduct", title: "Social Conduct" },
  { id: "selfControl", title: "Self-Control" },
  { id: "wealthResp", title: "Wealth and Responsibility" },
];
const CHARACTER_TRAITS: RefCardItem[] = [
  { id: "taqwa", title: "Taqwa", type: "cultivate", category: "heartFaith", refs: ["2:2-5", "3:133-136", "49:13"], tags: ["Taqwa", "God-consciousness"], desc: "Quranic references to God-consciousness and its qualities." },
  { id: "patience", title: "Patience", type: "cultivate", category: "selfControl", refs: ["2:153-157", "3:200", "103:1-3"], tags: ["Patience", "Steadfastness"], desc: "Quranic guidance on patience and steadfastness." },
  { id: "gratitude", title: "Gratitude", type: "cultivate", category: "heartFaith", refs: ["2:152", "14:7", "31:12"], tags: ["Gratitude", "Shukr"], desc: "Quranic references to gratitude and remembering Allah." },
  { id: "truthfulness", title: "Truthfulness", type: "cultivate", category: "speech", refs: ["9:119", "33:70-71"], tags: ["Truth", "Speech"], desc: "Quranic guidance on being truthful and speaking rightly." },
  { id: "humility", title: "Humility", type: "cultivate", category: "socialConduct", refs: ["25:63", "31:18-19"], tags: ["Humility", "Walking", "Speech"], desc: "Quranic guidance on humility in conduct and speech." },
  { id: "mercyKindness", title: "Mercy and Kindness", type: "cultivate", category: "socialConduct", refs: ["3:159", "90:17", "17:23-24"], tags: ["Mercy", "Kindness"], desc: "Quranic references to mercy, compassion, and kindness." },
  { id: "forgiveness", title: "Forgiveness", type: "cultivate", category: "socialConduct", refs: ["3:134", "24:22", "42:40"], tags: ["Forgiveness", "Pardon"], desc: "Quranic guidance on pardoning, forgiving, and restraining anger." },
  { id: "justice", title: "Justice", type: "cultivate", category: "socialConduct", refs: ["4:58", "4:135", "5:8"], tags: ["Justice", "Witness"], desc: "Quranic guidance on judging with justice and standing firmly as witnesses." },
  { id: "trustworthiness", title: "Trustworthiness", type: "cultivate", category: "wealthResp", refs: ["4:58", "23:8", "70:32"], tags: ["Trust", "Amanah"], desc: "Quranic references to rendering trusts and keeping commitments." },
  { id: "modesty", title: "Modesty", type: "cultivate", category: "selfControl", refs: ["24:30-31", "33:59"], tags: ["Modesty", "Gaze"], desc: "Quranic guidance on lowering the gaze and modest conduct." },
  { id: "charityGenerosity", title: "Charity and Generosity", type: "cultivate", category: "wealthResp", refs: ["2:261-274", "3:134", "57:18"], tags: ["Charity", "Generosity"], desc: "Quranic references to giving, spending, and generosity." },
  { id: "relianceAllah", title: "Reliance on Allah", type: "cultivate", category: "heartFaith", refs: ["3:159", "65:3", "11:123"], tags: ["Tawakkul", "Reliance"], desc: "Quranic guidance on relying upon Allah." },
  { id: "arrogance", title: "Arrogance", type: "avoid", category: "heartFaith", refs: ["17:37", "31:18", "7:146"], tags: ["Arrogance", "Pride"], desc: "Quranic warnings against arrogance and pride." },
  { id: "envy", title: "Envy", type: "avoid", category: "heartFaith", refs: ["4:54", "113:5"], tags: ["Envy", "Hasad"], desc: "Quranic references connected to envy and seeking protection from it." },
  { id: "greedHoarding", title: "Greed and Hoarding", type: "avoid", category: "wealthResp", refs: ["9:34-35", "104:1-3", "70:18"], tags: ["Greed", "Hoarding"], desc: "Quranic warnings against hoarding wealth and being consumed by accumulation." },
  { id: "backbiting", title: "Backbiting", type: "avoid", category: "speech", refs: ["49:12"], tags: ["Backbiting", "Speech"], desc: "Quranic warning against backbiting." },
  { id: "mockery", title: "Mockery and Insulting Others", type: "avoid", category: "speech", refs: ["49:11"], tags: ["Mockery", "Insult"], desc: "Quranic warning against mockery, insulting, and offensive nicknames." },
  { id: "suspicionSpying", title: "Suspicion and Spying", type: "avoid", category: "speech", refs: ["49:12"], tags: ["Suspicion", "Spying"], desc: "Quranic warning against much suspicion and spying." },
  { id: "lying", title: "Lying", type: "avoid", category: "speech", refs: ["22:30", "33:70-71", "16:105"], tags: ["Lying", "Falsehood"], desc: "Quranic warnings against false speech and lying." },
  { id: "wastefulness", title: "Wastefulness", type: "avoid", category: "wealthResp", refs: ["17:26-27", "7:31"], tags: ["Waste", "Extravagance"], desc: "Quranic warnings against wastefulness and extravagance." },
  { id: "miserliness", title: "Miserliness", type: "avoid", category: "wealthResp", refs: ["4:37", "57:24", "3:180"], tags: ["Miserliness", "Wealth"], desc: "Quranic warnings against miserliness and withholding." },
  { id: "anger", title: "Anger Without Restraint", type: "avoid", category: "selfControl", refs: ["3:134", "42:37"], tags: ["Anger", "Restraint"], desc: "Quranic praise for those who restrain anger and forgive." },
  { id: "despair", title: "Despair", type: "avoid", category: "heartFaith", refs: ["39:53", "12:87"], tags: ["Despair", "Mercy"], desc: "Quranic warnings against despairing of Allah's mercy." },
  { id: "followingDesire", title: "Following Desire Over Guidance", type: "avoid", category: "selfControl", refs: ["45:23", "7:176", "28:50"], tags: ["Desire", "Guidance"], desc: "Quranic warnings about following desire instead of guidance." },
];

/* ===================================================================== */
/* Legal / Ruling References                                             */
/* ===================================================================== */
const LEGAL_CATEGORIES: Category[] = [
  { id: "familyLaw", title: "Family Law" },
  { id: "wealthContracts", title: "Wealth, Trade, and Contracts" },
  { id: "criminalJustice", title: "Criminal Justice and Public Harm" },
  { id: "worshipRulings", title: "Worship-Related Rulings" },
  { id: "foodConsumption", title: "Food, Drink, and Consumption" },
  { id: "socialRights", title: "Social Conduct and Rights" },
  { id: "oathsVows", title: "Oaths, Vows, and Expiation" },
];
const LEGAL_REFERENCES: RefCardItem[] = [
  { id: "marriage", title: "Marriage", category: "familyLaw", refs: ["4:3", "4:19-21", "24:32", "30:21"], tags: ["Marriage", "Family", "Spouses"], desc: "Quran references related to marriage and treatment of spouses." },
  { id: "forbiddenDegrees", title: "Forbidden marriage degrees", category: "familyLaw", refs: ["4:22-24"], tags: ["Marriage", "Prohibited", "Family"], desc: "Quran references related to relations one is prohibited from marrying." },
  { id: "mahr", title: "Mahr / bridal gift", category: "familyLaw", refs: ["4:4", "4:24"], tags: ["Mahr", "Marriage", "Rights"], desc: "Quran references related to the bridal gift due to a wife." },
  { id: "divorce", title: "Divorce", category: "familyLaw", refs: ["2:226-232", "65:1-7"], tags: ["Divorce", "Family", "Rights"], desc: "Quran references related to divorce and its procedures." },
  { id: "iddah", title: "Waiting period / iddah", category: "familyLaw", refs: ["2:228", "2:234-235", "65:1-4"], tags: ["Iddah", "Divorce", "Waiting Period"], desc: "Quran references related to the prescribed waiting period." },
  { id: "breastfeeding", title: "Breastfeeding", category: "familyLaw", refs: ["2:233"], tags: ["Breastfeeding", "Children", "Family"], desc: "Quran references related to nursing of children and related responsibilities." },
  { id: "reconciliationArbitration", title: "Reconciliation / arbitration", category: "familyLaw", refs: ["4:35", "2:229"], tags: ["Reconciliation", "Arbitration", "Marriage"], desc: "Quran references related to reconciliation and arbitration between spouses." },
  { id: "inheritance", title: "Inheritance", category: "familyLaw", refs: ["4:7", "4:11", "4:12", "4:176"], tags: ["Inheritance", "Family", "Shares"], desc: "Quran references related to inheritance shares and family rights." },
  { id: "willsBequest", title: "Wills / bequest", category: "familyLaw", refs: ["2:180-182", "5:106"], tags: ["Wills", "Bequest", "Inheritance"], desc: "Quran references related to making a will and bequest." },
  { id: "orphansGuardianship", title: "Orphans and guardianship", category: "familyLaw", refs: ["4:2-6", "4:10", "2:220"], tags: ["Orphans", "Guardianship", "Property"], desc: "Quran references related to the care, property and guardianship of orphans." },
  { id: "parentsRelativesRights", title: "Parents and relatives' rights", category: "familyLaw", refs: ["17:23-26", "4:36"], tags: ["Parents", "Relatives", "Rights"], desc: "Quran references related to the rights of parents and relatives." },
  { id: "debtDocumentation", title: "Debt documentation", category: "wealthContracts", refs: ["2:282-283"], tags: ["Debt", "Documentation", "Witnesses"], desc: "Quran references related to recording debts and related transactions." },
  { id: "contractsCovenants", title: "Contracts and covenants", category: "wealthContracts", refs: ["5:1", "16:91", "17:34"], tags: ["Contracts", "Covenants", "Fulfilment"], desc: "Quran references related to fulfilling contracts and covenants." },
  { id: "wealthUnjustly", title: "Consuming wealth unjustly", category: "wealthContracts", refs: ["2:188", "4:29"], tags: ["Wealth", "Justice", "Trade"], desc: "Quran references related to not taking others' wealth unjustly." },
  { id: "weightsMeasures", title: "Fair weights and measures", category: "wealthContracts", refs: ["83:1-6", "11:84-85", "26:181-183"], tags: ["Measures", "Fairness", "Trade"], desc: "Quran references related to giving full and fair weights and measures." },
  { id: "riba", title: "Riba / usury", category: "wealthContracts", refs: ["2:275-281", "3:130"], tags: ["Riba", "Usury", "Wealth"], desc: "Quran references related to riba (usury)." },
  { id: "charityZakat", title: "Charity / zakat recipients", category: "wealthContracts", refs: ["2:261-274", "9:60", "9:103"], tags: ["Charity", "Zakat", "Spending"], desc: "Quran references related to charity and the recipients of zakat." },
  { id: "trustsAmanah", title: "Trusts / amanah", category: "wealthContracts", refs: ["4:58", "23:8", "70:32"], tags: ["Trusts", "Amanah", "Responsibility"], desc: "Quran references related to fulfilling trusts (amanah)." },
  { id: "sanctityOfLife", title: "Sanctity of life", category: "criminalJustice", refs: ["5:32", "6:151", "17:33"], tags: ["Life", "Sanctity", "Justice"], desc: "Quran references related to the sanctity of human life." },
  { id: "qisasPardon", title: "Qisas / retaliation and pardon", category: "criminalJustice", refs: ["2:178-179"], tags: ["Qisas", "Pardon", "Justice"], desc: "Quran references related to lawful retaliation and the merit of pardon." },
  { id: "theft", title: "Theft", category: "criminalJustice", refs: ["5:38-39"], tags: ["Theft", "Justice", "Repentance"], desc: "Quran references related to theft and repentance." },
  { id: "highwayRobbery", title: "Highway robbery / spreading corruption", category: "criminalJustice", refs: ["5:33-34"], tags: ["Corruption", "Public Harm", "Justice"], desc: "Quran references related to spreading corruption and public harm." },
  { id: "falseAccusation", title: "False accusation", category: "criminalJustice", refs: ["24:4-5", "24:11-20"], tags: ["Slander", "Accusation", "Justice"], desc: "Quran references related to false accusation and slander." },
  { id: "zina", title: "Zina", category: "criminalJustice", refs: ["17:32", "24:2"], tags: ["Zina", "Chastity", "Justice"], desc: "Quran references related to unlawful sexual conduct." },
  { id: "murderAccountability", title: "Murder and accountability", category: "criminalJustice", refs: ["4:92-93", "25:68"], tags: ["Murder", "Accountability", "Justice"], desc: "Quran references related to unlawful killing and accountability." },
  { id: "prayer", title: "Prayer", category: "worshipRulings", refs: ["4:103", "17:78", "2:238"], tags: ["Prayer", "Salah", "Worship"], desc: "Quran references related to the obligation and times of prayer." },
  { id: "ablution", title: "Ablution / tayammum", category: "worshipRulings", refs: ["5:6", "4:43"], tags: ["Ablution", "Tayammum", "Purity"], desc: "Quran references related to ablution and dry purification." },
  { id: "fasting", title: "Fasting Ramadan", category: "worshipRulings", refs: ["2:183-187"], tags: ["Fasting", "Ramadan", "Worship"], desc: "Quran references related to fasting in Ramadan." },
  { id: "hajjUmrah", title: "Hajj and Umrah", category: "worshipRulings", refs: ["2:196-203", "3:96-97", "22:27-29"], tags: ["Hajj", "Umrah", "Pilgrimage"], desc: "Quran references related to the pilgrimage of Hajj and Umrah." },
  { id: "qiblah", title: "Qiblah", category: "worshipRulings", refs: ["2:142-150"], tags: ["Qiblah", "Prayer", "Direction"], desc: "Quran references related to the direction of prayer (qiblah)." },
  { id: "fridayPrayer", title: "Friday prayer", category: "worshipRulings", refs: ["62:9-11"], tags: ["Jumuah", "Prayer", "Worship"], desc: "Quran references related to the Friday congregational prayer." },
  { id: "lawfulFood", title: "Lawful and good food", category: "foodConsumption", refs: ["2:168", "5:88", "16:114"], tags: ["Food", "Lawful", "Tayyib"], desc: "Quran references related to eating what is lawful and wholesome." },
  { id: "forbiddenFoods", title: "Forbidden foods", category: "foodConsumption", refs: ["2:173", "5:3", "6:145", "16:115"], tags: ["Food", "Forbidden", "Diet"], desc: "Quran references related to foods that are forbidden." },
  { id: "hunting", title: "Hunting / game", category: "foodConsumption", refs: ["5:1-4", "5:94-96"], tags: ["Hunting", "Game", "Ihram"], desc: "Quran references related to hunting and game." },
  { id: "intoxicantsGambling", title: "Intoxicants and gambling", category: "foodConsumption", refs: ["2:219", "5:90-91"], tags: ["Intoxicants", "Gambling", "Harm"], desc: "Quran references related to intoxicants and gambling." },
  { id: "justiceTestimony", title: "Justice and testimony", category: "socialRights", refs: ["4:135", "5:8"], tags: ["Justice", "Testimony", "Fairness"], desc: "Quran references related to upholding justice and honest testimony." },
  { id: "witnesses", title: "Witnesses", category: "socialRights", refs: ["2:282", "5:106-108"], tags: ["Witnesses", "Testimony", "Justice"], desc: "Quran references related to witnesses and giving testimony." },
  { id: "privacyHomes", title: "Privacy and entering homes", category: "socialRights", refs: ["24:27-29", "24:58-59"], tags: ["Privacy", "Homes", "Conduct"], desc: "Quran references related to privacy and seeking permission before entering homes." },
  { id: "modestyGaze", title: "Modesty and lowering gaze", category: "socialRights", refs: ["24:30-31", "33:59"], tags: ["Modesty", "Gaze", "Conduct"], desc: "Quran references related to modesty and lowering the gaze." },
  { id: "backbitingSuspicion", title: "Backbiting, mockery, suspicion", category: "socialRights", refs: ["49:11-12"], tags: ["Backbiting", "Mockery", "Suspicion"], desc: "Quran references related to backbiting, mockery, and suspicion." },
  { id: "reconcileBelievers", title: "Reconciliation between believers", category: "socialRights", refs: ["49:9-10"], tags: ["Reconciliation", "Brotherhood", "Peace"], desc: "Quran references related to reconciliation between believers." },
  { id: "kindnessNonHostile", title: "Kindness to non-hostile others", category: "socialRights", refs: ["60:8-9"], tags: ["Kindness", "Justice", "Conduct"], desc: "Quran references related to kindness and justice toward those who are not hostile." },
  { id: "oathsExpiation", title: "Oaths and expiation", category: "oathsVows", refs: ["5:89"], tags: ["Oaths", "Expiation", "Kaffarah"], desc: "Quran references related to oaths and their expiation." },
  { id: "ila", title: "Ila / oath of abstention", category: "oathsVows", refs: ["2:226-227"], tags: ["Ila", "Oaths", "Marriage"], desc: "Quran references related to the oath of abstention (ila)." },
  { id: "zihar", title: "Zihar", category: "oathsVows", refs: ["58:1-4"], tags: ["Zihar", "Expiation", "Family"], desc: "Quran references related to zihar and its expiation." },
];

/* ===================================================================== */
/* Collection registry                                                   */
/* ===================================================================== */
export const COLLECTIONS: Collection[] = [
  {
    id: "duas",
    eyebrow: "From the Quran",
    title: "Quranic Duas",
    subtitle: "Supplications found directly in the Quran, each anchored to its ayah.",
    sourceNote: "Only duas present in the Quran — no hadith duas, paraphrase, or generated devotional text.",
    icon: IC.hands,
    items: DUAS,
    categories: DUA_CATEGORIES,
    showTafsir: true,
  },
  {
    id: "prophet-stories",
    eyebrow: "From the Quran",
    title: "Prophet Stories",
    subtitle: "Where the Quran tells of the prophets — the passages themselves.",
    sourceNote: "Quran-backed references only. Summaries describe what the passages cover — no tafsir, hadith, or history added.",
    icon: IC.person,
    items: PROPHET_STORIES,
    categories: PROPHET_CATEGORIES,
    showTafsir: true,
  },
  {
    id: "quranic-parables",
    eyebrow: "From the Quran",
    title: "Quranic Parables",
    subtitle: "The similitudes and examples the Quran presents.",
    sourceNote: "Only Quran-backed parables with explicit references — nothing interpreted or generated.",
    icon: IC.book,
    items: PARABLES,
    categories: PARABLE_CATEGORIES,
    showTafsir: true,
    mainBadge: true,
  },
  {
    id: "commands-prohibitions",
    eyebrow: "From the Quran",
    title: "Commands & Prohibitions",
    subtitle: "What the Quran enjoins and what it forbids — references only.",
    sourceNote: "A reference index of Quran passages, not rulings or fatwas.",
    icon: IC.scroll,
    items: COMMANDS_PROHIBITIONS,
    categories: CP_CATEGORIES,
    showTafsir: true,
    typeBadge: true,
    typeFilter: [
      { value: "command", label: "Commands" },
      { value: "prohibition", label: "Prohibitions" },
    ],
  },
  {
    id: "quranic-warnings",
    eyebrow: "From the Quran",
    title: "Quranic Warnings",
    subtitle: "Cautions the Quran raises, anchored to ayah references.",
    sourceNote: "Quran-backed references only; no generated explanation.",
    icon: IC.alert,
    items: WARNINGS,
    categories: WARNING_CATEGORIES,
    showTafsir: true,
  },
  {
    id: "ethical-character-map",
    eyebrow: "From the Quran",
    title: "Ethical Character Map",
    subtitle: "Traits to cultivate and to avoid, by ayah reference.",
    sourceNote: "Quran-backed references only; nothing generated.",
    icon: IC.heart,
    items: CHARACTER_TRAITS,
    categories: CHAR_CATEGORIES,
    showTafsir: true,
    typeBadge: true,
    typeFilter: [
      { value: "cultivate", label: "Cultivate" },
      { value: "avoid", label: "Avoid" },
    ],
  },
  {
    id: "legal-ruling-references",
    eyebrow: "From the Quran",
    title: "Legal & Ruling References",
    subtitle: "A Quran-backed index of practical, ruling-related passages.",
    sourceNote: "A reference list only — it does not issue fatwas, rulings, or legal conclusions.",
    icon: IC.scales,
    items: LEGAL_REFERENCES,
    categories: LEGAL_CATEGORIES,
    showTafsir: true,
  },
];

export const COLLECTION_BY_ID: Record<string, Collection> = Object.fromEntries(
  COLLECTIONS.map((c) => [c.id, c]),
);

/** Surah number → { name, ar } for per-surah group headers (from facts SURAHS). */
export { SURAHS } from "./data";
