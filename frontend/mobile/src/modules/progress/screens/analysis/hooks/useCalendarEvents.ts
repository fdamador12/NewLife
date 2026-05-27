import { useMemo } from 'react';
import { CalendarEvent } from '../data/colombianEvents';
import { calculateEventsForYear } from '../utils/holidayCalculator';

// ✅ Hook que retorna mapa de fecha → eventos para un año dado
// Memoizado — solo recalcula cuando cambia el año
export function useCalendarEvents(year: number): Record<string, CalendarEvent[]> {
  return useMemo(() => {
    return calculateEventsForYear(year);
  }, [year]);
}