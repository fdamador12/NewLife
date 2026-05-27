import { useState, useEffect, useCallback } from 'react';
import { agendaService, AgendaEventFrontend } from '../services/agendaService';
import { cancelAgendaReminder } from '../../../services/notificationSync';

export const useAgenda = () => {
  const [eventos, setEventos] = useState<AgendaEventFrontend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgenda = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agendaService.getAgenda();
      setEventos(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error en useAgenda:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAgenda = useCallback(async (event: AgendaEventFrontend) => {
    try {
      const newEvent = await agendaService.createAgenda(event);
      setEventos((prev) => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear evento';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateAgenda = useCallback(async (evento_id: string, event: AgendaEventFrontend) => {
    try {
      // Cancelar notif previa porque puede haber cambiado fecha/hora/titulo.
      // La nueva se agendara desde AddEventScreen tras el update exitoso.
      await cancelAgendaReminder(evento_id);

      const updatedEvent = await agendaService.updateAgenda(evento_id, event);
      setEventos((prev) =>
        prev.map((e) => (e.id === evento_id ? updatedEvent : e))
      );
      return updatedEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar evento';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteAgenda = useCallback(async (evento_id: string) => {
    try {
      // Cancelar la notificacion local antes de borrar del backend.
      // Si esto falla (ej. Expo Go), no rompe el flujo de eliminacion.
      await cancelAgendaReminder(evento_id);

      await agendaService.deleteAgenda(evento_id);
      setEventos((prev) => prev.filter((e) => e.id !== evento_id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar evento';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  return {
    eventos,
    loading,
    error,
    refetch: fetchAgenda,
    createAgenda,
    updateAgenda,
    deleteAgenda,
  };
};