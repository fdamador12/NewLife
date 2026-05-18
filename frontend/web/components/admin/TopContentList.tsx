'use client';

import { MetricCard } from './MetricCard';
import { Badge } from '@/components/ui/badge';
import { FileText, Video, Eye, Users } from 'lucide-react';
import type { MetricState } from '@/hooks/useAnalytics';
import type { TopContentResult } from '@/lib/analytics';

interface TopContentListProps {
  state: MetricState<TopContentResult>;
}

export function TopContentList({ state }: TopContentListProps) {
  const { data, loading, error } = state;

  return (
    <MetricCard
      title="Top contenidos vistos"
      description={`Los más reproducidos. Total: ${data?.total_views ?? 0} reproducciones`}
      loading={loading}
      error={error}
    >
      {data && (
        <>
          {data.items.length === 0 ? (
            <p className="text-sm text-[#a3a3a3] text-center py-6">
              No hay contenido reproducido en este rango.
            </p>
          ) : (
            <ol className="space-y-3">
              {data.items.map((item, idx) => (
                <li
                  key={item.content_id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f6f3] hover:bg-[#f0ede8] transition-colors"
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#d4854a] text-white text-sm font-bold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={
                          item.type === 'VIDEO'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }
                      >
                        {item.type === 'VIDEO' ? (
                          <Video className="w-3 h-3 mr-1" />
                        ) : (
                          <FileText className="w-3 h-3 mr-1" />
                        )}
                        {item.type ?? 'desconocido'}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#1a1a1a] font-medium line-clamp-2">
                      {item.title ?? <span className="italic text-[#a3a3a3]">(contenido eliminado)</span>}
                    </p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-[#737373]">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.views} {item.views === 1 ? 'vista' : 'vistas'}
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