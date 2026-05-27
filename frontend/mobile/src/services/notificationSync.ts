import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from './api';

/**
 * Servicio centralizado para sincronizar notificaciones locales con la
 * preferencia guardada del usuario en ROBLE.
 *
 * Casos de uso:
 * - Login exitoso -> cargar settings y agendar si push_notifications_enabled
 * - Logout -> cancelar TODAS las notificaciones del SO
 * - Delete account -> cancelar TODAS antes del logout
 * - Cambio de hora en Settings -> re-agendar con la nueva hora
 *
 * Compatible con Expo Go (lazy imports + verificacion executionEnvironment).
 */

const DAILY_REMINDER_ID = 'newlife-daily-reminder';
const NOTIFICATION_TITLE = '¡Tu momento NewLife llegó!';
const NOTIFICATION_BODY = 'Cada día es una nueva victoria. Abre la app y registra tu check-in diario.';

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
        console.error('No se pudo cargar expo-notifications:', error);
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
 * Llamar despues de un login exitoso o al abrir la app.
 * Obtiene las preferencias del usuario y agenda la notificacion diaria si aplica.
 */
export async function syncNotificationsOnLogin(): Promise<void> {
    try {
        const Notifications = await loadNotifications();
        if (!Notifications) {
            console.log('Notificaciones no disponibles en Expo Go (skip sync)');
            return;
        }

        const response = await api.get('/notifications/settings');
        const settings = response.data;

        if (!settings) {
            console.log('Usuario sin configuracion de notificaciones aun');
            return;
        }

        const {
            push_notifications_enabled,
            preferred_reminder_hour,
            preferred_reminder_minute,
        } = settings;

        if (!push_notifications_enabled) {
            await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});
            console.log('Usuario tiene notificaciones desactivadas, ninguna agendada');
            return;
        }

        if (preferred_reminder_hour === null || preferred_reminder_hour === undefined) {
            console.log('Usuario habilitado pero sin hora preferida, no se agenda nada');
            return;
        }

        const hour = preferred_reminder_hour;
        const minute = preferred_reminder_minute ?? 0;

        const hasPermission = await ensurePermissions();
        if (!hasPermission) {
            console.warn('Sin permisos de notificacion, no se puede agendar');
            return;
        }

        await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});

        await Notifications.scheduleNotificationAsync({
            identifier: DAILY_REMINDER_ID,
            content: {
                title: NOTIFICATION_TITLE,
                body: NOTIFICATION_BODY,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            },
        });

        console.log(
            `Notificacion diaria agendada: ${hour}:${minute.toString().padStart(2, '0')}`,
        );
    } catch (error: any) {
        console.log('Error en syncNotificationsOnLogin:', error?.message ?? error);
    }
}

/**
 * Re-agenda el recordatorio diario.
 * Usar despues de que el usuario cambie la hora en Settings.
 */
export async function rescheduleDailyReminder(
    hour: number,
    minute: number,
): Promise<boolean> {
    try {
        const Notifications = await loadNotifications();
        if (!Notifications) return false;

        const hasPermission = await ensurePermissions();
        if (!hasPermission) return false;

        await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});

        await Notifications.scheduleNotificationAsync({
            identifier: DAILY_REMINDER_ID,
            content: {
                title: NOTIFICATION_TITLE,
                body: NOTIFICATION_BODY,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            },
        });

        console.log(`Notificacion re-agendada: ${hour}:${minute.toString().padStart(2, '0')}`);
        return true;
    } catch (error: any) {
        console.log('Error en rescheduleDailyReminder:', error?.message ?? error);
        return false;
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
        console.log('Todas las notificaciones locales canceladas');
    } catch (error: any) {
        console.log('Error cancelando notificaciones:', error?.message ?? error);
    }
}

// ─── NOTIFICACIONES DE AGENDA ────────────────────────────────────────────────

/**
 * Agenda una notificacion para un evento de agenda.
 * Se dispara X minutos ANTES de la hora del evento.
 *
 * @param eventoId - ID del evento (se usa como identifier para poder cancelar despues)
 * @param title - titulo del evento (ej: "Cita con psicologo")
 * @param eventDate - fecha y hora del evento
 * @param minutesBefore - cuantos minutos antes (default 30)
 * @returns identifier de la notificacion o null si fallo/no se agendo
 */
export async function scheduleAgendaReminder(
    eventoId: string,
    title: string,
    eventDate: Date,
    minutesBefore: number = 30,
): Promise<string | null> {
    try {
        const Notifications = await loadNotifications();
        if (!Notifications) {
            console.log('Notificaciones no disponibles (Expo Go o sin libreria)');
            return null;
        }

        const hasPermission = await ensurePermissions();
        if (!hasPermission) return null;

        // Calcular cuando disparar: eventDate - minutesBefore minutos
        const triggerDate = new Date(eventDate.getTime() - minutesBefore * 60 * 1000);

        // Validar que la fecha de trigger es futura
        if (triggerDate.getTime() <= Date.now()) {
            console.warn(`No se puede agendar recordatorio en el pasado para evento ${eventoId}`);
            return null;
        }

        // Usar el evento_id como identifier para poder cancelarlo despues
        const identifier = `agenda-${eventoId}`;

        // Cancelar previo si existia (idempotente)
        await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

        await Notifications.scheduleNotificationAsync({
            identifier,
            content: {
                title: `Recordatorio: ${title}`,
                body: `Tu evento es en ${minutesBefore} minutos. Prepárate.`,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            },
        });

        console.log(`Recordatorio agendado para evento ${eventoId} a las ${triggerDate.toISOString()}`);
        return identifier;
    } catch (error: any) {
        console.log('Error en scheduleAgendaReminder:', error?.message ?? error);
        return null;
    }
}

/**
 * Cancela el recordatorio de un evento de agenda especifico.
 *
 * @param eventoId - ID del evento
 */
export async function cancelAgendaReminder(eventoId: string): Promise<void> {
    try {
        const Notifications = await loadNotifications();
        if (!Notifications) return;

        const identifier = `agenda-${eventoId}`;
        await Notifications.cancelScheduledNotificationAsync(identifier);
        console.log(`Recordatorio de evento ${eventoId} cancelado`);
    } catch (error: any) {
        console.log(`No se pudo cancelar recordatorio del evento ${eventoId}:`, error?.message ?? error);
    }
}