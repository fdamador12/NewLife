import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from './api';

/**
 * Servicio centralizado para sincronizar notificaciones locales con la
 * preferencia guardada del usuario en ROBLE.
 *
 * Casos de uso:
 * - Login exitoso → cargar settings y agendar si push_notifications_enabled
 * - Logout → cancelar TODAS las notificaciones del SO
 * - Delete account → cancelar TODAS las notificaciones antes del logout
 *
 * Compatible con Expo Go (lazy imports + verificacion executionEnvironment).
 */

const DAILY_REMINDER_ID = 'newlife-daily-reminder';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

/**
 * Carga expo-notifications de manera LAZY (solo cuando se necesita).
 */
const loadNotifications = async () => {
    if (isExpoGo) {
        return null;
    }
    try {
        return await import('expo-notifications');
    } catch (error) {
        console.error('❌ No se pudo cargar expo-notifications:', error);
        return null;
    }
};

/**
 * Verifica/pide permisos y crea canal Android si hace falta.
 */
const ensurePermissions = async (): Promise<boolean> => {
    const Notifications = await loadNotifications();
    if (!Notifications) return false;

    if (Platform.OS === 'android') {
        try {
            await Notifications.setNotificationChannelAsync('newlife-default', {
                name: 'NewLife - Recordatorios',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#c97b3f',
            });
        } catch {
            // no critical
        }
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
};

/**
 * Llamar despues de un login exitoso.
 * Obtiene las preferencias del usuario y agenda la notificacion diaria si aplica.
 */
export async function syncNotificationsOnLogin(): Promise<void> {
    try {
        const Notifications = await loadNotifications();
        if (!Notifications) {
            console.log('ℹ️ Notificaciones no disponibles en Expo Go (skip sync)');
            return;
        }

        // Obtener settings del backend
        const response = await api.get('/notifications/settings');
        const settings = response.data;

        if (!settings) {
            console.log('ℹ️ Usuario sin configuracion de notificaciones aun');
            return;
        }

        const {
            push_notifications_enabled,
            preferred_reminder_hour,
            preferred_reminder_minute,
        } = settings;

        if (!push_notifications_enabled) {
            // El usuario tiene notificaciones desactivadas → asegurar que no hay
            // ninguna agendada (por si quedo algo de una sesion anterior).
            await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});
            console.log('ℹ️ Usuario tiene notificaciones desactivadas, ninguna agendada');
            return;
        }

        // Validar que tenemos hora y minuto
        if (preferred_reminder_hour === null || preferred_reminder_hour === undefined) {
            console.log('ℹ️ Usuario habilitado pero sin hora preferida, no se agenda nada');
            return;
        }

        const hour = preferred_reminder_hour;
        const minute = preferred_reminder_minute ?? 0;

        // Pedir permisos (no bloqueante: si denega, no agendamos pero no fallamos)
        const hasPermission = await ensurePermissions();
        if (!hasPermission) {
            console.warn('⚠️ Sin permisos de notificacion, no se puede agendar');
            return;
        }

        // Cancelar agendamiento previo (idempotente)
        await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});

        // Agendar nuevo
        await Notifications.scheduleNotificationAsync({
            identifier: DAILY_REMINDER_ID,
            content: {
                title: '🌟 Tu momento NewLife',
                body: 'Abre la app para ver tu frase del dia y registrar tu check-in',
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            },
        });

        console.log(
            `✅ Notificacion diaria sincronizada al iniciar sesion: ${hour}:${minute.toString().padStart(2, '0')}`,
        );
    } catch (error: any) {
        console.log('⚠️ Error en syncNotificationsOnLogin:', error?.message ?? error);
        // Fire-and-forget: no propagar errores para no bloquear login
    }
}

/**
 * Llamar al cerrar sesion o eliminar cuenta.
 * Cancela TODAS las notificaciones locales del usuario actual.
 */
export async function cancelAllLocalNotifications(): Promise<void> {
    try {
        const Notifications = await loadNotifications();
        if (!Notifications) return;

        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('✅ Todas las notificaciones locales canceladas');
    } catch (error: any) {
        console.log('⚠️ Error cancelando notificaciones:', error?.message ?? error);
    }
}