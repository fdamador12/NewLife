import { useState, useEffect } from 'react';
import { getCaminoProgress, advanceCaminoProgress } from '../services/progressService';
import { isGuestMode, getGuestProgress, saveGuestProgress } from '../services/guestService';

export interface LevelProgress {
  nivel: number;
  subnivel: number;
}

const MAX_NIVEL = 12;
const MAX_SUBNIVEL = 3;

export const useLevelProgress = () => {
  const [progress, setProgress] = useState<LevelProgress>({ nivel: 1, subnivel: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const guest = await isGuestMode();

      if (guest) {
        const data = await getGuestProgress();
        setProgress(data);
        console.log('📊 Progreso guest cargado:', data);
      } else {
        const data = await getCaminoProgress();
        const progressData = {
          nivel: data?.nivel ?? 1,
          subnivel: data?.subnivel ?? 1,
        };
        setProgress(progressData);
        console.log('📊 Progreso cargado:', progressData);
      }
    } catch (err: any) {
      console.error('❌ Error cargando progreso:', err);
      setError('No se pudo cargar el progreso');
    } finally {
      setLoading(false);
    }
  };

  const advance = async (currentLevel: number, currentSublevel: number) => {
    try {
      console.log(`⏭️  Avanzando desde nivel ${currentLevel} subnivel ${currentSublevel}`);

      const guest = await isGuestMode();

      if (guest) {
        // ✅ Calcular siguiente nivel/subnivel localmente
        let newNivel = currentLevel;
        let newSubnivel = currentSublevel + 1;

        if (newSubnivel > MAX_SUBNIVEL) {
          newSubnivel = 1;
          newNivel = Math.min(currentLevel + 1, MAX_NIVEL);
        }

        await saveGuestProgress(newNivel, newSubnivel);
        const updatedProgress = { nivel: newNivel, subnivel: newSubnivel };
        setProgress(updatedProgress);
        console.log('✅ Progreso guest actualizado:', updatedProgress);
        return updatedProgress;
      } else {
        const newProgress = await advanceCaminoProgress(currentLevel, currentSublevel);
        const updatedProgress = {
          nivel: newProgress?.nivel ?? progress.nivel,
          subnivel: newProgress?.subnivel ?? progress.subnivel,
        };
        setProgress(updatedProgress);
        console.log('✅ Progreso actualizado:', updatedProgress);
        return updatedProgress;
      }
    } catch (err) {
      console.error('❌ Error avanzando:', err);
      throw err;
    }
  };

  const isLocked = (checkLevel: number, checkSub: number): boolean => {
    if (checkLevel > progress.nivel) return true;
    if (checkLevel === progress.nivel && checkSub > progress.subnivel) return true;
    return false;
  };

  const isCompleted = (checkLevel: number, checkSub: number): boolean => {
    if (checkLevel < progress.nivel) return true;
    if (checkLevel === progress.nivel && checkSub < progress.subnivel) return true;
    return false;
  };

  return {
    progress,
    loading,
    error,
    advance,
    isLocked,
    isCompleted,
    refetch: fetchProgress,
  };
};