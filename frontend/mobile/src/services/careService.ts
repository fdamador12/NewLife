import api from './api';
import { cacheService } from './cacheService';
import { CACHE_KEYS } from './cacheKeys';

// ─── GRUPOS ────────────────────────────────────────────────────────────────

/**
 * Obtiene todos los grupos de apoyo activos
 */
export const getGrupos = async () => {
  return cacheService.withCache(
    CACHE_KEYS.GROUPS,
    15,
    async () => {
      const response = await api.get('/care/grupos');
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    },
  );
};

// ─── CONTACTOS ────────────────────────────────────────────────────────────────

/**
 * Obtiene lista de contactos de emergencia del usuario
 */
export const getContactos = async () => {
  return cacheService.withCache(
    CACHE_KEYS.EMERGENCY_CONTACTS,
    15,
    async () => {
      const response = await api.get('/contacts');
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
  );
};

/**
 * Crea un nuevo contacto de emergencia
 */
export const createContacto = async (data: { nombre: string; telefono: string; foto_url?: string }) => {
  try {
    const response = await api.post('/contacts', {
      nombre: data.nombre,
      telefono: data.telefono,
      foto_url: data.foto_url || '',
    });
    console.log('✅ Contacto creado correctamente');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creando contacto:', error.message);
    throw error;
  }
};

/**
 * Actualiza un contacto de emergencia
 */
export const updateContacto = async (contactoId: string, data: { nombre?: string; telefono?: string; foto_url?: string }) => {
  try {
    const response = await api.patch(`/contacts/${contactoId}`, data);
    console.log('✅ Contacto actualizado correctamente');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error actualizando contacto:', error.message);
    throw error;
  }
};

/**
 * Elimina un contacto de emergencia
 */
export const deleteContacto = async (contactoId: string) => {
  try {
    const response = await api.delete(`/contacts/${contactoId}`);
    console.log('✅ Contacto eliminado correctamente');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error eliminando contacto:', error.message);
    throw error;
  }
};


// ─── CONTENIDO ────────────────────────────────────────────────────────────────
/**
 * Obtiene todo el contenido publicado (artículos, videos, etc)
 */
export const getContenido = async () => {
  return cacheService.withCache(
    CACHE_KEYS.CONTENTS,
    30,
    async () => {
      const response = await api.get('/care/contenido');
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    },
  );
};

/**
 * Obtiene los contenidos guardados como favoritos
 */
export const getFavoritos = async () => {
  try {
    const response = await api.get('/care/contenido/favoritos');
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error: any) {
    console.error('❌ Error obteniendo favoritos:', error.message);
    throw error;
  }
};

/**
 * Guarda un contenido como favorito
 */
export const addFavorito = async (contenidoId: string) => {
  try {
    await api.post(`/care/contenido/${contenidoId}/favorito`);
    console.log('✅ Contenido guardado como favorito');
  } catch (error: any) {
    console.error('❌ Error guardando favorito:', error.message);
    throw error;
  }
};

/**
 * Elimina un contenido de favoritos
 */
export const removeFavorito = async (contenidoId: string) => {
  try {
    await api.delete(`/care/contenido/${contenidoId}/favorito`);
    console.log('✅ Contenido removido de favoritos');
  } catch (error: any) {
    console.error('❌ Error removiendo favorito:', error.message);
    throw error;
  }
};

/**
 * Obtiene las categorías de contenido disponibles
 */
export const getCategorias = async () => {
  try {
    const response = await api.get('/care/categorias');
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error: any) {
    console.error('❌ Error obteniendo categorías:', error.message);
    throw error;
  }
};


// ─── AGENDA ────────────────────────────────────────────────────────────────
/**
 * Obtiene los eventos de la agenda del usuario
 */
export const getEventos = async () => {
  return cacheService.withCache(
    CACHE_KEYS.AGENDA_EVENTS,
    5,
    async () => {
      const response = await api.get('/care/agenda');
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    },
  );
};

/**
 * Crea un nuevo evento en la agenda
 */
export const createEvento = async (data: {
  titulo: string;
  fecha: string;
  hora_desde: string;
  hora_hasta: string;
  categoria: string;
  repetir: string;
  recordatorio: boolean;
  tiempo_recordatorio?: string;
}) => {
  try {
    const response = await api.post('/care/agenda', data);
    console.log('✅ Evento creado correctamente');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creando evento:', error.message);
    throw error;
  }
};

/**
 * Actualiza un evento existente
 */
export const updateEvento = async (eventoId: string, data: Partial<{
  titulo: string;
  fecha: string;
  hora_desde: string;
  hora_hasta: string;
  categoria: string;
  repetir: string;
  recordatorio: boolean;
  tiempo_recordatorio?: string;
}>) => {
  try {
    const response = await api.patch(`/care/agenda/${eventoId}`, data);
    console.log('✅ Evento actualizado correctamente');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error actualizando evento:', error.message);
    throw error;
  }
};

/**
 * Elimina un evento de la agenda
 */
export const deleteEvento = async (eventoId: string) => {
  try {
    await api.delete(`/care/agenda/${eventoId}`);
    console.log('✅ Evento eliminado correctamente');
  } catch (error: any) {
    console.error('❌ Error eliminando evento:', error.message);
    throw error;
  }
};