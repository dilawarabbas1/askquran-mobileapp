/* AskQuran — Prophet Stories in the Quran
   Only Quran-backed references. The `summary` is neutral and source-backed: it
   describes only what the referenced passages cover — no tafsir, hadith, or
   historical detail. Arabic prophet names are verbatim; the transliterated name
   and summary are localised (prophet.p.<id>.name / .summary). Ayah text itself
   is never stored here — it is fetched verbatim from the backend Quran source. */

export interface ProphetStory {
  id: string;
  prophet: string; // transliterated (display localised via i18n)
  arabicName: string; // verbatim Arabic — never translated
  category: string; // category id (see PROPHET_CATEGORIES)
  summary: string;
  refs: string[];
  note?: string;
}

/** Categories, in display order. Labels localised via prophet.cat.<id>. */
export const PROPHET_CATEGORIES: { id: string; title: string }[] = [
  { id: "foundational", title: "Foundational Stories" },
  { id: "familyTrials", title: "Family and Trials" },
  { id: "musaIsrael", title: "Musa and Bani Israel" },
  { id: "warnings", title: "Warnings and Rescue" },
  { id: "mercyCalling", title: "Mercy, Illness, and Calling" },
  { id: "finalMessenger", title: "Isa and Final Messenger" },
  { id: "other", title: "Other Prophets Mentioned" },
];

export const PROPHET_STORIES: ProphetStory[] = [
  // ---- Foundational ----
  { id: "adam", prophet: "Adam", arabicName: "آدم", category: "foundational", refs: ["2:30-39", "7:11-27", "20:115-123"], summary: "Quran passages about Adam's creation, the command to the angels, Iblis refusing, the test, repentance, and descent." },
  { id: "nuh", prophet: "Nuh", arabicName: "نوح", category: "foundational", refs: ["7:59-64", "11:25-49", "23:23-30", "71:1-28"], summary: "Quran passages about Nuh calling his people, their rejection, the flood, and salvation." },
  { id: "ibrahim", prophet: "Ibrahim", arabicName: "إبراهيم", category: "foundational", refs: ["2:124-132", "6:74-83", "14:35-41", "21:51-73", "37:83-113"], summary: "Quran passages about Ibrahim's call to tawhid, rejection of idols, trials, family, and supplications." },

  // ---- Family and Trials ----
  { id: "yusuf", prophet: "Yusuf", arabicName: "يوسف", category: "familyTrials", refs: ["12:3-101"], summary: "Quran passage covering the story of Yusuf, his dream, family trial, slavery, imprisonment, authority, reunion, and gratitude to Allah.", note: "This is a long narrative range." },
  { id: "yaqub", prophet: "Yaqub", arabicName: "يعقوب", category: "familyTrials", refs: ["2:132-133", "12:6", "12:38", "12:84-87"], summary: "Quran passages connected to Yaqub's counsel, patience, and trust in Allah." },
  { id: "ismail", prophet: "Ismail", arabicName: "إسماعيل", category: "familyTrials", refs: ["2:125-129", "19:54-55", "37:100-107"], summary: "Quran passages connected to Ismail, the Sacred House, prayer, and the trial with Ibrahim." },
  { id: "ishaq", prophet: "Ishaq", arabicName: "إسحاق", category: "familyTrials", refs: ["11:71-73", "21:72-73", "37:112-113"], summary: "Quran passages mentioning Ishaq as a blessing and among the righteous." },

  // ---- Musa and Bani Israel ----
  { id: "musa", prophet: "Musa", arabicName: "موسى", category: "musaIsrael", refs: ["2:49-61", "7:103-137", "20:9-98", "26:10-68", "28:3-46"], summary: "Quran passages about Musa, Pharaoh, the signs, rescue of the Children of Israel, and lessons from their trials.", note: "These are long narrative ranges." },
  { id: "harun", prophet: "Harun", arabicName: "هارون", category: "musaIsrael", refs: ["20:29-36", "20:90-94", "25:35", "37:114-122"], summary: "Quran passages mentioning Harun's role with Musa and his counsel to the people." },
  { id: "dawud", prophet: "Dawud", arabicName: "داوود", category: "musaIsrael", refs: ["2:251", "21:78-80", "34:10-11", "38:17-26"], summary: "Quran passages about Dawud, judgement, wisdom, worship, and blessings." },
  { id: "sulayman", prophet: "Sulayman", arabicName: "سليمان", category: "musaIsrael", refs: ["21:78-82", "27:15-44", "34:12-14", "38:30-40"], summary: "Quran passages about Sulayman, wisdom, kingdom, the hoopoe, the Queen of Saba, and gratitude." },

  // ---- Warnings and Rescue ----
  { id: "hud", prophet: "Hud", arabicName: "هود", category: "warnings", refs: ["7:65-72", "11:50-60", "26:123-140"], summary: "Quran passages about Hud calling Aad and warning against arrogance and rejection." },
  { id: "salih", prophet: "Salih", arabicName: "صالح", category: "warnings", refs: ["7:73-79", "11:61-68", "26:141-159", "91:11-15"], summary: "Quran passages about Salih, Thamud, the she-camel sign, and rejection." },
  { id: "lut", prophet: "Lut", arabicName: "لوط", category: "warnings", refs: ["7:80-84", "11:77-83", "26:160-175", "27:54-58", "29:28-35"], summary: "Quran passages about Lut warning his people and their wrongdoing." },
  { id: "shuayb", prophet: "Shuayb", arabicName: "شعيب", category: "warnings", refs: ["7:85-93", "11:84-95", "26:176-191", "29:36-37"], summary: "Quran passages about Shuayb warning against cheating in measure, corruption, and rejection." },

  // ---- Mercy, Illness, and Calling ----
  { id: "yunus", prophet: "Yunus", arabicName: "يونس", category: "mercyCalling", refs: ["10:98", "21:87-88", "37:139-148"], summary: "Quran passages about Yunus, his distress, dua, and Allah's mercy." },
  { id: "ayyub", prophet: "Ayyub", arabicName: "أيوب", category: "mercyCalling", refs: ["21:83-84", "38:41-44"], summary: "Quran passages about Ayyub's trial, patience, dua, and relief." },
  { id: "zakariya", prophet: "Zakariya", arabicName: "زكريا", category: "mercyCalling", refs: ["3:37-41", "19:2-15", "21:89-90"], summary: "Quran passages about Zakariya's dua and the glad tidings of Yahya." },
  { id: "yahya", prophet: "Yahya", arabicName: "يحيى", category: "mercyCalling", refs: ["3:39", "19:7-15"], summary: "Quran passages mentioning Yahya, wisdom, purity, and righteousness." },

  // ---- Isa and Final Messenger ----
  { id: "isa", prophet: "Isa", arabicName: "عيسى", category: "finalMessenger", refs: ["3:45-55", "5:110-118", "19:16-36", "61:6"], summary: "Quran passages about Isa, Maryam, signs by Allah's permission, his message, and Allah's clarification." },
  { id: "muhammad", prophet: "Muhammad", arabicName: "محمد", category: "finalMessenger", refs: ["3:144", "33:40", "47:2", "48:29", "61:6"], summary: "Quran references naming Muhammad and Ahmad, his role as Messenger, and finality of prophethood." },

  // ---- Other Prophets Mentioned ----
  { id: "idris", prophet: "Idris", arabicName: "إدريس", category: "other", refs: ["19:56-57", "21:85-86"], summary: "Quran references mentioning Idris among the truthful and patient." },
  { id: "dhulkifl", prophet: "Dhul-Kifl", arabicName: "ذا الكفل", category: "other", refs: ["21:85-86", "38:48"], summary: "Quran references mentioning Dhul-Kifl among the patient and chosen." },
  { id: "ilyas", prophet: "Ilyas", arabicName: "إلياس", category: "other", refs: ["6:85", "37:123-132"], summary: "Quran references mentioning Ilyas and his call." },
  { id: "alyasa", prophet: "Al-Yasa", arabicName: "اليسع", category: "other", refs: ["6:86", "38:48"], summary: "Quran references mentioning Al-Yasa among those favored and chosen." },
];
