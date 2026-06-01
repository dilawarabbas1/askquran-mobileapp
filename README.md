# Ask Quran — Mobile App

A React Native + Expo client for **Ask Quran**, the source-grounded Quran
search portal. Ask a natural-language question and receive **only relevant
Quran source material** — Arabic ayah text, translation, surah/ayah reference,
transliteration, recitation audio, and tafsir where available.

> **No-Generation Policy.** This app never writes religious explanations. There
> is no language model in the request path. Every result is assembled
> deterministically by the backend and rendered **verbatim** here. If nothing
> matches, the app shows the fixed *"No matching Quran reference found"*
> response. The mobile app is a thin client — it never generates, paraphrases,
> or summarizes text.

It mirrors the web frontend's full feature set: search with Language →
Translation → Tafsir selectors, filters, rich result cards (context passages,
audio, on-demand tafsir, source badges), 44-language UI, RTL, light/dark theme,
and the content pages (Quran Facts, Quranic Duas, Prophet Stories, Parables,
Commands & Prohibitions, Warnings, Ethical Character Map).

## Architecture

| Layer | Where |
| --- | --- |
| Config (API base URL + key) | `src/config.ts` (from `app.json` → `extra`) |
| API client | `src/api/client.ts` |
| Types | `src/types.ts` (mirrors the backend response shapes) |
| Theme (light/dark) | `src/theme/` |
| i18n (44 catalogs) | `src/i18n/` |
| Shared state | `src/context/` (settings, search bus) |
| Components | `src/components/` |
| Screens | `src/screens/` |
| Reference data | `src/data/` (Quran-backed references only — no ayah text) |

### Backend API usage

Reads go through the **key-gated external API** (`/api/v1/*`, authenticated with
`x-api-key`): translations, tafsir editions, surah verses, single ayahs, and
audio. Search has no v1 equivalent, so it uses the public `POST /api/ask`, which
returns the full rich response (context, transliteration, audio, tafsir,
sources, match reasons).

When **no API key** is configured, the client gracefully falls back to the
public `/api/*` endpoints so the app still runs out of the box.

## Setup

```bash
npm install
npm start          # Expo dev server — open in Expo Go or a simulator
npm run android    # or
npm run ios
```

### Configuration

Set the backend URL and (optionally) an API key in `app.json` → `expo.extra`,
or via env at start:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:4000 \
EXPO_PUBLIC_API_KEY=your_api_key \
npm start
```

> On a **physical device**, `localhost` will not reach your dev machine — use
> your machine's LAN IP (e.g. `http://192.168.1.10:4000`). Make sure the Ask
> Quran backend is running and (for `/api/v1/*`) you have a valid API key with
> the `quran:read`, `translations:read`, and `tafsir:read` scopes.

## Type-check

```bash
npm run lint   # tsc --noEmit
```

## Features

- **Search** — question + Language/Translation/Tafsir selectors, filters
  (revelation place, surah, juz, has-tafsir), result cards with Arabic,
  transliteration, recitation audio, translation (with term highlighting),
  surrounding context passages, on-demand tafsir, and verbatim source badges.
- **Quran Facts** — structure metrics, surah list, guided topics, Quran
  mentions (prophets/nations/angels/scriptures/places), divine-punishment
  themes, plants, and source integrity. Tapping any ayah reference runs it as a
  search.
- **Quranic Duas** — supplications present directly in the Quran, each anchored
  to verbatim ayah references with optional tafsir.
- **Prophet Stories**, **Quranic Parables**, **Commands & Prohibitions**,
  **Quranic Warnings**, **Ethical Character Map** — Quran-backed reference pages.
- **44-language UI** with RTL support, **light/dark theme**, persisted settings.
