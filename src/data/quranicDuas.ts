/* AskQuran — Quranic Duas
   Only duas that are DIRECTLY present in the Quran, each anchored to ayah
   references. No hadith duas, no invented/paraphrased wording, no generated
   devotional text. Arabic is NOT stored here: the Quran Arabic text is shown
   verbatim via the app's existing search (reference chips link to it), so it is
   never duplicated or altered in this file. Titles/contexts are neutral and
   source-backed; they are localised via duas.d.<id>.t / duas.d.<id>.c. */

export interface QuranicDua {
  id: string;
  category: string; // category id (see DUA_CATEGORIES)
  title: string; // English source (display localised via i18n)
  refs: string[];
  context: string; // English source (display localised via i18n)
}

/** Dua categories, in display order. Labels are localised via duas.cat.<id>. */
export const DUA_CATEGORIES: { id: string; title: string }[] = [
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

export const DUAS: QuranicDua[] = [
  // ---- Guidance ----
  { id: "seekingGuidance", category: "guidance", title: "Seeking guidance", refs: ["1:6"], context: "Dua from Surah Al-Fatihah asking Allah to guide to the straight path." },
  { id: "heartsSteadfast", category: "guidance", title: "Hearts not deviating after guidance", refs: ["3:8"], context: "Dua asking Allah not to let hearts deviate after guidance and asking for mercy." },

  // ---- Forgiveness ----
  { id: "pardonMercy", category: "forgiveness", title: "Forgiveness and mercy", refs: ["2:286"], context: "Dua asking Allah for pardon, forgiveness, mercy, and help." },
  { id: "forgiveBelievers", category: "forgiveness", title: "Forgiveness for believers", refs: ["14:41"], context: "Dua of Ibrahim asking forgiveness for himself, his parents, and believers on the Day of Account." },
  { id: "forgiveWrongdoing", category: "forgiveness", title: "Forgiveness after wrongdoing", refs: ["28:16"], context: "Dua of Musa after acknowledging wrongdoing." },

  // ---- Parents & Family ----
  { id: "mercyParents", category: "family", title: "Mercy for parents", refs: ["17:24"], context: "Dua asking Allah to have mercy on parents as they raised the child when young." },
  { id: "righteousFamily", category: "family", title: "Righteous family", refs: ["25:74"], context: "Dua asking Allah for comfort from spouses and offspring and leadership among the righteous." },
  { id: "protectDescendants", category: "family", title: "Protection for family and descendants", refs: ["14:35-41"], context: "Dua of Ibrahim for security, worship, provision, and forgiveness." },

  // ---- Knowledge & Speech ----
  { id: "increaseKnowledge", category: "knowledge", title: "Increase in knowledge", refs: ["20:114"], context: "Dua asking Allah to increase knowledge." },
  { id: "easeSpeech", category: "knowledge", title: "Ease speech and task", refs: ["20:25-28"], context: "Dua of Musa asking Allah to open his chest, ease his task, and loosen his tongue." },

  // ---- Mercy ----
  { id: "mercyForgiveness", category: "mercy", title: "Mercy and forgiveness", refs: ["7:151"], context: "Dua of Musa asking Allah for forgiveness and mercy." },
  { id: "believedForgive", category: "mercy", title: "We believed, so forgive us", refs: ["23:109"], context: "Dua asking Allah for forgiveness and mercy." },
  { id: "mercyGuidance", category: "mercy", title: "Mercy from Allah", refs: ["18:10"], context: "Dua of the youths of the cave asking for mercy and right guidance." },

  // ---- Protection ----
  { id: "fromWrongdoers", category: "protection", title: "Protection from wrongdoing people", refs: ["10:85-86"], context: "Dua asking Allah not to make believers a trial for wrongdoing people and to save them." },
  { id: "fromHellfire", category: "protection", title: "Protection from Hellfire", refs: ["3:191"], context: "Dua asking Allah for protection from the punishment of the Fire." },
  { id: "fromSatan", category: "protection", title: "Protection from Satan", refs: ["23:97-98"], context: "Dua seeking refuge from the incitements and presence of devils." },

  // ---- Repentance ----
  { id: "adamHawwa", category: "repentance", title: "Dua of Adam and Hawwa", refs: ["7:23"], context: "Dua acknowledging wrongdoing and asking for forgiveness and mercy." },
  { id: "yunus", category: "repentance", title: "Dua of Yunus", refs: ["21:87"], context: "Dua of Yunus in distress, declaring Allah's perfection and admitting wrongdoing." },
  { id: "acceptRepentance", category: "repentance", title: "Accept our repentance", refs: ["2:128"], context: "Dua of Ibrahim and Ismail asking Allah to accept repentance." },

  // ---- Provision & Good ----
  { id: "goodBothWorlds", category: "provision", title: "Good in this world and next", refs: ["2:201"], context: "Dua asking for good in this world, good in the Hereafter, and protection from the Fire." },
  { id: "needGood", category: "provision", title: "Need of good from Allah", refs: ["28:24"], context: "Dua of Musa expressing need for whatever good Allah sends down." },
  { id: "makeGrateful", category: "provision", title: "Make me grateful", refs: ["27:19"], context: "Dua of Sulayman asking to be grateful and to do righteous deeds pleasing to Allah." },

  // ---- Victory & Patience ----
  { id: "patienceFirmFeet", category: "patience", title: "Patience and firm feet", refs: ["2:250"], context: "Dua asking Allah for patience, firmness, and help." },
  { id: "pourPatience", category: "patience", title: "Pour patience upon us", refs: ["7:126"], context: "Dua asking Allah to pour patience and cause death in submission." },
  { id: "helpDisbelievers", category: "patience", title: "Help against disbelieving people", refs: ["3:147"], context: "Dua asking forgiveness, firmness, and help." },
];
