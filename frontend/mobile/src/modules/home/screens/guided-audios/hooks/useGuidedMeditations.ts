import { useState, useEffect } from 'react';
import api from '../../../../../services/api';

export interface GuidedMeditationSound {
  audio_id: string;
  nombre: string;
  duracion: number;
  categoria: string;
  url: string;
}

export const useGuidedMeditations = () => {
  const [meditations, setMeditations] = useState<GuidedMeditationSound[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeditations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/guided-meditation');

      if (Array.isArray(response.data)) {
        setMeditations(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error cargando meditaciones');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeditations();
  }, []);

  return {
    meditations,
    loading,
    error,
    fetchMeditations,
  };
};