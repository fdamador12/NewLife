import { useState, useCallback, useEffect } from 'react';
import { getCalendar, getAllRegistros } from '../../../../../services/progressService';

export interface ProcessedDay {
  day: number;
  tipo: 'limpio' | 'dificil';
  resumen: {
    emocion: string;
    ubicacion?: string;
    social?: string;
  };
}

export const useCalendarData = () => {
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [processedDays, setProcessedDays] = useState<ProcessedDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [minMonth, setMinMonth] = useState<number | null>(null);
  const [minYear, setMinYear] = useState<number | null>(null);
  const [maxMonth, setMaxMonth] = useState<number | null>(null);
  const [maxYear, setMaxYear] = useState<number | null>(null);

  const calculateMinMaxFromAllRegistros = useCallback(async () => {
    try {
      const response = await getAllRegistros();
      const allRegistros = response?.registros || [];

      if (!allRegistros || allRegistros.length === 0) {
        const today = new Date();
        setMinMonth(today.getMonth() + 1);
        setMinYear(today.getFullYear());
        setMaxMonth(today.getMonth() + 1);
        setMaxYear(today.getFullYear());
        return;
      }

      const fechas = allRegistros.map((r: any) => new Date(r.fecha));
      const minFecha = new Date(Math.min(...fechas.map((f: any) => f.getTime())));
      const maxFecha = new Date(Math.max(...fechas.map((f: any) => f.getTime())));

      setMinMonth(minFecha.getMonth() + 1);
      setMinYear(minFecha.getFullYear());
      setMaxMonth(maxFecha.getMonth() + 1);
      setMaxYear(maxFecha.getFullYear());
    } catch (err) {
      const today = new Date();
      setMinMonth(today.getMonth() + 1);
      setMinYear(today.getFullYear());
      setMaxMonth(today.getMonth() + 1);
      setMaxYear(today.getFullYear());
    }
  }, []);

  // processDays simplificado — el backend ya agrupa por día correctamente
  const processDays = useCallback((rawDays: any[]) => {
    return rawDays.map((reg) => ({
      day: reg.day,
      tipo: reg.tipo as 'limpio' | 'dificil',
      resumen: {
        emocion: reg.resumen?.emocion || 'Sin emoción',
        ...(reg.tipo === 'dificil' && {
          ubicacion: reg.resumen?.ubicacion,
          social: reg.resumen?.social,
        }),
      },
    })).sort((a, b) => a.day - b.day);
  }, []);

  const fetchCalendar = useCallback(
    async (month: number, year: number) => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCalendar(month, year);
        const processed = processDays(data.days || []);
        setProcessedDays(processed);
      } catch (err: any) {
        setError(err.message || 'Error cargando calendario');
        setProcessedDays([]);
      } finally {
        setLoading(false);
      }
    },
    [processDays]
  );

  const goToPreviousMonth = useCallback(() => {
    if (loading) return;

    let newMonth = currentMonth - 1;
    let newYear = currentYear;

    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    if (
      minYear && minMonth &&
      (newYear < minYear || (newYear === minYear && newMonth < minMonth))
    ) return;

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    fetchCalendar(newMonth, newYear);
  }, [currentMonth, currentYear, loading, minMonth, minYear, fetchCalendar]);

  const goToNextMonth = useCallback(() => {
    if (loading) return;

    let newMonth = currentMonth + 1;
    let newYear = currentYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    if (
      maxYear && maxMonth &&
      (newYear > maxYear || (newYear === maxYear && newMonth > maxMonth))
    ) return;

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    fetchCalendar(newMonth, newYear);
  }, [currentMonth, currentYear, loading, maxMonth, maxYear, fetchCalendar]);

  const loadInitial = useCallback(async () => {
    await calculateMinMaxFromAllRegistros();
    const today = new Date();
    fetchCalendar(today.getMonth() + 1, today.getFullYear());
  }, [calculateMinMaxFromAllRegistros, fetchCalendar]);

  const isPrevDisabled = useCallback((): boolean => {
    if (!minMonth || !minYear) return false;
    return currentYear < minYear || (currentYear === minYear && currentMonth <= minMonth);
  }, [currentMonth, currentYear, minMonth, minYear]);

  const isNextDisabled = useCallback((): boolean => {
    if (!maxMonth || !maxYear) return false;
    return currentYear > maxYear || (currentYear === maxYear && currentMonth >= maxMonth);
  }, [currentMonth, currentYear, maxMonth, maxYear]);

  return {
    currentMonth,
    currentYear,
    processedDays,
    loading,
    error,
    goToPreviousMonth,
    goToNextMonth,
    loadInitial,
    isPrevDisabled,
    isNextDisabled,
  };
};