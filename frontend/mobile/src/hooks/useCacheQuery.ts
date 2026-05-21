import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheService } from '../services/cacheService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseCacheQueryOptions {
  /** Set to false to skip fetching (e.g. while guest mode is undetermined). */
  enabled?: boolean;
}

export interface UseCacheQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /**
   * Optimistic update: overwrites local state without touching the cache.
   * Useful for instant UI feedback on mutations before the server confirms.
   */
  mutate: (updater: T | ((prev: T | null) => T | null)) => void;
  /**
   * Force invalidate: clears the cache for this key and re-fetches.
   * Use for pull-to-refresh or post-mutation revalidation.
   */
  invalidate: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Stale-while-revalidate cache query hook.
 *
 * - Returns cached data synchronously on the first render (from in-memory store).
 * - Triggers SWR revalidation via cacheService.withCache on mount.
 * - Subscribes to background updates: UI refreshes automatically when new
 *   data arrives (from any component using the same key).
 * - Concurrent calls for the same key share one in-flight fetch (deduplication).
 * - fetchFn must be a stable reference (module-level function or useCallback).
 */
export function useCacheQuery<T>(
  key: string,
  ttlMinutes: number,
  fetchFn: () => Promise<T>,
  { enabled = true }: UseCacheQueryOptions = {},
): UseCacheQueryResult<T> {
  const [data, setData] = useState<T | null>(
    () => (enabled ? cacheService.getSync<T>(key) : null),
  );
  const [loading, setLoading] = useState<boolean>(
    () => enabled && cacheService.getSync<T>(key) === null,
  );
  const [error, setError] = useState<string | null>(null);

  // Keep fetchFn ref up-to-date without adding it to effect deps
  // (prevents infinite loops when callers pass inline functions).
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    // Synchronous memory hit: covers the false→true transition of enabled
    // (useState lazy initializer already ran with enabled=false, so we
    // re-check here to avoid waiting for the async fetchFn round-trip).
    const synced = cacheService.getSync<T>(key);
    if (synced !== null) {
      setData(synced);
      setLoading(false);
    }

    // Subscribe to cache updates — fires whenever the service's withCache
    // broadcasts fresh data for this key (background revalidation, mutations).
    const unsub = cacheService.subscribe<T>(key, (fresh) => {
      if (!cancelled) {
        setData(fresh);
        setLoading(false);
        setError(null);
      }
    });

    // Call fetchFn directly. The service function already calls
    // cacheService.withCache internally, which handles SWR, deduplication,
    // disk persistence, and broadcasting. Wrapping in a second withCache here
    // would create a circular in-flight promise → deadlock on first load.
    fetchFnRef.current()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError((err as Error)?.message ?? 'Error al cargar datos');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [key, enabled]); // ttlMinutes excluded — service controls its own TTL

  const mutate = useCallback(
    (updater: T | ((prev: T | null) => T | null)) => {
      setData((prev) =>
        typeof updater === 'function'
          ? (updater as (p: T | null) => T | null)(prev)
          : updater,
      );
    },
    [],
  );

  const invalidate = useCallback(async () => {
    await cacheService.clear(key);
    setLoading(true);
    setError(null);
    try {
      const fresh = await fetchFnRef.current();
      setData(fresh);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Error al recargar datos');
    } finally {
      setLoading(false);
    }
  }, [key]);

  return { data, loading, error, mutate, invalidate };
}
