import { useState, useCallback } from 'react';
import api from '../services/api';

export interface NotificationSettings {
  _id: string;
  usuario_id: string;
  push_notifications_enabled: boolean;
  preferred_reminder_hour: number | null;
  preferred_reminder_minute: number | null;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener configuración actual
  const getSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/notifications/settings');
      setSettings(response.data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al obtener configuración';
      setError(message);
      console.error('❌ Error getSettings:', message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar configuración (acepta partial: solo los campos que cambian)
  const updateSettings = useCallback(
    async (updates: Partial<NotificationSettings>) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post('/notifications/settings', updates);
        setSettings(response.data);
        return response.data;
      } catch (err: any) {
        const message = err.response?.data?.message || 'Error al actualizar configuración';
        setError(message);
        console.error('❌ Error updateSettings:', message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Activar/desactivar notificaciones
  const toggleNotifications = useCallback(
    async (enabled: boolean) => {
      return updateSettings({ push_notifications_enabled: enabled });
    },
    [updateSettings],
  );

  // Cambiar hora + minuto preferido en una sola llamada
  const setPreferredTime = useCallback(
    async (hour: number, minute: number) => {
      return updateSettings({
        preferred_reminder_hour: hour,
        preferred_reminder_minute: minute,
      });
    },
    [updateSettings],
  );

  // Guardar push token (para v2 con push remoto)
  const savePushToken = useCallback(
    async (token: string) => {
      return updateSettings({ push_token: token });
    },
    [updateSettings],
  );

  return {
    settings,
    loading,
    error,
    getSettings,
    updateSettings,
    toggleNotifications,
    setPreferredTime,
    savePushToken,
  };
};