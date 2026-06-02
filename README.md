# Ask Quran — Mobile App

A React Native + Expo implementation of the **AskQuran** mobile design
(Claude Design handoff, `mobile/AskQuran Mobile App.html`). Ask a question and
get **only referenced Quran source material** — Arabic ayah text, translation,
surah/ayah reference, surrounding context, and tafsir — nothing generated.

> **No-Generation Policy.** Every answer is referenced and unaltered. No
> AI-written religious text, no opinions — only the Quran, authentic
> translations, and attributed tafsir.

This app reproduces the design pixel-faithfully in native UI: the emerald /
gold / parchment system, the Plus Jakarta Sans + Newsreader + Amiri + Noto
Nastaliq Urdu type scale, the lens-over-book logo, and the khatam ornament.

## Flow & screens

- **Splash** — bismillah above the logo, then auto-advances.
- **Onboarding** — 3 steps: "Ask a question, get the source" · "Nothing is
  generated" · "Choose your language for Translation and Tafsir" (44-language
  picker, English first and selected by default).
- **Search** (tab) — top-left logo, shahada hero, search bar, suggested topics
  (Chips or Grid), recent searches.
- **Results** — pinned editable search bar, ranked ayah cards (Arabic,
  translation, expandable *Surrounding ayahs* and *Tafseer*, save/share,
  *Read in context*).
- **Reader** — single-ayah focus: Arabic, translation, *In context*, then
  *Tafsir* below it.
- **Facts** (tab) — segmented sub-tabs: **Structure** (metrics + hierarchy),
  **Surahs** (real 114-surah metadata, searchable + Meccan/Medinan filter),
  **Topics**, **Sajdah** (15 references), **Sources**.
- **Saved** (tab) — bookmarked ayahs with a tab badge, plus an empty state.
- **Settings** (tab) — language sheet, Arabic/tajweed toggles, theme
  (Light / Dark / Auto), daily-verse notification, topics layout, about.
- **Language sheet** — the same 44-language picker, reachable from the Search
  and Facts globe icons and from Settings.

Light & dark themes are both implemented and switch live from Settings →
Appearance.

## Architecture

| Piece | Where |
| --- | --- |
| Color tokens (light/dark) + `color-mix` shim + fonts | `src/design/tokens.ts` |
| Content data (ayahs, topics, 114 surahs, facts, 44 languages) | `src/design/data.ts` |
| App state + theme (navigation stack, query, saved, language) | `src/design/AQContext.tsx` |
| Icons (SVG, via `react-native-svg`) | `src/design/Icon.tsx` |
| Shared atoms (logo, divider, ayah card, switch, …) | `src/design/atoms.tsx` |
| Search input | `src/design/SearchBar.tsx` |
| App shell (app bar, tab bar, router, staging) | `src/design/AppShell.tsx` |
| Screens | `src/design/screens/` |

The content is the design's seed data (Tanzil Arabic + carried-over
translations/tafsir summaries); it is presented verbatim, never generated.

## Setup

```bash
npm install
npm start          # Expo dev server — open in Expo Go or a simulator
npm run android    # Android
npm run ios        # iOS (macOS + Xcode)
```

Runs on **Android and iOS** from the one codebase.

## Type-check

```bash
npm run lint   # tsc --noEmit
```
