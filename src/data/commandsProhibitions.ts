import type { RefItem } from "@/components/RefItemsScreen";

/* AskQuran — Commands and Prohibitions. Quran-backed only, with explicit ayah
   references. `shortLabel` is a short neutral source-backed line — no rulings or
   fatwas. Arabic/translation loaded verbatim from source. */

export const CP_CATEGORIES: { id: string; title: string }[] = [
  { id: "worship", title: "Worship" },
  { id: "familySociety", title: "Family and Society" },
  { id: "wealthJustice", title: "Wealth and Justice" },
  { id: "speechCharacter", title: "Speech and Character" },
  { id: "prohibitedActions", title: "Prohibited Actions" },
];

export const COMMANDS_PROHIBITIONS: RefItem[] = [
  // Commands
  { id: "worshipAllah", title: "Worship Allah Alone", type: "command", category: "worship", refs: ["2:21-22", "4:36", "17:23"], tags: ["Tawhid", "Worship"], shortLabel: "Quranic commands to worship Allah and not associate partners with Him." },
  { id: "establishPrayer", title: "Establish Prayer", type: "command", category: "worship", refs: ["2:43", "2:238", "4:103", "29:45"], tags: ["Prayer", "Salah"], shortLabel: "Quranic commands and reminders about establishing and guarding prayer." },
  { id: "giveZakat", title: "Give Zakat and Charity", type: "command", category: "worship", refs: ["2:43", "2:110", "9:60", "9:103"], tags: ["Zakat", "Charity"], shortLabel: "Quranic references to zakat, giving, and purification of wealth." },
  { id: "fastRamadan", title: "Fast in Ramadan", type: "command", category: "worship", refs: ["2:183-187"], tags: ["Fasting", "Ramadan"], shortLabel: "Quranic guidance on fasting in Ramadan and related allowances." },
  { id: "performHajj", title: "Perform Hajj", type: "command", category: "worship", refs: ["3:96-97", "2:196-197", "22:27-29"], tags: ["Hajj", "Pilgrimage"], shortLabel: "Quranic references to pilgrimage, rites, and the Sacred House." },
  { id: "honorParents", title: "Honor Parents", type: "command", category: "familySociety", refs: ["17:23-24", "31:14-15", "4:36"], tags: ["Parents", "Family"], shortLabel: "Quranic commands to show goodness and gratitude to parents." },
  { id: "relativesDue", title: "Give Relatives Their Due", type: "command", category: "familySociety", refs: ["17:26", "16:90", "4:36"], tags: ["Relatives", "Kinship"], shortLabel: "Quranic guidance on giving relatives their due and maintaining social rights." },
  { id: "protectOrphans", title: "Protect Orphans", type: "command", category: "familySociety", refs: ["4:2-6", "2:220"], tags: ["Orphans", "Property"], shortLabel: "Quranic guidance on caring for orphans and protecting their property." },
  { id: "fulfillCovenants", title: "Fulfill Covenants and Contracts", type: "command", category: "wealthJustice", refs: ["5:1", "16:91", "17:34"], tags: ["Covenants", "Contracts"], shortLabel: "Quranic commands to fulfill covenants and commitments." },
  { id: "writeDebts", title: "Write Debt Contracts", type: "command", category: "wealthJustice", refs: ["2:282-283"], tags: ["Debt", "Witnesses", "Contracts"], shortLabel: "Quranic guidance on recording debts, witnesses, and trust." },
  { id: "standJustice", title: "Stand Firm for Justice", type: "command", category: "wealthJustice", refs: ["4:58", "4:135", "5:8"], tags: ["Justice", "Witness"], shortLabel: "Quranic commands to judge with justice and stand firmly as witnesses." },
  { id: "speakTruth", title: "Speak Truthfully", type: "command", category: "speechCharacter", refs: ["9:119", "33:70-71"], tags: ["Truth", "Speech"], shortLabel: "Quranic guidance on being with the truthful and speaking rightly." },
  { id: "bePatient", title: "Be Patient", type: "command", category: "speechCharacter", refs: ["2:153-157", "3:200", "103:1-3"], tags: ["Patience", "Steadfastness"], shortLabel: "Quranic guidance on patience, steadfastness, and seeking help through patience." },
  { id: "forgivePardon", title: "Forgive and Pardon", type: "command", category: "speechCharacter", refs: ["3:134", "24:22", "42:40"], tags: ["Forgiveness", "Mercy"], shortLabel: "Quranic guidance on restraining anger, pardoning, and forgiving." },
  // Prohibitions
  { id: "noShirk", title: "Do Not Commit Shirk", type: "prohibition", category: "prohibitedActions", refs: ["4:36", "31:13", "4:48"], tags: ["Shirk", "Tawhid"], shortLabel: "Quranic warnings against associating partners with Allah." },
  { id: "noUnlawfulKilling", title: "Do Not Kill Unlawfully", type: "prohibition", category: "prohibitedActions", refs: ["5:32", "6:151", "17:31-33", "25:68"], tags: ["Life", "Murder"], shortLabel: "Quranic prohibitions against unlawful killing and killing children." },
  { id: "noZina", title: "Do Not Approach Zina", type: "prohibition", category: "prohibitedActions", refs: ["17:32", "24:2"], tags: ["Zina", "Modesty"], shortLabel: "Quranic warning against approaching zina and its consequences." },
  { id: "noRiba", title: "Do Not Consume Riba", type: "prohibition", category: "wealthJustice", refs: ["2:275-281", "3:130"], tags: ["Riba", "Wealth"], shortLabel: "Quranic references warning against riba." },
  { id: "noUnjustWealth", title: "Do Not Consume Wealth Unjustly", type: "prohibition", category: "wealthJustice", refs: ["2:188", "4:29"], tags: ["Property", "Fraud"], shortLabel: "Quranic prohibitions against consuming wealth unjustly." },
  { id: "noOrphanProperty", title: "Do Not Consume Orphan Property Unjustly", type: "prohibition", category: "wealthJustice", refs: ["4:10", "4:2"], tags: ["Orphans", "Property"], shortLabel: "Quranic warnings against consuming orphan property unjustly." },
  { id: "noCheatMeasure", title: "Do Not Cheat in Measure and Weight", type: "prohibition", category: "wealthJustice", refs: ["83:1-6", "11:84-85", "26:181-183"], tags: ["Trade", "Measure", "Fraud"], shortLabel: "Quranic warnings against fraud in measure and weight." },
  { id: "noIntoxicants", title: "Avoid Intoxicants and Gambling", type: "prohibition", category: "prohibitedActions", refs: ["2:219", "5:90-91"], tags: ["Intoxicants", "Gambling"], shortLabel: "Quranic references about intoxicants, gambling, harm, and avoidance." },
  { id: "noBackbiting", title: "Do Not Mock, Insult, Spy, or Backbite", type: "prohibition", category: "speechCharacter", refs: ["49:11-12"], tags: ["Mockery", "Backbiting", "Suspicion"], shortLabel: "Quranic warnings against mockery, insulting one another, suspicion, spying, and backbiting." },
  { id: "noFollowNoKnowledge", title: "Do Not Follow What You Have No Knowledge Of", type: "prohibition", category: "speechCharacter", refs: ["17:36"], tags: ["Knowledge", "Speech", "Responsibility"], shortLabel: "Quranic warning against following or speaking without knowledge." },
  { id: "noArrogance", title: "Do Not Be Arrogant", type: "prohibition", category: "speechCharacter", refs: ["17:37", "31:18"], tags: ["Arrogance", "Humility"], shortLabel: "Quranic warnings against arrogance and pride." },
];
