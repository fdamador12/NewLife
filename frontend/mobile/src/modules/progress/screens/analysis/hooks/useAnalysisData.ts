import { useState, useEffect } from 'react';
import progressService from '../../../../../services/progressService';
import { isGuestMode, getGuestCheckins } from '../../../../../services/guestService';

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

// ✅ Calcula riskCharts desde checkins locales
function calcularRiskChartsDesdeCheckins(checkins: any[]) {
  const conConsumo = checkins.filter(c => c.consumo === true);

  // Emociones detonantes
  const emocionCount: Record<string, number> = {};
  conConsumo.forEach(c => {
    if (c.emocion) emocionCount[c.emocion] = (emocionCount[c.emocion] || 0) + 1;
  });
  const totalEmociones = Object.values(emocionCount).reduce((a, b) => a + b, 0);
  const emociones_detonantes = {
    data: Object.entries(emocionCount).map(([label, value]) => ({
      label,
      value,
      porcentaje: totalEmociones > 0 ? Math.round((value / totalEmociones) * 100) : 0,
    })),
  };

  // Zonas de riesgo
  const zonaCount: Record<string, number> = {};
  conConsumo.forEach(c => {
    if (c.ubicacion) zonaCount[c.ubicacion] = (zonaCount[c.ubicacion] || 0) + 1;
  });
  const totalZonas = Object.values(zonaCount).reduce((a, b) => a + b, 0);
  const zonas_riesgo = {
    data: Object.entries(zonaCount).map(([label, value]) => ({
      label,
      value,
      porcentaje: totalZonas > 0 ? Math.round((value / totalZonas) * 100) : 0,
    })),
  };

  // Vínculos de riesgo
  const socialCount: Record<string, number> = {};
  conConsumo.forEach(c => {
    if (c.social) socialCount[c.social] = (socialCount[c.social] || 0) + 1;
  });
  const totalSocial = Object.values(socialCount).reduce((a, b) => a + b, 0);
  const vinculos_riesgo = {
    total_personas: totalSocial,
    data: Object.entries(socialCount).map(([label, value]) => ({
      label,
      value,
      porcentaje: totalSocial > 0 ? Math.round((value / totalSocial) * 100) : 0,
    })),
  };

  return { vinculos_riesgo, zonas_riesgo, emociones_detonantes };
}

// ✅ Calcula calendario del mes desde checkins locales
function calcularCalendarioDesdeCheckins(checkins: any[], month: number, year: number) {
  const filtered = checkins.filter(c => {
    const fecha = new Date(c.fecha);
    return fecha.getMonth() + 1 === month && fecha.getFullYear() === year;
  });

  const days = filtered.map(c => ({
    day: new Date(c.fecha).getDate(),
    tipo: c.consumo ? 'dificil' : 'limpio',
    resumen: {
      emocion: c.emocion || '',
      ...(c.consumo && {
        ubicacion: c.ubicacion,
        social: c.social,
      }),
    },
  }));

  return { days };
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

      const guest = await isGuestMode();

      if (guest) {
        console.log('🔄 Cargando análisis desde AsyncStorage (guest)...');
        const checkins = await getGuestCheckins();

        // ✅ Sin summary de IA en guest mode
        setSummary(null);

        // ✅ Calcular charts desde checkins locales
        const charts = calcularRiskChartsDesdeCheckins(checkins);
        setRiskCharts(charts);

        // ✅ Calendario del mes actual
        const now = new Date();
        const cal = calcularCalendarioDesdeCheckins(
          checkins,
          now.getMonth() + 1,
          now.getFullYear(),
        );
        setCalendar(cal);

        // ✅ Checkin de hoy
        const hoy = now.toISOString().slice(0, 10);
        const todayC = checkins.find(c => c.dia === hoy) ?? null;
        setTodayCheckin(todayC);

        console.log('✅ Análisis guest cargado');
      } else {
        console.log('🔄 Iniciando carga de datos...');

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

        const now = new Date();
        const calendarData = await progressService.getCalendar(
          now.getMonth() + 1,
          now.getFullYear(),
        );

        console.log('✅ Calendar:', calendarData);
        setCalendar(calendarData);
      }
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