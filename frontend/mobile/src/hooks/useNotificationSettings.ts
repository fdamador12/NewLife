import { useState, useCallback } from 'react';
import api from '../services/api';

interface NotificationSettings {
    _id?: string;
    push_notifications_enabled: boolean;
    preferred_reminder_hour: number | null;
    preferred_reminder_minute: number | null;
    push_token?: string | null;
}

/**
 * Hook para gestionar las preferencias de notificaciones del usuario en ROBLE.
 *
 * Endpoint base: /notifications/settings
 * - GET: obtiene la configuracion actual
 * - POST: crea/actualiza la configuracion
 */
export const useNotificationSettings = () => {
    const [settings, setSettings] = useState<NotificationSettings | null>(null);
    const [loading, setLoading] = useState(false);

    /**
     * Obtiene las preferencias del usuario desde el backend.
     */
    const getSettings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications/settings');
            setSettings(response.data);
            return response.data;
        } catch (error: any) {
            console.log('Error obteniendo settings de notificaciones:', error?.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Actualiza las preferencias en backend con los campos provistos.
     */
    const updateSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
        try {
            const response = await api.post('/notifications/settings', updates);
            setSettings(response.data);
            return response.data;
        } catch (error: any) {
            console.log('Error actualizando settings:', error?.message);
            return null;
        }
    }, []);

    /**
     * Cambia solo el toggle de notificaciones ON/OFF.
     */
    const toggleNotifications = useCallback(async (enabled: boolean) => {
        return updateSettings({ push_notifications_enabled: enabled });
    }, [updateSettings]);

    /**
     * Cambia la hora preferida.
     *
     * @param hour - hora (0-23)
     * @param minute - minuto (0-59)
     * @param alsoEnable - si es true, tambien activa push_notifications_enabled
     *                    (util cuando el usuario activa desde Settings sin hora previa)
     */
    const setPreferredTime = useCallback(async (
        hour: number,
        minute: number,
        alsoEnable: boolean = false,
    ) => {
        const updates: Partial<NotificationSettings> = {
            preferred_reminder_hour: hour,
            preferred_reminder_minute: minute,
        };
        if (alsoEnable) {
            updates.push_notifications_enabled = true;
        }
        return updateSettings(updates);
    }, [updateSettings]);

    return {
        settings,
        loading,
        getSettings,
        updateSettings,
        toggleNotifications,
        setPreferredTime,
    };
};