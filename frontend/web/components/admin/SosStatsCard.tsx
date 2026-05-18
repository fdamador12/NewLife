'use client';

import { MetricCard } from './MetricCard';
import { AlertTriangle, Users } from 'lucide-react';
import type { MetricState } from '@/hooks/useAnalytics';
import type { SosStatsResult } from '@/lib/analytics';

interface SosStatsCardProps {
  state: MetricState<SosStatsResult>;
}

const OPTION_LABELS: Record<string, string> = {
  emergency_contacts: 'Contactos de emergencia',
  crisis_mode: 'Modo crisis',
  breathing: 'Respiración guiada',
  motivational_phrases: 'Frases motivacionales',
  guided_meditation: 'Meditación guiada',
};

function labelFor(option: string): string {
  return OPTION_LABELS[option] ?? option;
}

export function SosStatsCard({ state }: SosStatsCardProps) {
  const { data, loading, error } = state;

  const maxCount = data?.options_breakdown[0]?.count ?? 1;

  return (
    <MetricCard
      title="Activaciones del SOS"
      description="Total y opciones más seleccionadas en crisis"
      loading={loading}
      error={error}
    >
      {data && (
        <div className="space-y-5">
          {/* KPIs principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-red-700 uppercase">Activaciones</span>
              </div>
              <p className="text-3xl font-bold text-red-900">{data.total_triggers}</p>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-700 uppercase">Usuarios únicos</span>
              </div>
              <p className="text-3xl font-bold text-orange-900">{data.unique_users}</p>
            </div>
          </div>

          {/* Breakdown de opciones */}
          {data.options_breakdown.length > 0 ? (
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a] mb-3">Opciones más usadas</p>
              <div className="space-y-2">
                {data.options_breakdown.map((opt) => (
                  <div key={opt.option} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#1a1a1a]">{labelFor(opt.option)}</span>
                      <span className="font-semibold text-[#1a1a1a]">{opt.count}</span>
                    </div>
                    <div className="w-full bg-[#f3f3f3] rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-[#d4854a]"
                        style={{ width: `${(opt.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#a3a3a3] text-center py-2">
              No se han seleccionado opciones del SOS en este rango.
            </p>
          )}
        </div>
      )}
    </MetricCard>
  );
}