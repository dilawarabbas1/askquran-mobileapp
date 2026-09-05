// Curated pool for the Daily Verse notification. Each entry is a single, complete,
// well-known ayah — short enough to read comfortably in a notification and whole
// in meaning (never a mid-passage fragment). We store REFERENCES only; the Arabic
// and translation are fetched verbatim from the backend in the user's chosen
// translation language at schedule time, so nothing here is generated or fixed to
// one language. The daily rotation walks this list in order.

export const DAILY_VERSE_REFS: string[] = [
  "2:152",  // remembrance
  "2:153",  // patience & prayer
  "2:186",  // nearness / answered supplication
  "2:286",  // no soul burdened beyond capacity
  "3:8",    // dua for steadfast hearts
  "3:139",  // do not lose heart
  "3:159",  // gentleness & reliance
  "3:173",  // Allah is sufficient for us
  "6:162",  // my prayer & devotion are for Allah
  "8:46",   // patience & unity
  "11:88",  // my success is only from Allah
  "13:28",  // hearts find rest in remembrance
  "14:7",   // gratitude increases
  "16:128", // Allah is with the righteous
  "20:114", // dua: increase me in knowledge
  "25:74",  // dua for family & offspring
  "29:69",  // those who strive are guided
  "39:53",  // do not despair of Allah's mercy
  "40:60",  // call upon Me, I will respond
  "42:43",  // patience & forgiveness
  "46:13",  // steadfastness — no fear, no grief
  "49:13",  // most honoured is the most righteous
  "55:13",  // which favours will you deny
  "64:11",  // Allah guides the heart of the believer
  "65:3",   // reliance — provision from the unexpected
  "93:5",   // your Lord will give until you are pleased
  "93:7",   // He found you lost and guided
  "94:5",   // with hardship comes ease
  "94:6",   // indeed, with hardship comes ease
  "2:255",  // Ayat al-Kursi (kept last — longest)
];
