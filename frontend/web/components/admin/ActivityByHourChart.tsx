'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MetricCard } from './MetricCard';
import { Clock, Moon } from 'lucide-react';
import type { MetricState } from '@/hooks/useAnalytics';
import type { ActivityByHourResult } from '@/lib/analytics';

interface ActivityByHourChartProps {
  state: MetricState<ActivityByHourResult>;
}

/** Umbral: a partir de cuantas horas empatadas se usa modo "resumen". */
const MAX_HOURS_TO_LIST = 5;

/**
 * Formatea hora 0-23 a "0h", "1h", ... para el eje X.
 */
function formatHour(hour: number): string {
  return `${hour}h`;
}

/**
 * Formatea un array de horas a string legible:
 * - [21]               → "21:00"
 * - [15, 16]           → "15:00 y 16:00"
 * - [5, 15, 16]        → "5:00, 15:00 y 16:00"
 * - [2, 3, 7, 8, 9, ..] → "11 horas" (resumen, no lista todas)
 * - []                 → "—"
 */
function formatHoursDisplay(hours: number[]): string {
  if (hours.length === 0) return '—';
  if (hours.length > MAX_HOURS_TO_LIST) return `${hours.length} horas`;
  if (hours.length === 1) return `${hours[0]}:00`;
  if (hours.length === 2) return `${hours[0]}:00 y ${hours[1]}:00`;
  // 3 a MAX_HOURS_TO_LIST
  const last = hours[hours.length - 1];
  const rest = hours.slice(0, -1).map((h) => `${h}:00`).join(', ');
  return `${rest} y ${last}:00`;
}

/**
 * Tooltip detallado con todas las horas (para cuando hay muchas).
 * Se muestra debajo cuando lengthHours > MAX_HOURS_TO_LIST.
 */
function formatHoursTooltip(hours: number[]): string {
  return hours.map((h) => `${h}:00`).join(', ');
}

/**
 * Tamano de fuente adaptativo segun cantidad de horas a mostrar.
 */
function fontSizeFor(count: number): string {
  if (count > MAX_HOURS_TO_LIST) return 'text-2xl'; // "11 horas" es corto, fuente normal
  if (count >= 4) return 'text-base';
  if (count === 3) return 'text-lg';
  if (count === 2) return 'text-xl';
  return 'text-2xl';
}

export function ActivityByHourChart({ state }: ActivityByHourChartProps) {
  const { data, loading, error } = state;

  return (
    <MetricCard
      title="Actividad por hora del día"
      description="Distribución horaria del uso de la app (todos los eventos del rango)"
      loading={loading}
      error={error}
    >
      {data && (
        <>
          {/* KPIs: hora pico + hora mas baja */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            {/* HORA PICO */}
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-700 uppercase">
                  {data.peak_hours.length > 1 ? 'Horas pico (empate)' : 'Hora pico'}
                </span>
              </div>
              <p
                className={`${fontSizeFor(data.peak_hours.length)} font-bold text-amber-900 leading-tight`}
                title={data.peak_hours.length > MAX_HOURS_TO_LIST ? formatHoursTooltip(data.peak_hours) : undefined}
              >
                {formatHoursDisplay(data.peak_hours)}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {data.peak_value > 0
                  ? `${data.peak_value} ${data.peak_value === 1 ? 'evento' : 'eventos'}${data.peak_hours.length > 1 ? ' cada una' : ''}`
                  : 'sin actividad'}
              </p>
            </div>

            {/* HORA MAS BAJA */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-medium text-indigo-700 uppercase">
                  {data.lowest_hours.length > 1 ? 'Horas más bajas (empate)' : 'Hora más baja'}
                </span>
              </div>
              <p
                className={`${fontSizeFor(data.lowest_hours.length)} font-bold text-indigo-900 leading-tight`}
                title={data.lowest_hours.length > MAX_HOURS_TO_LIST ? formatHoursTooltip(data.lowest_hours) : undefined}
              >
                {formatHoursDisplay(data.lowest_hours)}
              </p>
              <p className="text-xs text-indigo-700 mt-0.5">
                {data.lowest_value === 0
                  ? 'sin eventos cada una'
                  : `${data.lowest_value} ${data.lowest_value === 1 ? 'evento' : 'eventos'}${data.lowest_hours.length > 1 ? ' cada una' : ''}`}
              </p>
            </div>
          </div>

          {/* Bar chart 24h */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="hour"
                  stroke="#737373"
                  fontSize={10}
                  tickFormatter={formatHour}
                  interval={1}
                />
                <YAxis stroke="#737373" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                  labelFormatter={(h) => `Hora ${h}:00`}
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'events' ? 'Eventos' : 'Usuarios únicos',
                  ]}
                />
                <Bar dataKey="events" fill="#d4854a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-[#a3a3a3] mt-3 text-center">
            Total: {data.total_events} eventos
          </p>
        </>
      )}
    </MetricCard>
  );
}