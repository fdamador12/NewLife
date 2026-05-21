import { useState, useCallback } from 'react';
import {
  getGrupos,
  getContactos,
  createContacto,
  updateContacto,
  deleteContacto,
  getContenido,
  getFavoritos,
  addFavorito,
  removeFavorito,
  getCategorias,
  getEventos,
  createEvento,
  updateEvento,
  deleteEvento,
} from '../../../services/careService';
import { Grupo, Contact, Contenido, Categoria, AgendaEvent } from '../types/care';

export const useCare = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [contactos, setContactos] = useState<Contact[]>([]);
  const [contenido, setContenido] = useState<Contenido[]>([]);
  const [favoritos, setFavoritos] = useState<Contenido[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [eventos, setEventos] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ GRUPOS
  const fetchGrupos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGrupos();
      setGrupos(data || []);
    } catch (err: any) {
      setError(err.message || 'Error obteniendo grupos');
      console.error('❌ Error fetchGrupos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ CONTACTOS
  const fetchContactos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContactos();
      console.log('📞 Contactos obtenidos:', data);
      setContactos(data || []);
    } catch (err: any) {
      setError(err.message || 'Error obteniendo contactos');
      console.error('❌ Error fetchContactos:', err);
      setContactos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addContactoHandler = useCallback(
    async (data: { nombre: string; telefono: string; foto_url?: string }) => {
      try {
        setError(null);
        await createContacto(data);
        await fetchContactos();
      } catch (err: any) {
        setError(err.message || 'Error creando contacto');
        console.error('❌ Error addContacto:', err);
        throw err;
      }
    },
    [fetchContactos]
  );

  const updateContactoHandler = useCallback(
    async (contactoId: string, data: { nombre?: string; telefono?: string }) => {
      try {
        setError(null);
        await updateContacto(contactoId, data);
        await fetchContactos();
      } catch (err: any) {
        setError(err.message || 'Error actualizando contacto');
        console.error('❌ Error updateContacto:', err);
        throw err;
      }
    },
    [fetchContactos]
  );

  const deleteContactoHandler = useCallback(
    async (contactoId: string) => {
      try {
        setError(null);
        await deleteContacto(contactoId);
        await fetchContactos();
      } catch (err: any) {
        setError(err.message || 'Error eliminando contacto');
        console.error('❌ Error deleteContacto:', err);
        throw err;
      }
    },
    [fetchContactos]
  );

  // ✅ CONTENIDO
  const fetchContenido = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContenido();
      setContenido(data || []);
    } catch (err: any) {
      setError(err.message || 'Error obteniendo contenido');
      console.error('❌ Error fetchContenido:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FAVORITOS
  const fetchFavoritos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFavoritos();
      setFavoritos(data || []);
    } catch (err: any) {
      setError(err.message || 'Error obteniendo favoritos');
      console.error('❌ Error fetchFavoritos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavoritoHandler = useCallback(
    async (contenidoId: string) => {
      try {
        setError(null);
        const isFavorito = favoritos.some((f) => f._id === contenidoId);

        if (isFavorito) {
          setFavoritos((prev) => prev.filter((f) => f._id !== contenidoId));
          await removeFavorito(contenidoId);
        } else {
          await addFavorito(contenidoId);
          await fetchFavoritos();
        }
      } catch (err: any) {
        setError(err.message || 'Error actualizando favorito');
        console.error('❌ Error toggleFavoritoHandler:', err);
        await fetchFavoritos();
      }
    },
    [favoritos, fetchFavoritos]
  );

  // ✅ CATEGORIAS
  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategorias();
      setCategorias(data || []);
    } catch (err: any) {
      setError(err.message || 'Error obteniendo categorías');
      console.error('❌ Error fetchCategorias:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ EVENTOS
  const fetchEventos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEventos();
      setEventos(data || []);
    } catch (err: any) {
      setError(err.message || 'Error obteniendo eventos');
      console.error('❌ Error fetchEventos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addEventoHandler = useCallback(
    async (data: Partial<AgendaEvent>) => {
      try {
        setError(null);
        await createEvento(data as any);
        await fetchEventos();
      } catch (err: any) {
        setError(err.message || 'Error creando evento');
        console.error('❌ Error addEventoHandler:', err);
      }
    },
    [fetchEventos]
  );

  const updateEventoHandler = useCallback(
    async (eventoId: string, data: Partial<AgendaEvent>) => {
      try {
        setError(null);
        await updateEvento(eventoId, data as any);
        await fetchEventos();
      } catch (err: any) {
        setError(err.message || 'Error actualizando evento');
        console.error('❌ Error updateEventoHandler:', err);
      }
    },
    [fetchEventos]
  );

  const deleteEventoHandler = useCallback(
    async (eventoId: string) => {
      try {
        setError(null);
        await deleteEvento(eventoId);
        await fetchEventos();
      } catch (err: any) {
        setError(err.message || 'Error eliminando evento');
        console.error('❌ Error deleteEventoHandler:', err);
      }
    },
    [fetchEventos]
  );

  return {
    grupos,
    contactos,
    contenido,
    favoritos,
    categorias,
    eventos,
    loading,
    error,
    fetchGrupos,
    fetchContactos,
    fetchContenido,
    fetchFavoritos,
    fetchCategorias,
    fetchEventos,
    toggleFavorito: toggleFavoritoHandler,
    addContacto: addContactoHandler,
    deleteContacto: deleteContactoHandler,
    updateContacto: updateContactoHandler,
    addEvento: addEventoHandler,
    updateEvento: updateEventoHandler,
    deleteEvento: deleteEventoHandler,
  };
};