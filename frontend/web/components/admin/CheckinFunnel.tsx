'use client';

import { MetricCard } from './MetricCard';
import { CheckCircle2, XCircle, Play } from 'lucide-react';
import type { MetricState } from '@/hooks/useAnalytics';
import type { CheckinFunnelResult } from '@/lib/analytics';

interface CheckinFunnelProps {
  state: MetricState<CheckinFunnelResult>;
}

interface FunnelRowProps {
  icon: typeof Play;
  iconBg: string;
  label: string;
  value: number;
  percentage: number;
  barColor: string;
}

function FunnelRow({ icon: Icon, iconBg, label, value, percentage, barColor }: FunnelRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${iconBg}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-[#1a1a1a]">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-[#1a1a1a]">{value}</span>
          <span className="text-xs text-[#737373] ml-2">({percentage.toFixed(1)}%)</span>
        </div>
      </div>
      <div className="w-full bg-[#f3f3f3] rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function CheckinFunnel({ state }: CheckinFunnelProps) {
  const { data, loading, error } = state;

  return (
    <MetricCard
      title="Funnel del check-in diario"
      description="Iniciados vs completados vs abandonados"
      loading={loading}
      error={error}
    >
      {data && (
        <div className="space-y-5">
          <FunnelRow
            icon={Play}
            iconBg="bg-blue-600"
            label="Iniciados"
            value={data.started}
            percentage={100}
            barColor="bg-blue-600"
          />
          <FunnelRow
            icon={CheckCircle2}
            iconBg="bg-green-600"
            label="Completados"
            value={data.completed}
            percentage={data.completion_rate}
            barColor="bg-green-600"
          />
          <FunnelRow
            icon={XCircle}
            iconBg="bg-red-500"
            label="Abandonados"
            value={data.abandoned}
            percentage={data.abandonment_rate}
            barColor="bg-red-500"
          />

          {data.started === 0 && (
            <p className="text-sm text-[#a3a3a3] text-center pt-3">
              Sin check-ins iniciados en este rango.
            </p>
          )}
        </div>
      )}
    </MetricCard>
  );
}