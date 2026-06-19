// QPC V2 page-font manager. There are 604 page fonts (~150-350 KB each, ~150 MB
// total) so they CANNOT be bundled — they are downloaded on demand, cached on the
// device permanently (the fonts never change), and registered with expo-font under
// the family name `qpc-p{N}`. Once a page is registered, ayahs on that page render
// in their authentic Madinah-mushaf glyphs.
//
// Lessons baked in from the web build:
//   - load lazily, just ahead of scroll — never bulk-load a whole surah's pages
//   - registration is idempotent + inflight-deduped so concurrent ayahs share one job
//   - cache is permanent (cacheDirectory) → offline after first load

import * as FileSystem from "expo-file-system";
import * as Font from "expo-font";

// Page-font host. Defaults to qurancdn for dev; set EXPO_PUBLIC_QPC_FONT_BASE to
// our own mirror for production (the 604 TTFs are static — mirror them to a host we
// control so a core feature doesn't depend on a third party). Web uses woff2; React
// Native needs TTF (it cannot load woff2), so the mirror must host the TTF set.
const FONT_BASE = (process.env.EXPO_PUBLIC_QPC_FONT_BASE || "https://static.qurancdn.com/fonts/quran/hafs/v2/ttf").replace(/\/+$/, "");

const CACHE_DIR = `${FileSystem.cacheDirectory}qpc/`;

/** Pages whose font is registered with expo-font in THIS session. */
const ready = new Set<number>();
/** In-flight registration jobs, keyed by page, so concurrent callers share one. */
const inflight = new Map<number, Promise<boolean>>();
/** Pages whose download/registration failed — surfaced so callers fall back. */
const failed = new Set<number>();

let cacheDirEnsured = false;
async function ensureCacheDir(): Promise<void> {
  if (cacheDirEnsured) return;
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  cacheDirEnsured = true;
}

/** True once the page font is registered and ayahs on it can render in QPC. */
export function isPageReady(n: number): boolean {
  return ready.has(n);
}

/** True if this page's font could not be fetched — caller should use the fallback. */
export function isPageFailed(n: number): boolean {
  return failed.has(n);
}

/**
 * Ensure page `n`'s font is downloaded, cached, and registered as `qpc-p{n}`.
 * Idempotent and inflight-deduped. Resolves true on success, false on failure
 * (network down on a cold page) — never throws. Safe to call from render effects.
 */
export function ensureQpcPage(n: number): Promise<boolean> {
  if (ready.has(n)) return Promise.resolve(true);
  const existing = inflight.get(n);
  if (existing) return existing;

  const job = (async () => {
    try {
      await ensureCacheDir();
      const uri = `${CACHE_DIR}p${n}.ttf`;
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) {
        const res = await FileSystem.downloadAsync(`${FONT_BASE}/p${n}.ttf`, uri);
        if (res.status !== 200) throw new Error(`download p${n} -> ${res.status}`);
      }
      await Font.loadAsync({ [`qpc-p${n}`]: uri });
      ready.add(n);
      failed.delete(n);
      return true;
    } catch {
      // Cold-page network failure (or a corrupt partial) — mark failed so the
      // caller renders the Unicode fallback; clear it so a later attempt retries.
      failed.add(n);
      return false;
    } finally {
      inflight.delete(n);
    }
  })();

  inflight.set(n, job);
  return job;
}

/** The expo-font family name for a page (whether or not it is loaded yet). */
export function qpcFamily(n: number): string {
  return `qpc-p${n}`;
}

/** Warm a set of pages ahead of the viewport. Fire-and-forget; errors are swallowed. */
export function preloadPages(pages: number[]): void {
  for (const p of pages) void ensureQpcPage(p);
}
