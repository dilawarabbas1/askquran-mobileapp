// UI-language (interface i18n) engine for the mobile app — the RN counterpart
// of the web frontend i18n. Translates the app CHROME only; Quran, translation,
// and tafsir content stays verbatim from the API. Catalogs are keyed by English
// language name and live in ./locales/<EnglishName>.json. English is the complete
// base/template; missing keys (or whole languages) fall back to English.
//
// NOTE: Metro cannot glob, so every catalog is imported explicitly below. To add a
// language, drop ./locales/<Name>.json and add it to the imports + CATALOGS map.

import Albanian from "./locales/Albanian.json";
import Amazigh from "./locales/Amazigh.json";
import Amharic from "./locales/Amharic.json";
import Arabic from "./locales/Arabic.json";
import Azerbaijani from "./locales/Azerbaijani.json";
import Bengali from "./locales/Bengali.json";
import Bosnian from "./locales/Bosnian.json";
import Bulgarian from "./locales/Bulgarian.json";
import Chinese from "./locales/Chinese.json";
import Czech from "./locales/Czech.json";
import Divehi from "./locales/Divehi.json";
import Dutch from "./locales/Dutch.json";
import English from "./locales/English.json";
import French from "./locales/French.json";
import German from "./locales/German.json";
import Hausa from "./locales/Hausa.json";
import Hindi from "./locales/Hindi.json";
import Indonesian from "./locales/Indonesian.json";
import Italian from "./locales/Italian.json";
import Japanese from "./locales/Japanese.json";
import Korean from "./locales/Korean.json";
import Kurdish from "./locales/Kurdish.json";
import Malay from "./locales/Malay.json";
import Malayalam from "./locales/Malayalam.json";
import Norwegian from "./locales/Norwegian.json";
import Pashto from "./locales/Pashto.json";
import Persian from "./locales/Persian.json";
import Polish from "./locales/Polish.json";
import Portuguese from "./locales/Portuguese.json";
import Romanian from "./locales/Romanian.json";
import Russian from "./locales/Russian.json";
import Sindhi from "./locales/Sindhi.json";
import Somali from "./locales/Somali.json";
import Spanish from "./locales/Spanish.json";
import Swahili from "./locales/Swahili.json";
import Swedish from "./locales/Swedish.json";
import Tajik from "./locales/Tajik.json";
import Tamil from "./locales/Tamil.json";
import Tatar from "./locales/Tatar.json";
import Thai from "./locales/Thai.json";
import Turkish from "./locales/Turkish.json";
import Urdu from "./locales/Urdu.json";
import Uyghur from "./locales/Uyghur.json";
import Uzbek from "./locales/Uzbek.json";

export type Catalog = Record<string, string>;

const CATALOGS: Record<string, Catalog> = {
  Albanian: Albanian as Catalog,
  Amazigh: Amazigh as Catalog,
  Amharic: Amharic as Catalog,
  Arabic: Arabic as Catalog,
  Azerbaijani: Azerbaijani as Catalog,
  Bengali: Bengali as Catalog,
  Bosnian: Bosnian as Catalog,
  Bulgarian: Bulgarian as Catalog,
  Chinese: Chinese as Catalog,
  Czech: Czech as Catalog,
  Divehi: Divehi as Catalog,
  Dutch: Dutch as Catalog,
  English: English as Catalog,
  French: French as Catalog,
  German: German as Catalog,
  Hausa: Hausa as Catalog,
  Hindi: Hindi as Catalog,
  Indonesian: Indonesian as Catalog,
  Italian: Italian as Catalog,
  Japanese: Japanese as Catalog,
  Korean: Korean as Catalog,
  Kurdish: Kurdish as Catalog,
  Malay: Malay as Catalog,
  Malayalam: Malayalam as Catalog,
  Norwegian: Norwegian as Catalog,
  Pashto: Pashto as Catalog,
  Persian: Persian as Catalog,
  Polish: Polish as Catalog,
  Portuguese: Portuguese as Catalog,
  Romanian: Romanian as Catalog,
  Russian: Russian as Catalog,
  Sindhi: Sindhi as Catalog,
  Somali: Somali as Catalog,
  Spanish: Spanish as Catalog,
  Swahili: Swahili as Catalog,
  Swedish: Swedish as Catalog,
  Tajik: Tajik as Catalog,
  Tamil: Tamil as Catalog,
  Tatar: Tatar as Catalog,
  Thai: Thai as Catalog,
  Turkish: Turkish as Catalog,
  Urdu: Urdu as Catalog,
  Uyghur: Uyghur as Catalog,
  Uzbek: Uzbek as Catalog,
};

export const BASE_LANG = "English";
const BASE: Catalog = CATALOGS[BASE_LANG] ?? {};

/** Language names that ship a UI catalog file. */
export function uiLanguages(): string[] {
  return Object.keys(CATALOGS);
}

/** Does this language have its own catalog (vs. falling back to English)? */
export function hasCatalog(lang: string): boolean {
  return Boolean(CATALOGS[lang]);
}

function fill(tpl: string, vars?: Record<string, string | number>): string {
  if (!vars) return tpl;
  return tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Translate a key: language catalog → English base → the key itself. */
export function translate(lang: string, key: string, vars?: Record<string, string | number>): string {
  const cat = CATALOGS[lang];
  const tpl = (cat && cat[key]) ?? BASE[key] ?? key;
  return fill(tpl, vars);
}
