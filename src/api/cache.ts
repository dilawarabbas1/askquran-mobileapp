// Caching primitives: a minimal async key/value Storage interface (satisfied by
// AsyncStorage in the app and by an in-memory map in tests), a TTL wrapper for
// the static lists, and a small in-memory LRU for per-ayah results.

export interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** In-memory Storage — used by tests and as a fallback when none is provided. */
export function createMemoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    getItem: async (k) => (m.has(k) ? (m.get(k) as string) : null),
    setItem: async (k, v) => void m.set(k, v),
    removeItem: async (k) => void m.delete(k),
  };
}

interface Stamped<T> {
  ts: number;
  data: T;
}

/**
 * Read-through TTL cache for the static lists (surahs, translations, tafsirs).
 * Keeps a hot in-memory copy and a persisted copy so the lists survive restarts
 * and we stay well under the rate limit. `fetcher` runs only on miss/expiry.
 */
export class TtlCache {
  private memo = new Map<string, Stamped<unknown>>();
  constructor(private storage: Storage, private now: () => number = Date.now) {}

  async get<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
    const fresh = (s: Stamped<unknown> | undefined): s is Stamped<T> =>
      !!s && this.now() - s.ts < ttlMs;

    const hot = this.memo.get(key);
    if (fresh(hot)) return hot.data;

    const raw = await this.storage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Stamped<T>;
        if (fresh(parsed)) {
          this.memo.set(key, parsed);
          return parsed.data;
        }
      } catch {
        /* corrupt entry — ignore and refetch */
      }
    }

    const data = await fetcher();
    const stamped: Stamped<T> = { ts: this.now(), data };
    this.memo.set(key, stamped);
    await this.storage.setItem(key, JSON.stringify(stamped)).catch(() => {});
    return data;
  }

  async clear(keys: string[]): Promise<void> {
    for (const k of keys) {
      this.memo.delete(k);
      await this.storage.removeItem(k).catch(() => {});
    }
  }
}

/** Tiny insertion-ordered LRU for per-ayah results (Arabic, translation, tafsir, audio). */
export class Lru<V> {
  private map = new Map<string, V>();
  constructor(private max = 200) {}

  get(key: string): V | undefined {
    const v = this.map.get(key);
    if (v !== undefined) {
      this.map.delete(key); // refresh recency
      this.map.set(key, v);
    }
    return v;
  }

  set(key: string, value: V): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.max) {
      const oldest = this.map.keys().next().value as string | undefined;
      if (oldest !== undefined) this.map.delete(oldest);
    }
  }

  /** Memoise an async fetch by key. */
  async remember(key: string, fetcher: () => Promise<V>): Promise<V> {
    const hit = this.get(key);
    if (hit !== undefined) return hit;
    const v = await fetcher();
    this.set(key, v);
    return v;
  }

  clear(): void {
    this.map.clear();
  }
}
