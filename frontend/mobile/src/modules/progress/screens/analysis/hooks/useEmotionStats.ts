import { useState, useEffect } from 'react';
import progressService from '../../../../../services/progressService';
import { EMOTION_ORDER } from '../utils/emotionColorMap';

export interface EmotionStat {
  label: string;
  value: number; // porcentaje
  count: number; // cantidad
  active: boolean;
}

export function useEmotionStats() {
  const [emotionStats, setEmotionStats] = useState<EmotionStat[]>([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmotionStats();
  }, []);

const fetchEmotionStats = async () => {
  try {
    setLoading(true);
    setError(null);

    // Obtener todos los registros
    const data = await progressService.getAllRegistros();
    const registros = data.registros || [];

    console.log('📊 DATOS CRUDOS del backend:', data);
    console.log('📊 Registros obtenidos (cantidad):', registros.length);
    console.log('📊 Registros detallados:', JSON.stringify(registros, null, 2));

    // Contar emociones
    const emotionCounts: Record<string, number> = {};
    registros.forEach((r: any) => {
      const emotion = r.emocion?.toLowerCase().trim();
      console.log('🔍 Procesando registro - emoción:', emotion);
      if (emotion) {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      }
    });

    console.log('📈 CONTEOS POR EMOCIÓN:', emotionCounts);

    // Calcular porcentajes
    const total = registros.length;
    console.log('📊 TOTAL DE REGISTROS:', total);

    const stats: EmotionStat[] = EMOTION_ORDER.map((emotion) => {
      const count = emotionCounts[emotion] || 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

      console.log(`🎯 ${emotion}: count=${count}, porcentaje=${percentage}%`);

      return {
        label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        value: percentage,
        count,
        active: count > 0,
      };
    });

    console.log('✅ ESTADÍSTICAS FINALES:', JSON.stringify(stats, null, 2));

    setEmotionStats(stats);
    setTotalRegistros(total);
  } catch (err: any) {
    console.error('❌ Error procesando emociones:', err);
    setError('No se pudieron cargar las emociones');
  } finally {
    setLoading(false);
  }
};

  return {
    emotionStats,
    totalRegistros,
    loading,
    error,
    refetch: fetchEmotionStats,
  };
}