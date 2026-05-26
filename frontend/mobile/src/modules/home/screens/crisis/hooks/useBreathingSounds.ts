import { useState, useEffect } from 'react';
import api from '../../../../../services/api';

export interface BreathingSound {
  _id: string;
  breathing_id: string;
  nombre: string;
  freesound_id: number;
  preview_url: string;
  duracion_segundos: number;
  es_activo: boolean;
  created_at: string;
  updated_at: string;
}

interface UseBreathingSoundsReturn {
  sounds: BreathingSound[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useBreathingSounds = (): UseBreathingSoundsReturn => {
  const [sounds, setSounds] = useState<BreathingSound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSounds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/sos/breathing-sounds');
      if (Array.isArray(response.data)) {
        setSounds(response.data);
      } else {
        setError('No se pudieron cargar los sonidos. Intenta de nuevo.');
      }
    } catch (err: any) {
      console.error('Error obteniendo sonidos:', err);
      setError('No se pudieron cargar los sonidos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSounds();
  }, []);

  return { sounds, loading, error, refetch: fetchSounds };
};