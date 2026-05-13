import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { getGuestDataForMigration, clearGuestData } from './guestService';
import { cacheService } from './cacheService';
import { CACHE_KEYS } from './cacheKeys';

// Caché en memoria: se pre-carga desde AsyncStorage al arrancar el módulo
// para que getProfileSync() retorne el apodo sin esperar ningún await.
let _profileMemCache: any = null;
(async () => {
  const cached = await cacheService.get<any>(CACHE_KEYS.PROFILE);
  if (cached) _profileMemCache = cached;
})();

export const getProfileSync = () => _profileMemCache;

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Login con email y password
 */
export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const { accessToken, refreshToken, user } = response.data;

  await AsyncStorage.multiSet([
    ['accessToken', accessToken],
    ['refreshToken', refreshToken],
    ['userEmail', email],
  ]);

  try {
    console.log('🆕 Inicializando registro en camino...');
    await api.post('/progress/init');
    console.log('✅ Registro en camino inicializado');
  } catch (error: any) {
    console.warn('⚠️  Error inicializando camino:', error.message);
  }

  return response.data;
};

export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await api.post('/auth/reset-password', { token, newPassword });
};

/**
 * Registro de nuevo usuario
 */
export const registerUser = async (
  nombre: string,
  email: string,
  password: string,
) => {
  await api.post('/auth/register', { nombre, email, password });
};

export const verifyEmail = async (email: string, code: string): Promise<void> => {
  await api.post('/auth/verify-email', { email, code });
};

export const initSobriety = async (fecha_ultimo_consumo: string) => {
  await api.post('/progress/init-sobriety', { fecha_ultimo_consumo });
};

/**
 * Logout del usuario
 */
export const logoutUser = async () => {
  _profileMemCache = null;
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userEmail']);
  await cacheService.clearAll();
};

// ─── Migración de Invitado ────────────────────────────────────────────────────

/**
 * Migra datos de invitado al backend después de registrarse
 */
export const migrateGuestToUser = async (): Promise<void> => {
  try {
    const guestData = await getGuestDataForMigration();

    if (!guestData.guestId) {
      console.log('ℹ️ No hay datos de invitado para migrar');
      return;
    }

    console.log('📤 Migrando datos de invitado:', JSON.stringify(guestData, null, 2));

    await api.post('/auth/migrate-guest', guestData);

    await clearGuestData();

    console.log('✅ Migración de invitado completada');
  } catch (error: any) {
    console.error('❌ Error en migración:', error.response?.data || error.message);
    throw error;
  }
};

// ─── User Profile ─────────────────────────────────────────────────────────────

/**
 * Obtiene el estado del onboarding del usuario
 */
export const getOnboardingStatus = async () => {
  const response = await api.get('/user/onboarding-status');
  return response.data;
};

/**
 * Completa el perfil del usuario (10 preguntas)
 */
export const completeProfile = async (data: object) => {
  const response = await api.post('/user/complete-profile', data);
  return response.data;
};

/**
 * Obtiene el perfil completo del usuario
 */
export const getProfile = async () => {
  const result = await cacheService.withCache(
    CACHE_KEYS.PROFILE,
    30,
    async () => {
      const response = await api.get('/user/profile');
      return response.data;
    },
    (fresh) => { _profileMemCache = fresh; },
  );
  _profileMemCache = result;
  return result;
};

export const deleteAllData = async (): Promise<void> => {
  await api.delete('/user/all-data');
  await logoutUser();
};

// ─── Contactos ────────────────────────────────────────────────────────────────

/**
 * Crea un nuevo contacto de emergencia
 */
export const createContact = async (nombre: string, telefono: string) => {
  const response = await api.post('/contacts', { nombre, telefono });
  return response.data;
};

/**
 * Obtiene lista de contactos de emergencia
 */
export const getContacts = async () => {
  return cacheService.withCache(
    CACHE_KEYS.EMERGENCY_CONTACTS,
    15,
    async () => {
      const response = await api.get('/contacts');
      return response.data;
    },
  );
};

/**
 * Actualiza un contacto de emergencia
 */
export const updateContact = async (id: string, nombre: string, telefono: string) => {
  const response = await api.patch(`/contacts/${id}`, { nombre, telefono });
  return response.data;
};

/**
 * Elimina un contacto de emergencia
 */
export const deleteContact = async (id: string) => {
  const response = await api.delete(`/contacts/${id}`);
  return response.data;
};

// ─── Sobriedad ────────────────────────────────────────────────────────────────

/**
 * Calcula tiempo sobrio considerando timezone local
 */
export const calculateSobrietyTime = (fechaUTCString: string | null) => {
  if (!fechaUTCString) {
    return { dias: 0, horas: 0, minutos: 0 };
  }

  try {
    const fechaUTC = new Date(fechaUTCString);
    const ahoraBrowserMs = Date.now();
    const diffMs = Math.max(0, ahoraBrowserMs - fechaUTC.getTime());

    const totalMinutos = Math.floor(diffMs / (1000 * 60));
    const totalHoras = Math.floor(totalMinutos / 60);
    const dias = Math.floor(totalHoras / 24);
    const horas = totalHoras % 24;
    const minutos = totalMinutos % 60;

    console.log(`📊 Tiempo sobrio: ${dias}d ${horas}h ${minutos}m (desde ${fechaUTCString})`);

    return { dias, horas, minutos };
  } catch (error) {
    console.error('❌ Error calculando tiempo sobrio:', error);
    return { dias: 0, horas: 0, minutos: 0 };
  }
};

/**
 * Obtiene tiempo sobrio actual del usuario
 */
export const getSobrietyTime = async () => {
  try {
    return await cacheService.withCache(
      CACHE_KEYS.SOBRIETY_TIME,
      5,
      async () => {
        const response = await api.get('/progress/sobriety-time');
        const contador = response.data?.contador;
        console.log('✅ Tiempo sobrio obtenido:', contador);
        return {
          message: response.data?.message,
          contador: contador || { dias: 0, horas: 0, minutos: 0 },
        };
      },
    );
  } catch (error: any) {
    console.error('❌ Error obteniendo tiempo sobrio:', error.message);
    return {
      message: 'Error',
      contador: { dias: 0, horas: 0, minutos: 0 },
    };
  }
};

/**
 * Obtiene resumen para home: apodo, pronombre, gasto semanal, tiempo sobrio
 */
export const getHomeSummary = async () => {
  try {
    const response = await api.get('/home/summary');
    console.log('✅ Resumen home obtenido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo resumen home:', error.message);
    return {
      apodo: '...',
      pronombre: '',
      gasto_semanal: 0,
      tiempo_sobrio: { dias: 0, horas: 0, minutos: 0 },
    };
  }
};

/**
 * Actualiza el perfil del usuario (apodo, pronombre, motivo_sobrio, gasto_semanal)
 */
export const updateProfile = async (data: {
  apodo?: string;
  pronombre?: string;
  motivo_sobrio?: string;
  gasto_semanal?: number;
}) => {
  const response = await api.patch('/user/profile', data);
  return response.data;
};