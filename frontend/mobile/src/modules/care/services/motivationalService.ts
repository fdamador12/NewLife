import api from '../../../services/api';
import { cacheService } from '../../../services/cacheService';
import { CACHE_KEYS } from '../../../services/cacheKeys';

// Caché en memoria: pre-cargada desde AsyncStorage al arrancar el módulo
// para que useMotivationalPhrases inicialice frases[] sin esperar ningún await.
let _phrasesMemCache: any[] | null = null;
(async () => {
  const cached = await cacheService.get<any[]>(CACHE_KEYS.MOTIVATIONAL_PHRASES);
  if (cached) _phrasesMemCache = cached;
})();

export const getMotivationalPhrasesSync = () => _phrasesMemCache;

/**
 * Obtiene todas las frases hasta una fecha específica
 * Retorna todas las frases creadas antes o igual a esa fecha
 */
export const getFrasesPorFecha = async (fecha: string) => {
  const result = await cacheService.withCache(
    CACHE_KEYS.MOTIVATIONAL_PHRASES,
    30,
    async () => {
      const response = await api.get(`/motivation/frases?hasta=${fecha}`);
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    },
    (fresh) => { _phrasesMemCache = fresh; },
  );
  _phrasesMemCache = result;
  return result;
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