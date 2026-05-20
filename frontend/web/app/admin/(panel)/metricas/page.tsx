'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart3 } from 'lucide-react';
import { useAnalyticsDashboard } from '@/hooks/useAnalytics';
import { OverviewCards } from '@/components/admin/OverviewCards';
import { DailyEventsChart } from '@/components/admin/DailyEventsChart';
import { CheckinFunnel } from '@/components/admin/CheckinFunnel';
import { SosStatsCard } from '@/components/admin/SosStatsCard';
import { TopContentList } from '@/components/admin/TopContentList';
import { TopPhrasesList } from '@/components/admin/TopPhrasesList';
import { LevelDistributionChart } from '@/components/admin/LevelDistributionChart';
import { ActivityByHourChart } from '@/components/admin/ActivityByHourChart';
import { EventsTable } from '@/components/admin/EventsTable';
import { DateRangeSelector, calculateDateRange } from '@/components/admin/DateRangeSelector';
import type { EventCategory } from '@/lib/analytics';

/**
 * Dashboard de metricas administrativo.
 *
 * Layout:
 * - Header con titulo + filtro de fechas global + boton refresh
 * - Overview cards (7 KPIs en grid)
 * - Grid 2x2 con DailyEvents (full width) + ActivityByHour
 * - Grid 2 cols con CheckinFunnel + SosStats
 * - Grid 2 cols con TopContent + TopPhrases
 * - LevelDistribution full width
 * - EventsTable full width al final
 *
 * Filtro global de fechas afecta a todas las metricas con rango temporal.
 * level-distribution y overview no se afectan (calculan sobre todo).
 */
export default function MetricasPage() {
  const [days, setDays] = useState<number | null>(30);
  const [dailyEventsCategory, setDailyEventsCategory] = useState<EventCategory | undefined>();

  // El rango se recalcula solo cuando cambia `days`
  const dateRange = useMemo(() => calculateDateRange(days), [days]);

  const {
    overview,
    dailyEvents,
    checkinFunnel,
    sosStats,
    topContent,
    topPhrases,
    levelDistribution,
    activityByHour,
    reload,
  } = useAnalyticsDashboard({
    dateRange,
    dailyEventsCategory,
  });

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header ────────────────────────────────────────── */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#d4854a]">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1a1a1a]">Métricas y analíticas</h1>
                <p className="text-sm text-[#737373]">
                  Resumen de uso de la app móvil — datos anonimizados
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={reload}
              className="bg-white border-[#e5e5e5] text-[#1a1a1a] hover:bg-[#f8f6f3] gap-2 w-fit"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>
          </div>
          <div className="bg-white border border-[#e5e5e5] rounded-lg p-3 shadow-sm">
            <DateRangeSelector days={days} onChange={setDays} />
          </div>
        </header>

        {/* ── Overview cards (KPIs) ─────────────────────────── */}
        <section className="mb-6">
          <OverviewCards state={overview} />
        </section>

        {/* ── Daily events (full width) ─────────────────────── */}
        <section className="mb-6">
          <DailyEventsChart
            state={dailyEvents}
            category={dailyEventsCategory}
            onCategoryChange={setDailyEventsCategory}
          />
        </section>

        {/* ── Funnel + SOS ──────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CheckinFunnel state={checkinFunnel} />
          <SosStatsCard state={sosStats} />
        </section>

        {/* ── Activity by hour (full width) ─────────────────── */}
        <section className="mb-6">
          <ActivityByHourChart state={activityByHour} />
        </section>

        {/* ── Top contenidos + Top frases ───────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TopContentList state={topContent} />
          <TopPhrasesList state={topPhrases} />
        </section>

        {/* ── Niveles 12 pasos (full width) ─────────────────── */}
        <section className="mb-6">
          <LevelDistributionChart state={levelDistribution} />
        </section>

        {/* ── Tabla de eventos (full width) ─────────────────── */}
        <section className="mb-6">
          <EventsTable dateRange={dateRange} />
        </section>
      </div>
    </div>
  );
}