'use client';

import { MetricCard } from './MetricCard';
import { Heart, Users } from 'lucide-react';
import type { MetricState } from '@/hooks/useAnalytics';
import type { TopPhrasesResult } from '@/lib/analytics';

interface TopPhrasesListProps {
  state: MetricState<TopPhrasesResult>;
}

export function TopPhrasesList({ state }: TopPhrasesListProps) {
  const { data, loading, error } = state;

  return (
    <MetricCard
      title="Top frases favoriteadas"
      description={`Las que más resuenan. Total: ${data?.total_favorites ?? 0} favoritos`}
      loading={loading}
      error={error}
    >
      {data && (
        <>
          {data.items.length === 0 ? (
            <p className="text-sm text-[#a3a3a3] text-center py-6">
              No hay frases favoriteadas en este rango.
            </p>
          ) : (
            <ol className="space-y-3">
              {data.items.map((item, idx) => (
                <li
                  key={item.phrase_id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f6f3] hover:bg-[#f0ede8] transition-colors"
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-pink-500 text-white text-sm font-bold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1a1a1a] italic line-clamp-3">
                      {item.text ? (
                        `"${item.text}"`
                      ) : (
                        <span className="not-italic text-[#a3a3a3]">(frase eliminada)</span>
                      )}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#737373]">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
                        {item.favorites} {item.favorites === 1 ? 'favorito' : 'favoritos'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {item.unique_users} {item.unique_users === 1 ? 'usuario' : 'usuarios'}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </MetricCard>
  );
}