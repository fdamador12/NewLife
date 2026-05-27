import { useState, useCallback } from 'react';
import {
  getFraseDia,
  getFrasesGuardadas,
  guardarFrase,
  desguardarFrase,
  getMisChallenges,
  joinChallenge,
  getMisMedallas,
} from '../../../services/motivationService';
import { FraseDia, UserChallenge, Medal } from '../types/motivation';

export const useMotivation = () => {
  const [fraseDia, setFraseDia] = useState<FraseDia | null>(null);
  const [frasesGuardadas, setFrasesGuardadas] = useState<FraseDia[]>([]);

  const [misChallenges, setMisChallenges] = useState<{
    activos: UserChallenge[];
    disponibles: UserChallenge[];
    terminados: UserChallenge[];
  }>({
    activos: [],
    disponibles: [],
    terminados: [],
  });

  const [misMedallas, setMisMedallas] = useState<Medal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFraseDia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const frase = await getFraseDia();
      setFraseDia(frase);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setFraseDia(null);
        setError(null);
        console.log('⚠️ No hay frase del día para hoy');
      } else {
        setError('No se pudo cargar la frase del día. Intenta de nuevo.');
        console.error('❌ Error fetchFraseDia:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFrasesGuardadas = useCallback(async () => {
    try {
      const frases = await getFrasesGuardadas();
      setFrasesGuardadas(frases || []);
    } catch (err: any) {
      setError('No se pudieron cargar las frases guardadas.');
      console.error('❌ Error fetchFrasesGuardadas:', err);
      setFrasesGuardadas([]);
    }
  }, []);

  const toggleFraseFavorita = useCallback(
    async (fraseId: string) => {
      try {
        setError(null);
        const isFavorite = frasesGuardadas && Array.isArray(frasesGuardadas)
          ? frasesGuardadas.some((f) => f.frase_id === fraseId)
          : false;

        if (isFavorite) {
          setFrasesGuardadas((prev) => prev.filter((f) => f.frase_id !== fraseId));
          await desguardarFrase(fraseId);
          if (fraseDia?.frase_id === fraseId) {
            setFraseDia((prev) => prev ? { ...prev, isFavorite: false } : null);
          }
        } else {
          const newSavedPhrase = {
            _id: fraseId,
            frase_id: fraseId,
            usuario_id: '',
            frase: fraseDia?.frase || '',
            dia: fraseDia?.dia || '',
          };
          setFrasesGuardadas((prev) => [...prev, newSavedPhrase]);
          await guardarFrase(fraseId);
          if (fraseDia?.frase_id === fraseId) {
            setFraseDia((prev) => prev ? { ...prev, isFavorite: true } : null);
          }
        }
      } catch (err: any) {
        setError('No se pudo actualizar el favorito. Intenta de nuevo.');
        console.error('❌ Error toggleFraseFavorita:', err);
        await fetchFrasesGuardadas();
      }
    },
    [frasesGuardadas, fraseDia, fetchFrasesGuardadas]
  );

  const fetchMisChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const challenges = await getMisChallenges();
      setMisChallenges({
        activos: challenges.activos || [],
        disponibles: challenges.disponibles || [],
        terminados: challenges.terminados || [],
      });
    } catch (err: any) {
      setError('No se pudieron cargar los retos. Intenta de nuevo.');
      console.error('❌ Error fetchMisChallenges:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleJoinChallenge = useCallback(
    async (retoId: string) => {
      try {
        setError(null);
        const newChallenge = await joinChallenge(retoId);
        console.log('✅ Inscrito al reto:', newChallenge);
        await fetchMisChallenges();
      } catch (err: any) {
        setError('No se pudo unir al reto. Intenta de nuevo.');
        console.error('❌ Error joinChallenge:', err);
      }
    },
    [fetchMisChallenges]
  );

  const fetchMisMedallas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const medallas = await getMisMedallas();
      setMisMedallas(medallas);
    } catch (err: any) {
      setError('No se pudieron cargar las medallas. Intenta de nuevo.');
      console.error('❌ Error fetchMisMedallas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fraseDia,
    frasesGuardadas: frasesGuardadas || [],
    misChallenges,
    misMedallas,
    loading,
    error,
    fetchFraseDia,
    fetchFrasesGuardadas,
    toggleFraseFavorita,
    fetchMisChallenges,
    handleJoinChallenge,
    fetchMisMedallas,
  };
};