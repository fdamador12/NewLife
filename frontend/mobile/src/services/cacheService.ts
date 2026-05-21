import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'nl_cache_';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

type Listener<T> = (data: T) => void;

// ─── Module-level stores (singleton) ─────────────────────────────────────────

const memory   = new Map<string, CacheEntry<unknown>>();
const listeners = new Map<string, Set<Listener<unknown>>>();
const inFlight  = new Map<string, Promise<unknown>>();

// ─── Private helpers ──────────────────────────────────────────────────────────

function isStale(entry: CacheEntry<unknown>): boolean {
  return Date.now() > entry.expiresAt;
}

function broadcast<T>(key: string, data: T): void {
  (listeners.get(key) as Set<Listener<T>> | undefined)?.forEach((cb) => cb(data));
}

async function fromDisk<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

async function toDisk<T>(key: string, data: T, ttlMinutes: number): Promise<void> {
  const entry: CacheEntry<T> = {
    data,
    expiresAt: Date.now() + ttlMinutes * 60_000,
  };
  memory.set(key, entry as CacheEntry<unknown>);
  try {
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Disk write failure is non-fatal — memory cache remains valid.
  }
}

// Deduplicated fetch: a single in-flight promise per key.
// Stores result, notifies all subscribers on success.
function fetchAndStore<T>(
  key: string,
  ttlMinutes: number,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;

  const promise: Promise<T> = (async () => {
    try {
      const fresh = await fetchFn();
      await toDisk(key, fresh, ttlMinutes);
      broadcast(key, fresh);
      return fresh;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise as Promise<unknown>);
  return promise;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const cacheService = {
  /**
   * Synchronous read from the in-memory store.
   * Returns null if the key has not been loaded into memory yet.
   * Use warmUp() at startup to make this instant for critical keys.
   */
  getSync<T>(key: string): T | null {
    return (memory.get(key) as CacheEntry<T> | undefined)?.data ?? null;
  },

  /**
   * Async read: memory first, then disk (populates memory on disk hit).
   * Returns null if not found anywhere.
   */
  async get<T>(key: string): Promise<T | null> {
    const mem = memory.get(key) as CacheEntry<T> | undefined;
    if (mem) return mem.data;

    const disk = await fromDisk<T>(key);
    if (disk) {
      memory.set(key, disk as CacheEntry<unknown>);
      return disk.data;
    }
    return null;
  },

  /** Write to memory + disk, then notify all subscribers for this key. */
  async set<T>(key: string, data: T, ttlMinutes: number): Promise<void> {
    await toDisk(key, data, ttlMinutes);
    broadcast(key, data);
  },

  async clear(key: string): Promise<void> {
    memory.delete(key);
    inFlight.delete(key);
    await AsyncStorage.removeItem(key);
  },

  async clearAll(): Promise<void> {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((k) => k.startsWith(PREFIX));
    cacheKeys.forEach((k) => {
      memory.delete(k);
      inFlight.delete(k);
    });
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  },

  async isExpired(key: string): Promise<boolean> {
    const mem = memory.get(key);
    if (mem) return isStale(mem);
    const disk = await fromDisk(key);
    if (!disk) return true;
    memory.set(key, disk);
    return isStale(disk);
  },

  /**
   * Subscribe to cache updates for a key.
   * The listener fires whenever new data is written (set, refresh, or revalidation).
   * Returns an unsubscribe function — call it in useEffect cleanup.
   */
  subscribe<T>(key: string, listener: Listener<T>): () => void {
    if (!listeners.has(key)) listeners.set(key, new Set());
    (listeners.get(key) as Set<Listener<T>>).add(listener);
    return () =>
      (listeners.get(key) as Set<Listener<T>> | undefined)?.delete(listener);
  },

  /**
   * Pre-load keys from AsyncStorage into the in-memory store.
   * Call this at app startup (e.g. in App.tsx) for keys that must be
   * instantly available via getSync() on the first render.
   */
  async warmUp(keys: readonly string[]): Promise<void> {
    await Promise.all(
      keys.map(async (key) => {
        if (memory.has(key)) return;
        const entry = await fromDisk(key);
        if (entry) memory.set(key, entry);
      }),
    );
  },

  /**
   * Stale-while-revalidate:
   * - Memory hit → return immediately + background revalidation
   * - Disk hit   → return immediately + background revalidation
   * - No cache   → await fetch → store → return
   * - Fetch fails + any stale data → return stale (never throws when stale)
   *
   * Concurrent calls for the same key share one in-flight fetch (deduplication).
   * All active subscribers are notified when fresh data arrives.
   */
  async withCache<T>(
    key: string,
    ttlMinutes: number,
    fetchFn: () => Promise<T>,
  ): Promise<T> {
    // 1. Memory hit (synchronous, ~0 ms)
    const mem = memory.get(key) as CacheEntry<T> | undefined;
    if (mem) {
      fetchAndStore(key, ttlMinutes, fetchFn).catch(() => {});
      return mem.data;
    }

    // 2. Disk hit (one AsyncStorage read, ~5 ms)
    const disk = await fromDisk<T>(key);
    if (disk) {
      memory.set(key, disk as CacheEntry<unknown>);
      fetchAndStore(key, ttlMinutes, fetchFn).catch(() => {});
      return disk.data;
    }

    // 3. No cache at all: fetch and wait
    try {
      return await fetchAndStore(key, ttlMinutes, fetchFn);
    } catch (error) {
      // Last resort: another concurrent call may have just written the disk.
      const fallback = await fromDisk<T>(key);
      if (fallback) {
        memory.set(key, fallback as CacheEntry<unknown>);
        return fallback.data;
      }
      throw error;
    }
  },
};
