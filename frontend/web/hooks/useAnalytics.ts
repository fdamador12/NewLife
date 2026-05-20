'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getOverview,
  getDailyEvents,
  getCheckinFunnel,
  getSosStats,
  getTopContent,
  getTopPhrases,
  getLevelDistribution,
  getActivityByHour,
  getEventsList,
  type OverviewMetrics,
  type DailyEventsResult,
  type CheckinFunnelResult,
  type SosStatsResult,
  type TopContentResult,
  type TopPhrasesResult,
  type LevelDistributionResult,
  type ActivityByHourResult,
  type EventsListResult,
  type EventsListFilter,
  type DailyEventsFilter,
  type DateRangeFilter,
} from '@/lib/analytics';

/**
 * Estado de una metrica individual: data, loading, error.
 */
export interface MetricState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Inicializa un MetricState con valores por defecto.
 */
function initialState<T>(): MetricState<T> {
  return { data: null, loading: true, error: null };
}

/**
 * Extrae un mensaje de error legible desde el error de axios.
 */
function extractErrorMessage(err: any): string {
  if (err?.response?.data?.message) {
    return Array.isArray(err.response.data.message)
      ? err.response.data.message.join(', ')
      : err.response.data.message;
  }
  if (err?.message) return err.message;
  return 'Error desconocido';
}

// ─── Hook para metricas principales del dashboard ────────────────────────

export interface UseAnalyticsDashboardOptions {
  /** Rango de fechas para todas las metricas con rango. Default: ultimos 30 dias. */
  dateRange?: DateRangeFilter;
  /** Categoria para filtrar daily-events. Default: todas. */
  dailyEventsCategory?: DailyEventsFilter['category'];
}

/**
 * Hook principal: carga TODAS las metricas del dashboard en paralelo.
 * Devuelve un objeto con cada metrica en su propio estado loading/error.
 *
 * Las llamadas se disparan al montar y cuando cambia el rango de fechas.
 */
export function useAnalyticsDashboard(options: UseAnalyticsDashboardOptions = {}) {
  const { dateRange = {}, dailyEventsCategory } = options;

  const [overview, setOverview] = useState<MetricState<OverviewMetrics>>(initialState);
  const [dailyEvents, setDailyEvents] = useState<MetricState<DailyEventsResult>>(initialState);
  const [checkinFunnel, setCheckinFunnel] = useState<MetricState<CheckinFunnelResult>>(initialState);
  const [sosStats, setSosStats] = useState<MetricState<SosStatsResult>>(initialState);
  const [topContent, setTopContent] = useState<MetricState<TopContentResult>>(initialState);
  const [topPhrases, setTopPhrases] = useState<MetricState<TopPhrasesResult>>(initialState);
  const [levelDistribution, setLevelDistribution] = useState<MetricState<LevelDistributionResult>>(initialState);
  const [activityByHour, setActivityByHour] = useState<MetricState<ActivityByHourResult>>(initialState);

  // Serializar el rango para detectar cambios en el useEffect
  const rangeKey = `${dateRange.from ?? ''}|${dateRange.to ?? ''}|${dailyEventsCategory ?? ''}`;

  const reload = useCallback(() => {
    // Helper generico para fetchear una metrica
    const fetchMetric = <T,>(
      promise: Promise<T>,
      setter: React.Dispatch<React.SetStateAction<MetricState<T>>>,
    ) => {
      setter({ data: null, loading: true, error: null });
      promise
        .then((data) => setter({ data, loading: false, error: null }))
        .catch((err) => setter({ data: null, loading: false, error: extractErrorMessage(err) }));
    };

    fetchMetric(getOverview(), setOverview);
    fetchMetric(getDailyEvents({ ...dateRange, category: dailyEventsCategory }), setDailyEvents);
    fetchMetric(getCheckinFunnel(dateRange), setCheckinFunnel);
    fetchMetric(getSosStats(dateRange), setSosStats);
    fetchMetric(getTopContent({ ...dateRange, limit: 10 }), setTopContent);
    fetchMetric(getTopPhrases({ ...dateRange, limit: 10 }), setTopPhrases);
    fetchMetric(getLevelDistribution(), setLevelDistribution);
    fetchMetric(getActivityByHour(dateRange), setActivityByHour);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    overview,
    dailyEvents,
    checkinFunnel,
    sosStats,
    topContent,
    topPhrases,
    levelDistribution,
    activityByHour,
    /** Recarga manual de todas las metricas */
    reload,
  };
}

// ─── Hook para la tabla de eventos (separado por paginacion) ──────────────

/**
 * Hook separado para la tabla de eventos, que tiene paginacion y filtros
 * propios diferentes al resto del dashboard.
 */
export function useEventsList(filter: EventsListFilter = {}) {
  const [state, setState] = useState<MetricState<EventsListResult>>(initialState);

  // Serializar los filtros para el useEffect
  const filterKey = JSON.stringify(filter);

  const reload = useCallback(() => {
    setState({ data: null, loading: true, error: null });
    getEventsList(filter)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => setState({ data: null, loading: false, error: extractErrorMessage(err) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    ...state,
    reload,
  };
}