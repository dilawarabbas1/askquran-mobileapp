# UI locale catalogs

Drop the web frontend's UI-language catalogs here, **verbatim and with the same
filenames** as `askquran/frontend/src/i18n/locales/`:

```
src/i18n/locales/
  English.json   ← the complete base / template (all keys)
  Arabic.json
  Urdu.json
  Indonesian.json
  … one <EnglishLanguageName>.json per language (44 total)
```

Contract (must match the web so keys line up):

- **Keyed by English language name** (`English`, `Arabic`, `Urdu`, …) — the same
  names used by the `LANGUAGES` picker and the translation/tafsir editions.
- **Flat `{ "key": "value" }`** JSON. `English.json` is the source of truth and
  contains every key; other languages may be partial — missing keys fall back to
  English at runtime.
- Values may contain `{placeholder}` tokens, interpolated by `t(key, vars)`.

Once the files are here, the mobile i18n engine (`src/i18n/index.ts` +
`I18nProvider` / `useI18n` / `t()`) loads them, the **App language** picker drives
the interface, and RTL interface languages flip layout direction. These catalogs
translate the **interface only** — Quran text, translations, and tafsir always
come verbatim from the API.
