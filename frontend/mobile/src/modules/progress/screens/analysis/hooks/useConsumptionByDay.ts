import { useState, useEffect } from 'react';
import progressService from '../../../../../services/progressService';
import { isGuestMode, getGuestCheckins } from '../../../../../services/guestService';

export interface ConsumptionDay {
  label: string;
  value: number;
  count: number;
  active: boolean;
}

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function useConsumptionByDay() {
  const [consumptionByDay, setConsumptionByDay] = useState<ConsumptionDay[]>([]);
  const [totalConsumption, setTotalConsumption] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConsumptionByDay();
  }, []);

  const fetchConsumptionByDay = async () => {
    try {
      setLoading(true);
      setError(null);

      const guest = await isGuestMode();
      let consumptionRecords: any[] = [];

      if (guest) {
        // ✅ Guest — filtrar checkins con consumo desde AsyncStorage
        const checkins = await getGuestCheckins();
        consumptionRecords = checkins.filter((c: any) => c.consumo === true);
      } else {
        // ✅ Usuario normal — llamada al backend
        consumptionRecords = await progressService.getConsumptionRecords();
      }

      const dayCounts: Record<number, number> = {
        0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
      };

      consumptionRecords.forEach((record: any) => {
        const date = new Date(record.fecha);
        const dayOfWeek = date.getDay();
        dayCounts[dayOfWeek]++;
      });

      const total = consumptionRecords.length;

      const stats: ConsumptionDay[] = DAYS_OF_WEEK.map((day, index) => {
        const dayIndex = (index + 1) % 7;
        const count = dayCounts[dayIndex] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return {
          label: day,
          value: percentage,
          count,
          active: count > 0,
        };
      });

      setConsumptionByDay(stats);
      setTotalConsumption(total);
    } catch (err: any) {
      console.error('❌ Error procesando consumo por día:', err);
      setError('No se pudo cargar el análisis de consumo');
    } finally {
      setLoading(false);
    }
  };

  return {
    consumptionByDay,
    totalConsumption,
    loading,
    error,
    refetch: fetchConsumptionByDay,
  };
}