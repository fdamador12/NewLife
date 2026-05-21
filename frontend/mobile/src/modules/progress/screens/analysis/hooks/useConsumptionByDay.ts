import { useState, useEffect } from 'react';
import progressService from '../../../../../services/progressService';

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

      // Obtener registros con consumo
      const consumptionRecords = await progressService.getConsumptionRecords();

      console.log('📊 Registros de consumo:', consumptionRecords);

      // Contar consumos por día de la semana
      const dayCounts: Record<number, number> = {
        0: 0, // Domingo
        1: 0, // Lunes
        2: 0, // Martes
        3: 0, // Miércoles
        4: 0, // Jueves
        5: 0, // Viernes
        6: 0, // Sábado
      };

      consumptionRecords.forEach((record: any) => {
        // ✨ PARSEAR FECHA (sin timezone adjustment, porque ahora viene con hora correcta del dispositivo)
        const date = new Date(record.fecha);
        const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        dayCounts[dayOfWeek]++;

        console.log(`📊 Fecha: ${record.fecha} → Día: ${dayOfWeek} (${DAYS_OF_WEEK[dayOfWeek]})`);
      });

      console.log('📊 Conteos por día:', dayCounts);

      // Calcular totales
      const total = consumptionRecords.length;
      console.log('📊 Total de consumos:', total);

      // Crear array con orden: Lunes a Domingo
      const stats: ConsumptionDay[] = DAYS_OF_WEEK.map((day, index) => {
        const dayIndex = (index + 1) % 7; // Convierte Lunes=0 a dayOfWeek=1
        const count = dayCounts[dayIndex] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

        return {
          label: day,
          value: percentage,
          count,
          active: count > 0,
        };
      });

      console.log('✅ Estadísticas por día:', stats);

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