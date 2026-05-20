'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MetricCard } from './MetricCard';
import { Trophy, TrendingUp } from 'lucide-react';
import type { MetricState } from '@/hooks/useAnalytics';
import type { LevelDistributionResult } from '@/lib/analytics';

interface LevelDistributionChartProps {
  state: MetricState<LevelDistributionResult>;
}

const LEVEL_NAMES: Record<number, string> = {
  1: 'Reconocer',
  2: 'Confiar',
  3: 'Entregar',
  4: 'Explorar',
  5: 'Compartir',
  6: 'Prepararme',
  7: 'Pedir cambio',
  8: 'Reparar',
  9: 'Actuar',
  10: 'Reflexionar',
  11: 'Conectar',
  12: 'Compartir',
};

/**
 * Renderiza la leyenda manualmente arriba del grafico para no chocar
 * con las etiquetas rotadas del eje X.
 */
function CustomLegend() {
  return (
    <div className="flex items-center justify-center gap-6 mb-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm bg-[#d4854a]" />
        <span className="text-[#1a1a1a] font-medium">Alcanzaron</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm bg-[#3b82f6]" />
        <span className="text-[#1a1a1a] font-medium">Completaron</span>
      </div>
    </div>
  );
}

export function LevelDistributionChart({ state }: LevelDistributionChartProps) {
  const { data, loading, error } = state;

  // Transformar `by_level` al formato que espera Recharts
  const chartData = data?.by_level.map((lvl) => ({
    level: `${lvl.level}. ${LEVEL_NAMES[lvl.level] ?? ''}`,
    levelNum: lvl.level,
    reached: lvl.users_reached,
    completed: lvl.users_completed,
  }));

  return (
    <MetricCard
      title="Progreso en los 12 pasos"
      description="Usuarios que han alcanzado y completado cada nivel del programa"
      loading={loading}
      error={error}
    >
      {data && (
        <>
          {/* KPIs resumen */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-[#f8f6f3] border border-[#e5e5e5] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[#d4854a]" />
                <span className="text-xs font-medium text-[#737373] uppercase">Con progreso</span>
              </div>
              <p className="text-2xl font-bold text-[#1a1a1a]">{data.total_users_with_progress}</p>
              <p className="text-xs text-[#737373]">usuarios totales</p>
            </div>
            <div className="bg-[#f8f6f3] border border-[#e5e5e5] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-[#737373] uppercase">Nivel más alto</span>
              </div>
              <p className="text-2xl font-bold text-[#1a1a1a]">{data.highest_level_reached}</p>
              <p className="text-xs text-[#737373]">de 12 pasos</p>
            </div>
          </div>

          {/* Leyenda manual arriba del grafico */}
          <CustomLegend />

          {/* Gráfico de barras */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="level"
                  stroke="#737373"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={70}
                />
                <YAxis stroke="#737373" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'reached' ? 'Alcanzaron' : 'Completaron',
                  ]}
                />
                <Bar dataKey="reached" fill="#d4854a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </MetricCard>
  );
}