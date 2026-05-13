import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'nl_cache_';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

async function getEntry<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    const entry = await getEntry<T>(key);
    return entry ? entry.data : null;
  },

  async set<T>(key: string, data: T, ttlMinutes: number): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  },

  async clear(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clearAll(): Promise<void> {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  },

  async isExpired(key: string): Promise<boolean> {
    const entry = await getEntry(key);
    if (!entry) return true;
    return Date.now() > entry.expiresAt;
  },

  // Stale-while-revalidate:
  // - Valid cache → return immediately + revalidate in background + call onUpdate(fresh)
  // - No cache → await fetch → save → return
  // - Fetch fails + expired/stale cache → return stale cache
  // - Fetch fails + no cache → rethrow
  async withCache<T>(
    key: string,
    ttlMinutes: number,
    fetchFn: () => Promise<T>,
    onUpdate?: (data: T) => void,
  ): Promise<T> {
    const entry = await getEntry<T>(key);
    const isValid = entry !== null && Date.now() <= entry.expiresAt;

    if (isValid) {
      fetchFn()
        .then(async (fresh) => {
          await cacheService.set(key, fresh, ttlMinutes);
          onUpdate?.(fresh);
        })
        .catch(() => {});
      return entry!.data;
    }

    try {
      const fresh = await fetchFn();
      await cacheService.set(key, fresh, ttlMinutes);
      return fresh;
    } catch (error) {
      if (entry !== null) {
        return entry.data;
      }
      throw error;
    }
  },
};
