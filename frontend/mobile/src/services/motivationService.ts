import api from './api';
import { cacheService } from './cacheService';
import { CACHE_KEYS } from './cacheKeys';

/**
 * Obtiene la frase del día actual
 */
export const getFraseDia = async () => {
  try {
    return await cacheService.withCache(
      CACHE_KEYS.DAILY_PHRASES,
      15,
      async () => {
        const response = await api.get('/motivation/frase-del-dia');
        if (response.data?.data) {
          return {
            ...response.data.data,
            isFavorite: response.data.isGuardada || false,
          };
        }
        return null;
      },
    );
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log('⚠️ No hay frase del día para hoy');
      return null;
    }
    console.error('❌ Error obteniendo frase del día:', error.message);
    throw error;
  }
};

/**
 * Obtiene todas las frases guardadas (favoritas) del usuario
 */
export const getFrasesGuardadas = async () => {
  return cacheService.withCache(
    CACHE_KEYS.SAVED_PHRASES,
    30,
    async () => {
      const response = await api.get('/motivation/frases-guardadas');
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    },
  );
};

/**
 * Guarda una frase en favoritas (darle corazón)
 */
export const guardarFrase = async (fraseId: string) => {
  try {
    await api.post('/motivation/frases-guardadas', { frase_id: fraseId });
    console.log('✅ Frase guardada correctamente');
  } catch (error: any) {
    console.error('❌ Error guardando frase:', error.message);
    throw error;
  }
};

/**
 * Elimina una frase de favoritas (quitar corazón)
 */
export const desguardarFrase = async (fraseId: string) => {
  try {
    await api.delete(`/motivation/frases-guardadas/${fraseId}`);
    console.log('✅ Frase eliminada de favoritas correctamente');
  } catch (error: any) {
    console.error('❌ Error eliminando frase de favoritas:', error.message);
    throw error;
  }
};

/**
 * Obtiene todos los retos (activos, disponibles, terminados)
 */
export const getMisChallenges = async () => {
  try {
    return await cacheService.withCache(
      CACHE_KEYS.ACTIVE_CHALLENGE,
      15,
      async () => {
        const response = await api.get('/motivation/mis-retos');
        if (response.data?.data) {
          return response.data.data;
        }
        return { activos: [], disponibles: [], terminados: [] };
      },
    );
  } catch (error: any) {
    console.error('❌ Error obteniendo mis retos:', error.message);
    return { activos: [], disponibles: [], terminados: [] };
  }
};

/**
 * Inscribe al usuario a un reto publicado
 */
export const joinChallenge = async (retoId: string) => {
  try {
    const response = await api.post('/motivation/retos/unirse', { reto_id: retoId });
    console.log('✅ Inscrito al reto correctamente');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error uniéndose al reto:', error.message);
    throw error;
  }
};

/**
 * Obtiene todas las medallas (retos completados) del usuario
 */
export const getMisMedallas = async () => {
  try {
    const response = await api.get('/motivation/mis-medallas');
    // ✅ El backend retorna { data: [...] }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error: any) {
    console.error('❌ Error obteniendo medallas:', error.message);
    throw error;
  }
};


/**
 * Reclama los XP de un reto completado
 */

export const reclamarXp = async (userRetoId: string) => {
  try {
    const response = await api.post(`/motivation/retos/${userRetoId}/reclamar-xp`);
    return response.data;
  } catch (error: any) {
    console.log('❌ Error reclamando XP:', error.message);
    throw error;
  }
};