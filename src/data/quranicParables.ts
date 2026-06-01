import type { RefItem } from "@/components/RefItemsScreen";

/* AskQuran — Quranic Parables. Only Quran-backed parables/examples with
   explicit ayah references. `shortLabel` is a short neutral source-backed line;
   no interpretation. Arabic/translation/tafsir are loaded verbatim from source,
   never stored or generated here. mainRefs marks the central parable ayah(s). */

export const PARABLE_CATEGORIES: { id: string; title: string }[] = [
  { id: "guidanceLight", title: "Guidance and Light" },
  { id: "faithFalsehood", title: "Faith and Falsehood" },
  { id: "charitySincerity", title: "Charity and Sincerity" },
  { id: "knowledgeResp", title: "Knowledge and Responsibility" },
  { id: "worldlyLife", title: "Worldly Life" },
  { id: "humanBehavior", title: "Human Behavior" },
  { id: "resurrection", title: "Resurrection and Accountability" },
];

export const PARABLES: RefItem[] = [
  { id: "light", title: "Parable of Light", category: "guidanceLight", refs: ["24:35"], mainRefs: ["24:35"], tags: ["Light", "Guidance", "Faith", "Parable"], shortLabel: "A Quranic parable about Allah's light and guidance." },
  { id: "goodBadWord", title: "Good Word and Bad Word", category: "faithFalsehood", refs: ["14:24-26"], mainRefs: ["14:24-26"], tags: ["Speech", "Truth", "Faith", "Falsehood"], shortLabel: "A Quranic parable comparing a good word to a good tree and a bad word to a bad tree." },
  { id: "charityGrain", title: "Charity Like Grain", category: "charitySincerity", refs: ["2:261"], mainRefs: ["2:261"], tags: ["Charity", "Spending", "Reward", "Sadaqah"], shortLabel: "A Quranic parable about spending in Allah's way and multiplied reward." },
  { id: "charityRuined", title: "Charity Ruined by Reminders and Showing Off", category: "charitySincerity", refs: ["2:264"], mainRefs: ["2:264"], tags: ["Charity", "Sincerity", "Showing Off", "Harm"], shortLabel: "A Quranic parable about charity invalidated by reminders, injury, and showing off." },
  { id: "gardenHigh", title: "Garden on High Ground", category: "charitySincerity", refs: ["2:265"], mainRefs: ["2:265"], tags: ["Charity", "Sincerity", "Seeking Allah's Pleasure"], shortLabel: "A Quranic parable about spending sincerely seeking Allah's pleasure." },
  { id: "burnedGarden", title: "Burned Garden", category: "charitySincerity", refs: ["2:266"], mainRefs: ["2:266"], tags: ["Charity", "Loss", "Need", "Reflection"], shortLabel: "A Quranic parable asking people to reflect on loss after need." },
  { id: "spiderHouse", title: "Spider's House", category: "faithFalsehood", refs: ["29:41"], mainRefs: ["29:41"], tags: ["False Protection", "Reliance", "Shirk"], shortLabel: "A Quranic parable comparing protectors besides Allah to the spider's house." },
  { id: "donkeyBooks", title: "Donkey Carrying Books", category: "knowledgeResp", refs: ["62:5"], mainRefs: ["62:5"], tags: ["Scripture", "Knowledge", "Responsibility", "Action"], shortLabel: "A Quranic parable about being entrusted with scripture without carrying its responsibility." },
  { id: "dogExample", title: "Dog Example", category: "humanBehavior", refs: ["7:175-176"], mainRefs: ["7:175-176"], tags: ["Desire", "Rejection", "Signs", "Guidance"], shortLabel: "A Quranic parable about one who was given signs but turned away and followed desire." },
  { id: "rainPlants", title: "Worldly Life Like Rain and Plants", category: "worldlyLife", refs: ["10:24"], mainRefs: ["10:24"], tags: ["Worldly Life", "Rain", "Plants", "Passing World"], shortLabel: "A Quranic parable comparing worldly life to rain and vegetation that later disappears." },
  { id: "rainDebris", title: "Worldly Life: Rain, Growth, Then Debris", category: "worldlyLife", refs: ["18:45"], mainRefs: ["18:45"], tags: ["Worldly Life", "Temporary Life", "Plants"], shortLabel: "A Quranic parable about the temporary nature of worldly life." },
  { id: "lifeRain", title: "Worldly Life and Rain", category: "worldlyLife", refs: ["57:20"], mainRefs: ["57:20"], tags: ["Worldly Life", "Play", "Boasting", "Temporary Life"], shortLabel: "A Quranic parable describing worldly life as play, adornment, boasting, and vegetation that dries." },
  { id: "twoGardens", title: "Two Men and Two Gardens", category: "worldlyLife", refs: ["18:32-44"], mainRefs: ["18:32-44"], tags: ["Wealth", "Gratitude", "Arrogance", "Worldly Life"], shortLabel: "A Quranic parable about two men, gardens, wealth, arrogance, and return to Allah." },
  { id: "servantProvision", title: "The Servant Owned by Another and the One Given Good Provision", category: "faithFalsehood", refs: ["16:75"], mainRefs: ["16:75"], tags: ["Tawhid", "Provision", "Comparison"], shortLabel: "A Quranic parable contrasting one without power and one given good provision." },
  { id: "twoMenJustice", title: "Two Men: One Unable and One Commanding Justice", category: "faithFalsehood", refs: ["16:76"], mainRefs: ["16:76"], tags: ["Tawhid", "Justice", "Comparison"], shortLabel: "A Quranic parable contrasting inability with one who commands justice." },
  { id: "slaveManyMasters", title: "Slave with Many Masters", category: "faithFalsehood", refs: ["39:29"], mainRefs: ["39:29"], tags: ["Tawhid", "Worship", "Comparison"], shortLabel: "A Quranic parable comparing a man with disputing masters to a man devoted to one master." },
  { id: "flyParable", title: "Fly Parable", category: "faithFalsehood", refs: ["22:73"], mainRefs: ["22:73"], tags: ["False Gods", "Weakness", "Worship"], shortLabel: "A Quranic parable about the weakness of those invoked besides Allah." },
  { id: "ashesWind", title: "Ashes Blown by Wind", category: "faithFalsehood", refs: ["14:18"], mainRefs: ["14:18"], tags: ["Deeds", "Disbelief", "Loss"], shortLabel: "A Quranic parable comparing deeds of those who disbelieve to ashes blown by strong wind." },
  { id: "mirageDarkness", title: "Mirage and Deep Darkness", category: "faithFalsehood", refs: ["24:39-40"], mainRefs: ["24:39-40"], tags: ["Disbelief", "Deeds", "Darkness", "False Hope"], shortLabel: "Quranic parables about deeds like a mirage and layers of darkness." },
  { id: "fireKindled", title: "Fire Kindled Then Light Removed", category: "faithFalsehood", refs: ["2:17-18"], mainRefs: ["2:17-18"], tags: ["Hypocrisy", "Light", "Darkness"], shortLabel: "A Quranic parable about light being removed and people left in darkness." },
  { id: "rainstorm", title: "Rainstorm, Darkness, Thunder, and Lightning", category: "faithFalsehood", refs: ["2:19-20"], mainRefs: ["2:19-20"], tags: ["Hypocrisy", "Fear", "Uncertainty", "Guidance"], shortLabel: "A Quranic parable using rainstorm, darkness, thunder, and lightning." },
  { id: "mosquito", title: "Mosquito Parable", category: "faithFalsehood", refs: ["2:26"], mainRefs: ["2:26"], tags: ["Parables", "Guidance", "Misguidance"], shortLabel: "A Quranic statement that Allah is not ashamed to present a parable, even of a mosquito or what is above it." },
  { id: "goodBadLand", title: "Good Land and Bad Land", category: "humanBehavior", refs: ["7:58"], mainRefs: ["7:58"], tags: ["Gratitude", "Receptivity", "Signs"], shortLabel: "A Quranic parable comparing good land that produces vegetation and bad land that barely produces." },
  { id: "gnatWeakness", title: "Gnat / Weakness of False Objects of Worship", category: "faithFalsehood", refs: ["22:73-74"], mainRefs: ["22:73"], tags: ["False Worship", "Weakness", "Allah's Power"], shortLabel: "A Quranic parable showing the weakness of what is invoked besides Allah." },
];
