// frontend/mobile/src/modules/progress/screens/analysis/hooks/useAnalysisData.ts

import { useState, useEffect } from 'react';
import progressService from '../../../../../services/progressService';

export interface AnalysisData {
  summary: {
    animo: string;
    sobriedad: string;
    detonantes: string;
  } | null;
  riskCharts: {
    vinculos_riesgo: {
      total_personas: number;
      data: Array<{ label: string; value: number; porcentaje: number }>;
    };
    zonas_riesgo: {
      data: Array<{ label: string; value: number; porcentaje: number }>;
    };
    emociones_detonantes: {
      data: Array<{ label: string; value: number; porcentaje: number }>;
    };
  } | null;
  calendar: any | null;
  todayCheckin: any | null;
}

export function useAnalysisData() {
  const [summary, setSummary] = useState<AnalysisData['summary']>(null);
  const [riskCharts, setRiskCharts] = useState<AnalysisData['riskCharts']>(null);
  const [calendar, setCalendar] = useState<AnalysisData['calendar']>(null);
  const [todayCheckin, setTodayCheckin] = useState<AnalysisData['todayCheckin']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysisData();
  }, []);


  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Iniciando carga de datos...');

      // Obtener datos en paralelo
      const [summaryData, chartsData, todayData] = await Promise.all([
        progressService.getProgressSummary(),
        progressService.getRiskCharts(),
        progressService.getTodayCheckin(),
      ]);

      console.log('✅ Summary:', summaryData);
      console.log('✅ Charts:', chartsData);
      console.log('✅ Today:', todayData);

      setSummary(summaryData);
      setRiskCharts(chartsData);
      setTodayCheckin(todayData);

      // Obtener calendario del mes actual
      const now = new Date();
      const calendarData = await progressService.getCalendar(
        now.getMonth() + 1,
        now.getFullYear()
      );
      
      console.log('✅ Calendar:', calendarData);
      setCalendar(calendarData);
    } catch (err: any) {
      console.error('❌ Error fetching analysis data:', err);
      setError('No se pudieron cargar los análisis');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchAnalysisData();
  };

  return {
    summary,
    riskCharts,
    calendar,
    todayCheckin,
    loading,
    error,
    refetch,
  };
}