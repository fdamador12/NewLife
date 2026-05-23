import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { cacheService } from './cacheService';
import { CACHE_KEYS } from './cacheKeys';
import { 
  getGuestDataForMigration, 
  clearGuestData,
  setPendingMigration,
  clearPendingMigration,
} from './guestService';


// ─── Auth ─────────────────────────────────────────────────────────────────────

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

export const logoutUser = async () => {
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userEmail']);
  await cacheService.clearAll();
};

// ─── Migración de Invitado ────────────────────────────────────────────────────

export const migrateGuestToUser = async (): Promise<void> => {
  try {
    const guestData = await getGuestDataForMigration();

    if (!guestData.guestId) {
      console.log('ℹ️ No hay datos de invitado para migrar');
      return;
    }

    const payload = {
      guestId: guestData.guestId,
      profile: {
        apodo: guestData.profile.apodo || '',
        pronombre: guestData.profile.pronombre || '',
        ult_fecha_consumo: guestData.profile.ult_fecha_consumo || '',
        motivo_sobrio: guestData.profile.motivo_sobrio || '',
        gasto_semana: Number(guestData.profile.gasto_semana ?? guestData.profile.gasto_semanal ?? 0),
        telefono: Number(guestData.profile.telefono ?? 0),
        reg_lugar_riesgo: Boolean(guestData.profile.reg_lugar_riesgo ?? false),
        comp_logros_comunid: Boolean(guestData.profile.comp_logros_comunid ?? false),
        moment_motiv: guestData.profile.moment_motiv || '09:00:00',
        ...(guestData.profile.nombre_contacto && {
          nombre_contacto: guestData.profile.nombre_contacto,
        }),
      },
      sobriety: guestData.sobriety,
      contacts: (guestData.contacts || []).map((c: any) => ({
        id: c.id,
        nombre: c.nombre,
        telefono: c.telefono,
      })),
      checkins: (guestData.checkins || []).map((c: any) => ({
        fecha: c.fecha,
        emocion: c.emocion,
        consumo: c.consumo,
        gratitud: c.gratitud,
        ...(c.consumo && {
          ubicacion: c.ubicacion || '',
          social: c.social || '',
          reflexion: c.reflexion || '',
        }),
      })),
      progress: guestData.progress ? {
        nivel: guestData.progress.nivel,
        subnivel: guestData.progress.subnivel,
      } : undefined,
      pet: guestData.pet ? {
        xp: guestData.pet.xp ?? 0,
        selected_form: guestData.pet.selected_form ?? 'seed',
        unlocked_forms: guestData.pet.unlocked_forms ?? ['seed'],
        last_actions: guestData.pet.last_actions ?? {},
      } : undefined,
    };

    console.log('📤 Migrando datos de invitado...');
    await api.post('/auth/migrate-guest', payload);

    // ✅ Éxito — limpiar datos guest y flag
    await clearGuestData();
    await clearPendingMigration();
    console.log('✅ Migración de invitado completada');
  } catch (error: any) {
    // ✅ Error — guardar flag para reintentar después
    await setPendingMigration();
    console.error('❌ Error en migración:', error.response?.data || error.message);
    throw error;
  }
};

// ─── User Profile ─────────────────────────────────────────────────────────────

export const getOnboardingStatus = async () => {
  const response = await api.get('/user/onboarding-status');
  return response.data;
};

export const completeProfile = async (data: object) => {
  const response = await api.post('/user/complete-profile', data);
  return response.data;
};

export const getProfile = async () => {
  return cacheService.withCache(
    CACHE_KEYS.PROFILE,
    30,
    async () => {
      const response = await api.get('/user/profile');
      return response.data;
    },
  );
};

export const deleteAllData = async (): Promise<void> => {
  await api.delete('/user/all-data');
  await logoutUser();
};

export const requestPasswordChange = async (): Promise<void> => {
  const email = await AsyncStorage.getItem('userEmail');
  if (!email) throw new Error('No se encontró el correo');
  await api.post('/auth/forgot-password', { email });
};

// ─── Contactos ────────────────────────────────────────────────────────────────

export const createContact = async (nombre: string, telefono: string) => {
  const response = await api.post('/contacts', { nombre, telefono });
  return response.data;
};

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

export const updateContact = async (id: string, nombre: string, telefono: string) => {
  const response = await api.patch(`/contacts/${id}`, { nombre, telefono });
  return response.data;
};

export const deleteContact = async (id: string) => {
  const response = await api.delete(`/contacts/${id}`);
  return response.data;
};

// ─── Sobriedad ────────────────────────────────────────────────────────────────

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

export const getSobrietyTime = async () => {
  try {
    const response = await api.get('/progress/sobriety-time');
    const contador = response.data?.contador;
    console.log('✅ Tiempo sobrio obtenido:', contador);
    return {
      message: response.data?.message,
      contador: contador || { dias: 0, horas: 0, minutos: 0 },
    };
  } catch (error: any) {
    console.error('❌ Error obteniendo tiempo sobrio:', error.message);
    return {
      message: 'Error',
      contador: { dias: 0, horas: 0, minutos: 0 },
    };
  }
};

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

export const updateProfile = async (data: {
  apodo?: string;
  pronombre?: string;
  motivo_sobrio?: string;
  gasto_semanal?: number;
}) => {
  const response = await api.patch('/user/profile', data);
  return response.data;
};