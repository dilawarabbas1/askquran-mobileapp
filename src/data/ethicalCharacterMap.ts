import type { RefItem } from "@/components/RefItemsScreen";

/* AskQuran — Ethical Character Map. Quran-backed traits to cultivate or avoid,
   each with explicit ayah references. `shortLabel` is a short neutral
   source-backed line. Arabic/translation loaded verbatim from source. */

export const CHAR_CATEGORIES: { id: string; title: string }[] = [
  { id: "heartFaith", title: "Heart and Faith" },
  { id: "speech", title: "Speech" },
  { id: "socialConduct", title: "Social Conduct" },
  { id: "selfControl", title: "Self-Control" },
  { id: "wealthResp", title: "Wealth and Responsibility" },
];

export const CHARACTER_TRAITS: RefItem[] = [
  // Cultivate
  { id: "taqwa", title: "Taqwa", type: "cultivate", category: "heartFaith", refs: ["2:2-5", "3:133-136", "49:13"], tags: ["Taqwa", "God-consciousness"], shortLabel: "Quranic references to God-consciousness and its qualities." },
  { id: "patience", title: "Patience", type: "cultivate", category: "selfControl", refs: ["2:153-157", "3:200", "103:1-3"], tags: ["Patience", "Steadfastness"], shortLabel: "Quranic guidance on patience and steadfastness." },
  { id: "gratitude", title: "Gratitude", type: "cultivate", category: "heartFaith", refs: ["2:152", "14:7", "31:12"], tags: ["Gratitude", "Shukr"], shortLabel: "Quranic references to gratitude and remembering Allah." },
  { id: "truthfulness", title: "Truthfulness", type: "cultivate", category: "speech", refs: ["9:119", "33:70-71"], tags: ["Truth", "Speech"], shortLabel: "Quranic guidance on being truthful and speaking rightly." },
  { id: "humility", title: "Humility", type: "cultivate", category: "socialConduct", refs: ["25:63", "31:18-19"], tags: ["Humility", "Walking", "Speech"], shortLabel: "Quranic guidance on humility in conduct and speech." },
  { id: "mercyKindness", title: "Mercy and Kindness", type: "cultivate", category: "socialConduct", refs: ["3:159", "90:17", "17:23-24"], tags: ["Mercy", "Kindness"], shortLabel: "Quranic references to mercy, compassion, and kindness." },
  { id: "forgiveness", title: "Forgiveness", type: "cultivate", category: "socialConduct", refs: ["3:134", "24:22", "42:40"], tags: ["Forgiveness", "Pardon"], shortLabel: "Quranic guidance on pardoning, forgiving, and restraining anger." },
  { id: "justice", title: "Justice", type: "cultivate", category: "socialConduct", refs: ["4:58", "4:135", "5:8"], tags: ["Justice", "Witness"], shortLabel: "Quranic guidance on judging with justice and standing firmly as witnesses." },
  { id: "trustworthiness", title: "Trustworthiness", type: "cultivate", category: "wealthResp", refs: ["4:58", "23:8", "70:32"], tags: ["Trust", "Amanah"], shortLabel: "Quranic references to rendering trusts and keeping commitments." },
  { id: "modesty", title: "Modesty", type: "cultivate", category: "selfControl", refs: ["24:30-31", "33:59"], tags: ["Modesty", "Gaze"], shortLabel: "Quranic guidance on lowering the gaze and modest conduct." },
  { id: "charityGenerosity", title: "Charity and Generosity", type: "cultivate", category: "wealthResp", refs: ["2:261-274", "3:134", "57:18"], tags: ["Charity", "Generosity"], shortLabel: "Quranic references to giving, spending, and generosity." },
  { id: "relianceAllah", title: "Reliance on Allah", type: "cultivate", category: "heartFaith", refs: ["3:159", "65:3", "11:123"], tags: ["Tawakkul", "Reliance"], shortLabel: "Quranic guidance on relying upon Allah." },
  // Avoid
  { id: "arrogance", title: "Arrogance", type: "avoid", category: "heartFaith", refs: ["17:37", "31:18", "7:146"], tags: ["Arrogance", "Pride"], shortLabel: "Quranic warnings against arrogance and pride." },
  { id: "envy", title: "Envy", type: "avoid", category: "heartFaith", refs: ["4:54", "113:5"], tags: ["Envy", "Hasad"], shortLabel: "Quranic references connected to envy and seeking protection from it." },
  { id: "greedHoarding", title: "Greed and Hoarding", type: "avoid", category: "wealthResp", refs: ["9:34-35", "104:1-3", "70:18"], tags: ["Greed", "Hoarding"], shortLabel: "Quranic warnings against hoarding wealth and being consumed by accumulation." },
  { id: "backbiting", title: "Backbiting", type: "avoid", category: "speech", refs: ["49:12"], tags: ["Backbiting", "Speech"], shortLabel: "Quranic warning against backbiting." },
  { id: "mockery", title: "Mockery and Insulting Others", type: "avoid", category: "speech", refs: ["49:11"], tags: ["Mockery", "Insult"], shortLabel: "Quranic warning against mockery, insulting, and offensive nicknames." },
  { id: "suspicionSpying", title: "Suspicion and Spying", type: "avoid", category: "speech", refs: ["49:12"], tags: ["Suspicion", "Spying"], shortLabel: "Quranic warning against much suspicion and spying." },
  { id: "lying", title: "Lying", type: "avoid", category: "speech", refs: ["22:30", "33:70-71", "16:105"], tags: ["Lying", "Falsehood"], shortLabel: "Quranic warnings against false speech and lying." },
  { id: "wastefulness", title: "Wastefulness", type: "avoid", category: "wealthResp", refs: ["17:26-27", "7:31"], tags: ["Waste", "Extravagance"], shortLabel: "Quranic warnings against wastefulness and extravagance." },
  { id: "miserliness", title: "Miserliness", type: "avoid", category: "wealthResp", refs: ["4:37", "57:24", "3:180"], tags: ["Miserliness", "Wealth"], shortLabel: "Quranic warnings against miserliness and withholding." },
  { id: "anger", title: "Anger Without Restraint", type: "avoid", category: "selfControl", refs: ["3:134", "42:37"], tags: ["Anger", "Restraint"], shortLabel: "Quranic praise for those who restrain anger and forgive." },
  { id: "despair", title: "Despair", type: "avoid", category: "heartFaith", refs: ["39:53", "12:87"], tags: ["Despair", "Mercy"], shortLabel: "Quranic warnings against despairing of Allah's mercy." },
  { id: "followingDesire", title: "Following Desire Over Guidance", type: "avoid", category: "selfControl", refs: ["45:23", "7:176", "28:50"], tags: ["Desire", "Guidance"], shortLabel: "Quranic warnings about following desire instead of guidance." },
];
