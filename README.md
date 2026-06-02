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
- **Recite** (tab) — tap the surah header to pick a chapter, read ayah by ayah,
  and play recitation (Mishary Alafasy) with a sticky player (play/pause, prev/
  next, repeat); the active ayah highlights with an equalizer and auto-advances.
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
| Recite data (short surahs, per-ayah audio URLs) | `src/design/reciteData.ts` |
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

## Live API integration

A typed, read-only client for the AskQuran public API
(`https://api.askquran.co/api/v1`) lives in `src/api/`:

| File | Role |
| --- | --- |
| `types.ts` | Response models for all 8 endpoints + `RateLimitInfo` |
| `errors.ts` | `AqError` (tagged `kind`) + `mapStatusToError` |
| `request.ts` | Injects `x-api-key`, parses the `{ error }` envelope, maps status → typed errors, **429 backoff** + 5xx-retry, captures `X-RateLimit-*`, coalesces concurrent GETs |
| `cache.ts` | `Storage` interface, `TtlCache` (persistent, for static lists), `Lru` (per-ayah) |
| `client.ts` | `createAqClient(deps)` — typed methods, verse-key validation, caching |
| `config.ts` | Reads key/base URL from env (no plaintext key in source) |
| `index.ts` | App singleton: `aq`, wired to `AsyncStorage` + platform `fetch` |

```ts
import { aq, AqError } from "@/api";

const { surahs, source } = await aq.getSurahs();          // cached on device
const tafsir = await aq.getTafsir("ibn_kathir_en", "1:1"); // tafsir.available may be false
try {
  const audio = await aq.getAudio("1:1");                  // audio.url is a direct MP3
} catch (e) {
  if (e instanceof AqError && e.kind === "notFound") {/* graceful empty state */}
}
```

Every response carries an attribution `source` — surface it where the content
is shown. Static lists (surahs, translations, tafsirs) are cached persistently;
per-ayah reads use an in-memory LRU; concurrent identical GETs are coalesced —
all to stay well under the 60 req/min limit. On HTTP 429 the client backs off
(exponential, ~1s, honouring `Retry-After`) and retries.

### Configuration & security

The API key is **never hard-coded**. Provide it via an Expo public env var:

```bash
EXPO_PUBLIC_API_KEY=aq_live_xxx npm start
```

…or copy `.env.example` → `.env` (gitignored). For a hardened setup, point
`EXPO_PUBLIC_API_BASE_URL` at a thin **server-side proxy** that holds the key,
so the binary ships with no key at all. The key is read-only, rate-limited, and
revocable, so the blast radius is low — but a key in a mobile binary can still be
extracted, so the proxy is the recommended follow-up.

### Tests

```bash
npm test   # compiles src/api and runs the unit suite (node:test)
```

Covers header injection, status→error mapping, the optional `translation` param,
the `available:false` tafsir case, 429 backoff + rate-limit capture, pre-flight
verse-key validation, and caching/memoisation.

### Acceptance check (run where the host is reachable)

```bash
BASE=https://api.askquran.co/api/v1
KEY=aq_live_xxx
for p in "/quran/surahs" "/translations" "/quran/surah/1?translation=en.sahih" \
         "/tafsirs/ibn_kathir_en/ayah/1:1" "/audio/default/ayah/1:1"; do
  echo "== $p =="; curl -s -H "x-api-key: $KEY" "$BASE$p" | head -c 200; echo
done
```

Each returns its `source` attribution. A missing/invalid key returns 401/403,
which the client surfaces as a config error (`AqError.isConfigError`) — it does
not crash. (Note: this build was verified by unit tests + a real-endpoint call;
the endpoint is not reachable from the CI sandbox's network allowlist, so the
above must be run on a dev machine, device, or CI with network egress.)
