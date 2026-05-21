import { useMemo, useCallback } from 'react';
import { useCacheQuery } from '../../../hooks/useCacheQuery';
import { CACHE_KEYS } from '../../../services/cacheKeys';
import {
  getFrasesPorFecha,
  guardarFraseMotivacional,
  desguardarFraseMotivacional,
} from '../services/motivationalService';

export interface Frase {
  _id?: string;
  frase_id: string;
  frase: string;
  dia: string;
  isFavorite?: boolean;
}

export const useMotivationalPhrases = () => {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Stable fetch function — only changes when the date changes (once per day).
  const fetchFn = useCallback(() => getFrasesPorFecha(today), [today]);

  const {
    data,
    loading,
    error,
    mutate,
  } = useCacheQuery<Frase[]>(CACHE_KEYS.MOTIVATIONAL_PHRASES, 30, fetchFn);

  const frases = data ?? [];

  // Called by screens on mount and on navigation focus to trigger revalidation.
  // withCache handles deduplication — no duplicate network calls.
  const fetchFrasesPorFecha = useCallback(
    (_fecha: string) => {
      getFrasesPorFecha(today).catch(() => {});
    },
    [today],
  );

  // Optimistic toggle: updates UI immediately, reverts on API error.
  const toggleFavorito = useCallback(
    async (fraseId: string) => {
      const isFavorite = frases.some((f) => f.frase_id === fraseId && f.isFavorite);

      // Optimistic update
      mutate(frases.map((f) =>
        f.frase_id === fraseId ? { ...f, isFavorite: !isFavorite } : f,
      ));

      try {
        if (isFavorite) {
          await desguardarFraseMotivacional(fraseId);
        } else {
          await guardarFraseMotivacional(fraseId);
        }
      } catch (err: any) {
        // Revert on failure
        mutate(frases);
        console.error('❌ Error toggleFavorito:', err);
      }
    },
    [frases, mutate],
  );

  return {
    frases,
    loading,
    error,
    fetchFrasesPorFecha,
    toggleFavorito,
  };
};
