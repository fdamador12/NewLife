// analysis/hooks/useAnalysisCalculations.ts

import { useState, useEffect } from 'react';
import { DailyCheckin, AnalysisResult, ChartDataPoint, PieChartData } from '../types/analysis';
import { AnalyticsOrchestrator } from '../utils/analyticsOrchestrator';
import { chartConfig, getEmotionColor } from '../utils/chartConfig';

export function useAnalysisCalculations(registros: DailyCheckin[], timeframe: 'week' | 'month' = 'month') {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [emotionChartData, setEmotionChartData] = useState<ChartDataPoint[]>([]);
  const [locationChartData, setLocationChartData] = useState<PieChartData[]>([]);
  const [peopleChartData, setPeopleChartData] = useState<ChartDataPoint[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (registros.length === 0) {
      setAnalysis(null);
      return;
    }

    calculateAnalysis();
  }, [registros, timeframe]);

  const calculateAnalysis = () => {
    setLoading(true);
    try {
      // Usar el orchestrator para analizar
      const result = AnalyticsOrchestrator.analyze(registros, timeframe);
      setAnalysis(result);

      // Preparar datos para gráficas
      prepareChartData(result);
    } catch (error) {
      console.error('Error calculating analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (result: AnalysisResult) => {
    // Gráfica de Emociones - Barras Verticales
    const emotionData: ChartDataPoint[] = result.metrics.topEmotions.map(e => ({
      label: `${e.emoji} ${e.label}`,
      value: e.count,
      color: getEmotionColor(e.label),
    }));
    setEmotionChartData(emotionData);

    // Gráfica de Ubicaciones - Pastel
    const locationData: PieChartData[] = result.metrics.topLocations.map(l => ({
      label: l.label,
      value: l.count,
      color: getRandomColor(),
      percentage: l.percentage,
    }));
    setLocationChartData(locationData);

    // Gráfica de Personas - Barras Horizontales
    const peopleData: ChartDataPoint[] = result.metrics.topPeople.map(p => ({
      label: p.label,
      value: p.count,
      color: chartConfig.colors.primary,
    }));
    setPeopleChartData(peopleData);

    // Timeline de emociones
    const timeline = result.metrics.timeline.map(t => ({
      timestamp: t.timestamp,
      value: t.emocionValue,
      emocion: t.emocion,
      label: formatTimelineLabel(t.timestamp),
    }));
    setTimelineData(timeline);
  };

  return {
    analysis,
    emotionChartData,
    locationChartData,
    peopleChartData,
    timelineData,
    loading,
  };
}

/**
 * Genera colores aleatorios para gráficas
 */
function getRandomColor(): string {
  const colors = [
    '#FF6B6B', // Rojo
    '#4ECDC4', // Turquesa
    '#45B7D1', // Azul
    '#FFA07A', // Salmón
    '#98D8C8', // Verde menta
    '#F7DC6F', // Amarillo
    '#BB8FCE', // Púrpura
    '#F8B88B', // Durazno
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Formatea fecha para timeline
 */
function formatTimelineLabel(dateString: string): string {
  const date = new Date(dateString);
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return `${days[date.getDay()]} ${date.getDate()}`;
}