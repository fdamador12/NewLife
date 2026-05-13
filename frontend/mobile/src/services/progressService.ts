import api from './api';
import { cacheService } from './cacheService';
import { CACHE_KEYS } from './cacheKeys';

/**
 * Obtiene todos los registros diarios del usuario
 */
export const getAllRegistros = async () => {
  try {
    const response = await api.get('/progress/daily-checkin/all');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo registros:', error);
    throw error;
  }
};

/**
 * Interfaz del registro diario
 */
export interface DailyCheckinData {
  fecha: string; // ISO string: "2026-04-13T00:00:00.000Z"
  emocion: string; // emoji o label
  consumo: boolean;
  gratitud: string;
  ubicacion: string;
  social: string;
  reflexion: string;
}

/**
 * Registra el check-in diario del usuario
 */
export const saveDailyCheckin = async (data: {
  emocion: string;
  consumo: boolean;
  gratitud: string;
  ubicacion?: string;
  social?: string;
  reflexion?: string;
}) => {
  try {
    console.log('📤 Enviando daily-checkin:', JSON.stringify(data, null, 2));
    
    // ✅ NO enviar "fecha" — el backend la genera
    const payload = {
      emocion: data.emocion,
      consumo: data.consumo,
      gratitud: data.gratitud,
      // Solo agregar ubicacion, social, reflexion si consumo = true
      ...(data.consumo && {
        ubicacion: data.ubicacion || '',
        social: data.social || '',
        reflexion: data.reflexion || '',
      }),
    };
    
    const response = await api.post('/progress/daily-checkin', payload);
    
    console.log('✅ Daily-checkin guardado:', response.data);
    return response.data;
  } catch (error: any) {
    console.log('❌ Error guardando daily-checkin:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Obtiene el check-in de hoy si existe
 */
export const getTodayCheckin = async () => {
  try {
    const response = await api.get('/progress/daily-checkin/today');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo today checkin:', error.message);
    return null;
  }
};

/**
 * Obtiene el historial de gratitud
 */
export const getGratitudeHistory = async () => {
  return cacheService.withCache(
    CACHE_KEYS.LATEST_GRATITUDE,
    15,
    async () => {
      const response = await api.get('/progress/gratitude-history');
      return response.data;
    },
  );
};

/**
 * Obtiene el camino actual (nivel y subnivel)
 */
export const getCamino = async () => {
  return cacheService.withCache(
    CACHE_KEYS.CAMINO,
    15,
    async () => {
      const response = await api.get('/progress/camino');
      return response.data;
    },
  );
};

/**
 * Avanza al siguiente subnivel
 */
export const advanceCamino = async () => {
  try {
    const response = await api.post('/progress/camino/advance', {});
    return response.data;
  } catch (error: any) {
    console.error('❌ Error avanzando camino:', error.message);
    throw error;
  }
};

/**
 * Obtiene resumen de progreso
 */
export const getProgressSummary = async () => {
  try {
    const response = await api.get('/progress/summary');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo summary:', error.message);
    throw error;
  }
};

/**
 * Obtiene calendario del mes
 */
export const getCalendar = async (month: number, year: number) => {
  try {
    const response = await api.get('/progress/calendar', {
      params: { month, year },
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo calendar:', error.message);
    throw error;
  }
};

/**
 * Obtiene datos para gráficas de riesgo
 */
export const getRiskCharts = async () => {
  try {
    const response = await api.get('/progress/risk-charts');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo risk charts:', error.message);
    throw error;
  }
};


/**
 * Obtiene el nivel y subnivel actual del usuario
 */
export const getCaminoProgress = async () => {
  try {
    console.log('📊 Obteniendo progreso en el camino...');
    // Reutiliza el caché de getCamino (misma clave, mismo endpoint)
    const data = await cacheService.withCache(
      CACHE_KEYS.CAMINO,
      15,
      async () => {
        const response = await api.get('/progress/camino');
        console.log('✅ Respuesta completa:', response.data);
        return response.data;
      },
    );
    const progressData = data?.data || data;
    console.log('📊 Progreso extraído:', progressData);
    return progressData || { nivel: 1, subnivel: 1 };
  } catch (error: any) {
    console.error('❌ Error obteniendo progreso:', error.message);
    return { nivel: 1, subnivel: 1 };
  }
};

/**
 * Avanza al siguiente subnivel/nivel
 */
export const advanceCaminoProgress = async (nivel: number, subnivel: number) => {
  try {
    console.log(`⏭️  Avanzando ${nivel},${subnivel}...`);
    const response = await api.post('/progress/camino/advance', { nivel, subnivel });
    console.log('✅ Respuesta completa:', response.data);
    return response.data?.data || response.data;
  } catch (error: any) {
    console.error('❌ Error avanzando:', error.message);
    throw error;
  }
};


 /**
 * Inicializa/verifica el registro en camino del usuario
 */
export const initCamino = async () => {
  try {
    console.log('🆕 Inicializando registro en camino...');
    const response = await api.post('/progress/init');
    console.log('✅ Camino inicializado:', response.data);
    return response.data?.data || { nivel: 1, subnivel: 1 };
  } catch (error: any) {
    console.error('⚠️  Error inicializando camino:', error.message);
    return { nivel: 1, subnivel: 1 }; // Default
  }
};


/**
 * Obtiene fechas y estado de consumo
 */
export const getConsumptionRecords = async () => {
  try {
    const response = await api.get('/progress/daily-checkin/consumption-dates');
    const registros = response.data.registros || [];
    
    // Filtrar solo registros donde consumo es true
    return registros.filter((r: any) => r.consumo === true);
  } catch (error: any) {
    console.error('❌ Error obteniendo registros de consumo:', error);
    throw error;
  }
};


/**
 * Obtiene el ahorro acumulado del usuario
 */
export const getAhorro = async () => {
  return cacheService.withCache(
    CACHE_KEYS.SAVED_MONEY,
    5,
    async () => {
      const response = await api.get('/progress/ahorro');
      return response.data;
    },
  );
};

/**
 * Export default para facilitar imports
 */
export default {
  saveDailyCheckin,
  getTodayCheckin,
  getGratitudeHistory,
  getCamino,
  advanceCamino,
  getProgressSummary,
  getCalendar,
  getRiskCharts,
  getCaminoProgress,
  advanceCaminoProgress,
  initCamino,
  getAllRegistros,
  getConsumptionRecords,
  getAhorro,
};
