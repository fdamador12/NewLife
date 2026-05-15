import api from '../../../services/api';
import { cacheService } from '../../../services/cacheService';
import { CACHE_KEYS } from '../../../services/cacheKeys';

/**
 * Obtiene todas las frases hasta una fecha específica
 * Retorna todas las frases creadas antes o igual a esa fecha
 */
export const getFrasesPorFecha = async (fecha: string) => {
  return cacheService.withCache(
    CACHE_KEYS.MOTIVATIONAL_PHRASES,
    30,
    async () => {
      const response = await api.get(`/motivation/frases?hasta=${fecha}`);
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    },
  );
};

/**
 * Guarda una frase en favoritas
 */
export const guardarFraseMotivacional = async (fraseId: string) => {
  try {
    await api.post('/motivation/frases-guardadas', { frase_id: fraseId });
    console.log('✅ Frase guardada como favorita');
  } catch (error: any) {
    console.error('❌ Error guardando frase:', error.message);
    throw error;
  }
};

/**
 * Elimina una frase de favoritas
 */
export const desguardarFraseMotivacional = async (fraseId: string) => {
  try {
    await api.delete(`/motivation/frases-guardadas/${fraseId}`);
    console.log('✅ Frase removida de favoritas');
  } catch (error: any) {
    console.error('❌ Error removiendo favorita:', error.message);
    throw error;
  }
};