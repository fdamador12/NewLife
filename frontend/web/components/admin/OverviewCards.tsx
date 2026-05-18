'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  AlertTriangle,
  CheckSquare,
  Activity,
  AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { MetricState } from '@/hooks/useAnalytics';
import type { OverviewMetrics } from '@/lib/analytics';

/**
 * Estructura interna IDENTICA en las 4 cards para alineacion perfecta:
 *
 *   ┌──────────────────────┐
 *   │ [icon] Titulo         │ ← header fijo
 *   │                       │
 *   │      VALOR GRANDE     │ ← centro: valor principal
 *   │       (subtitulo)     │
 *   │                       │
 *   │ ──────────────────── │ ← divider
 *   │ Detalle 1     valor   │ ← footer: filas (o spacer invisible)
 *   │ Detalle 2     valor   │
 *   └──────────────────────┘
 *
 * min-h fija + flex-1 en el centro garantiza altura uniforme.
 */

interface DetailRow {
  label: string;
  value: number | string;
}

interface KpiCardProps {
  icon: LucideIcon;
  iconBg: string;
  title: string;
  primaryValue: number | string;
  primaryLabel?: string;
  rows?: DetailRow[];
  loading?: boolean;
}

function KpiCard({ icon: Icon, iconBg, title, primaryValue, primaryLabel, rows, loading }: KpiCardProps) {
  return (
    <Card className="bg-white border-[#e5e5e5] shadow-sm h-full">
      <CardContent className="p-5 flex flex-col h-full min-h-[220px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${iconBg} flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm font-semibold text-[#1a1a1a] leading-tight">{title}</p>
        </div>

        {/* Centro: valor primary + label opcional */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {loading ? (
            <>
              <Skeleton className="h-12 w-20 mb-1" />
              {primaryLabel && <Skeleton className="h-3 w-16" />}
            </>
          ) : (
            <>
              <p className="text-5xl font-bold text-[#1a1a1a] tabular-nums leading-none">
                {primaryValue}
              </p>
              {primaryLabel && (
                <p className="text-xs text-[#737373] mt-1.5">{primaryLabel}</p>
              )}
            </>
          )}
        </div>

        {/* Footer: filas o spacer invisible para uniformidad */}
        <div className="mt-3 pt-3 border-t border-[#f3f3f3] space-y-1.5">
          {loading ? (
            <>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </>
          ) : rows && rows.length > 0 ? (
            rows.map((row) => (
              <div key={row.label} className="flex justify-between items-baseline">
                <span className="text-xs text-[#737373]">{row.label}</span>
                <span className="text-sm font-semibold text-[#1a1a1a] tabular-nums">{row.value}</span>
              </div>
            ))
          ) : (
            /* Spacer invisible: misma altura que dos filas reales */
            <>
              <div className="h-[18px]" />
              <div className="h-[18px]" />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface OverviewCardsProps {
  state: MetricState<OverviewMetrics>;
}

export function OverviewCards({ state }: OverviewCardsProps) {
  const { data, loading, error } = state;

  if (error) {
    return (
      <Card className="bg-white border-[#e5e5e5] shadow-sm">
        <CardContent className="p-4 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Error cargando KPIs: {error}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        icon={Users}
        iconBg="bg-blue-600"
        title="Usuarios activos"
        primaryValue={data?.active_users_today ?? 0}
        primaryLabel="hoy"
        rows={[
          { label: 'Esta semana', value: data?.active_users_week ?? 0 },
          { label: 'Este mes', value: data?.active_users_month ?? 0 },
        ]}
        loading={loading}
      />

      <KpiCard
        icon={CheckSquare}
        iconBg="bg-green-600"
        title="Check-ins hoy"
        primaryValue={data?.checkins_today ?? 0}
        primaryLabel="registros completados"
        loading={loading}
      />

      <KpiCard
        icon={AlertTriangle}
        iconBg="bg-red-600"
        title="SOS hoy"
        primaryValue={data?.sos_triggered_today ?? 0}
        primaryLabel="activaciones de crisis"
        loading={loading}
      />

      <KpiCard
        icon={Activity}
        iconBg="bg-[#d4854a]"
        title="Engagement total"
        primaryValue={data?.total_events ?? 0}
        primaryLabel="eventos registrados"
        rows={[
          { label: 'Usuarios totales', value: data?.total_users ?? 0 },
        ]}
        loading={loading}
      />
    </div>
  );
}