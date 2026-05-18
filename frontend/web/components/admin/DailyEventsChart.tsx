'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MetricCard } from './MetricCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MetricState } from '@/hooks/useAnalytics';
import type { DailyEventsResult, EventCategory } from '@/lib/analytics';

interface DailyEventsChartProps {
  state: MetricState<DailyEventsResult>;
  category?: EventCategory;
  onCategoryChange?: (category: EventCategory | undefined) => void;
}

const CATEGORIES: Array<{ value: EventCategory | 'all'; label: string }> = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'session', label: 'Sesión' },
  { value: 'navigation', label: 'Navegación' },
  { value: 'crisis', label: 'Crisis' },
  { value: 'content', label: 'Contenido' },
  { value: 'care', label: 'Cuidado' },
  { value: 'gamification', label: 'Gamification' },
  { value: 'progress', label: 'Progreso' },
];

/**
 * Formatea fecha YYYY-MM-DD a DD MMM (ej: "18 May") para el eje X.
 */
function formatXAxis(date: string): string {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export function DailyEventsChart({ state, category, onCategoryChange }: DailyEventsChartProps) {
  const { data, loading, error } = state;

  const handleSelect = (val: string) => {
    onCategoryChange?.(val === 'all' ? undefined : (val as EventCategory));
  };

  return (
    <MetricCard
      title="Actividad diaria"
      description="Eventos y usuarios únicos por día"
      loading={loading}
      error={error}
    >
      {data && (
        <>
          <div className="flex justify-end mb-4">
            <Select value={category ?? 'all'} onValueChange={handleSelect}>
              <SelectTrigger className="w-56 bg-[#f8f6f3] border-[#e5e5e5]">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.buckets} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4854a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d4854a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="date"
                  stroke="#737373"
                  fontSize={11}
                  tickFormatter={formatXAxis}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                  labelFormatter={(d) => formatXAxis(d as string)}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(v) => (v === 'total' ? 'Eventos' : 'Usuarios únicos')}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#d4854a"
                  strokeWidth={2}
                  fill="url(#colorEvents)"
                />
                <Area
                  type="monotone"
                  dataKey="unique_users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-[#a3a3a3] mt-3 text-center">
            Total: {data.range.days} días · del {data.range.from.slice(0, 10)} al {data.range.to.slice(0, 10)}
          </p>
        </>
      )}
    </MetricCard>
  );
}