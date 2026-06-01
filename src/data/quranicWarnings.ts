import type { RefItem } from "@/components/RefItemsScreen";

/* AskQuran — Quranic Warnings. Quran-backed only, with explicit ayah references.
   `shortLabel` is a short neutral source-backed line — no generated explanation.
   Arabic/translation loaded verbatim from source. */

export const WARNING_CATEGORIES: { id: string; title: string }[] = [
  { id: "belief", title: "Belief and Guidance" },
  { id: "wealthRights", title: "Wealth and Rights" },
  { id: "familySociety", title: "Family and Society" },
  { id: "speechCharacter", title: "Speech and Character" },
  { id: "accountability", title: "Accountability" },
];

export const WARNINGS: RefItem[] = [
  { id: "noDespair", title: "Do Not Despair of Allah's Mercy", category: "belief", refs: ["39:53"], tags: ["Mercy", "Repentance", "Hope"], shortLabel: "Quranic warning not to despair of Allah's mercy." },
  { id: "shirk", title: "Beware of Shirk", severity: "major", category: "belief", refs: ["4:48", "31:13", "4:116"], tags: ["Shirk", "Tawhid"], shortLabel: "Quranic warnings about associating partners with Allah." },
  { id: "shaytanSteps", title: "Do Not Follow Shaytan's Footsteps", category: "belief", refs: ["2:168-169", "24:21", "35:6"], tags: ["Shaytan", "Guidance"], shortLabel: "Quranic warnings against following the footsteps of Shaytan." },
  { id: "worldlyDeception", title: "Do Not Be Deceived by Worldly Life", category: "belief", refs: ["31:33", "57:20", "3:185"], tags: ["Worldly Life", "Deception"], shortLabel: "Quranic warnings about the temporary nature and deception of worldly life." },
  { id: "hypocrisy", title: "Warning Against Hypocrisy", category: "belief", refs: ["2:8-10", "4:145", "63:1-4"], tags: ["Hypocrisy", "Faith"], shortLabel: "Quranic warnings about hypocrisy and its consequences." },
  { id: "unjustWealth", title: "Do Not Consume Wealth Unjustly", category: "wealthRights", refs: ["2:188", "4:29"], tags: ["Wealth", "Fraud", "Rights"], shortLabel: "Quranic warnings against taking wealth unjustly." },
  { id: "riba", title: "Warning Against Riba", severity: "major", category: "wealthRights", refs: ["2:275-281", "3:130"], tags: ["Riba", "Wealth"], shortLabel: "Quranic warnings about riba and accountability." },
  { id: "orphanAbuse", title: "Warning Against Orphan Property Abuse", category: "wealthRights", refs: ["4:10", "4:2"], tags: ["Orphans", "Property"], shortLabel: "Quranic warning against consuming orphan property unjustly." },
  { id: "cheatMeasure", title: "Warning Against Cheating in Measure", category: "wealthRights", refs: ["83:1-6", "11:84-85"], tags: ["Trade", "Fraud", "Measure"], shortLabel: "Quranic warnings against cheating in measure and weight." },
  { id: "killingChildren", title: "Warning Against Killing Children", category: "familySociety", refs: ["17:31", "6:151"], tags: ["Children", "Provision", "Life"], shortLabel: "Quranic warnings against killing children out of fear of poverty." },
  { id: "zina", title: "Warning Against Zina", category: "familySociety", refs: ["17:32", "24:2"], tags: ["Zina", "Modesty"], shortLabel: "Quranic warning not to approach zina." },
  { id: "backbiting", title: "Warning Against Backbiting and Suspicion", category: "speechCharacter", refs: ["49:11-12"], tags: ["Backbiting", "Suspicion", "Mockery"], shortLabel: "Quranic warnings against mockery, suspicion, spying, and backbiting." },
  { id: "arrogance", title: "Warning Against Arrogance", category: "speechCharacter", refs: ["17:37", "31:18", "7:146"], tags: ["Arrogance", "Pride"], shortLabel: "Quranic warnings against arrogance and turning away from signs." },
  { id: "lyingAboutAllah", title: "Warning Against Lying About Allah", severity: "major", category: "speechCharacter", refs: ["6:21", "7:33", "10:17"], tags: ["Lying", "Allah", "Knowledge"], shortLabel: "Quranic warnings against inventing lies about Allah." },
  { id: "speakNoKnowledge", title: "Warning Against Speaking Without Knowledge", category: "speechCharacter", refs: ["17:36", "7:33"], tags: ["Knowledge", "Speech"], shortLabel: "Quranic warning against following or saying what one has no knowledge of." },
  { id: "dayOfJudgement", title: "Warning About the Day of Judgement", category: "accountability", refs: ["99:6-8", "82:17-19", "75:1-15"], tags: ["Judgement", "Accountability"], shortLabel: "Quranic warnings that deeds will be shown and people will be accountable." },
  { id: "hellfire", title: "Warning About Hellfire", severity: "major", category: "accountability", refs: ["4:56", "67:6-11", "74:26-31"], tags: ["Hellfire", "Accountability"], shortLabel: "Quranic warnings about the Fire and accountability." },
  { id: "forgettingAllah", title: "Warning Against Forgetting Allah", category: "accountability", refs: ["59:19", "20:124-126"], tags: ["Forgetfulness", "Accountability"], shortLabel: "Quranic warnings against forgetting Allah and turning away from remembrance." },
];
