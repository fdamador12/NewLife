import { useState, useEffect } from 'react';
import progressService from '../../../../../services/progressService';
import { EMOTION_ORDER } from '../utils/emotionColorMap';
import { isGuestMode, getGuestCheckins } from '../../../../../services/guestService';

export interface EmotionStat {
  label: string;
  value: number;
  count: number;
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

      const guest = await isGuestMode();
      let registros: any[] = [];

      if (guest) {
        // ✅ Guest — leer de AsyncStorage
        registros = await getGuestCheckins();
      } else {
        // ✅ Usuario normal — llamada al backend
        const data = await progressService.getAllRegistros();
        registros = data.registros || [];
      }

      const emotionCounts: Record<string, number> = {};
      registros.forEach((r: any) => {
        const emotion = r.emocion?.toLowerCase().trim();
        if (emotion) {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        }
      });

      const total = registros.length;
      const stats: EmotionStat[] = EMOTION_ORDER.map((emotion) => {
        const count = emotionCounts[emotion] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return {
          label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
          value: percentage,
          count,
          active: count > 0,
        };
      });

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