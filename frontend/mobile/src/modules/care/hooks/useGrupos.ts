import { useState, useEffect, useCallback } from 'react';
import { gruposService, Grupo } from '../services/gruposService';

export const useGrupos = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrupos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gruposService.getGrupos();
      setGrupos(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error en useGrupos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrupos();
  }, [fetchGrupos]);

  return {
    grupos,
    loading,
    error,
    refetch: fetchGrupos,
  };
};