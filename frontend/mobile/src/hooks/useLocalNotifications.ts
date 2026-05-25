import { useCallback } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * ID estable del recordatorio diario.
 * Lo usamos para cancelar/reagendar sin duplicar notificaciones.
 */
const DAILY_REMINDER_ID = 'newlife-daily-reminder';

/**
 * Detecta si la app esta corriendo en Expo Go (donde expo-notifications
 * NO funciona desde SDK 53+).
 *
 * - executionEnvironment === 'storeClient' significa Expo Go
 * - 'standalone' o 'bare' significa Development/Production Build (donde SI funciona)
 */
const isExpoGo = Constants.executionEnvironment === 'storeClient';

/**
 * Carga expo-notifications de manera LAZY (solo cuando se necesita).
 * Esto evita que Expo Go crashee al iniciar la app, mostrando el mensaje
 * "Use a development build" solo cuando el usuario intenta usar notificaciones.
 */
const loadNotifications = async () => {
  if (isExpoGo) {
    console.warn(
      '⚠️ expo-notifications no funciona en Expo Go (SDK 53+). ' +
      'Usa un Development Build para probar notificaciones reales.',
    );
    return null;
  }
  try {
    return await import('expo-notifications');
  } catch (error) {
    console.error('❌ No se pudo cargar expo-notifications:', error);
    return null;
  }
};

const loadDevice = async () => {
  try {
    return await import('expo-device');
  } catch {
    return null;
  }
};

/**
 * Hook para manejar notificaciones LOCALES (no remotas).
 * - No requiere backend ni Firebase.
 * - El propio dispositivo agenda y dispara las notificaciones via AlarmManager.
 * - Funciona offline.
 * - En Expo Go: los metodos no fallan, solo loggean un warning.
 * - En Development Build / APK: funciona completamente.
 */
export const useLocalNotifications = () => {
  /**
   * Pide permisos al usuario para enviar notificaciones.
   * Retorna true si fueron concedidos.
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const Notifications = await loadNotifications();
      if (!Notifications) return false; // Expo Go o sin libreria

      const Device = await loadDevice();
      if (Device && !Device.isDevice) {
        console.warn('⚠️ Notificaciones solo en dispositivos fisicos');
        return false;
      }

      // En Android 8+ hay que crear un canal antes de pedir permisos
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('newlife-default', {
          name: 'NewLife - Recordatorios',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#c97b3f',
        });
      }

      const { status: existing } = await Notifications.getPermissionsAsync();
      if (existing === 'granted') return true;

      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ Error pidiendo permisos:', error);
      return false;
    }
  }, []);

  /**
   * Agenda un recordatorio DIARIO a la hora indicada.
   * Si ya existia uno con el mismo ID, lo reemplaza (no duplica).
   */
  const scheduleDailyReminder = useCallback(
    async (hour: number, minute: number): Promise<boolean> => {
      try {
        const Notifications = await loadNotifications();
        if (!Notifications) {
          console.log(`ℹ️ Recordatorio guardado (se activara en Dev Build): ${hour}:${minute}`);
          return false;
        }

        const hasPermission = await requestPermissions();
        if (!hasPermission) {
          console.warn('⚠️ Sin permisos, no se agenda nada');
          return false;
        }

        // Cancelar el anterior si existe (idempotente)
        await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});

        // Agendar nuevo (DailyTriggerInput)
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

        console.log(`✅ Recordatorio diario agendado: ${hour}:${minute.toString().padStart(2, '0')}`);
        return true;
      } catch (error) {
        console.error('❌ Error agendando recordatorio:', error);
        return false;
      }
    },
    [requestPermissions],
  );

  /**
   * Cancela el recordatorio diario.
   */
  const cancelDailyReminder = useCallback(async (): Promise<void> => {
    try {
      const Notifications = await loadNotifications();
      if (!Notifications) return;

      await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
      console.log('✅ Recordatorio diario cancelado');
    } catch (error) {
      console.log('ℹ️ No habia recordatorio diario para cancelar');
    }
  }, []);

  /**
   * Agenda una notificacion para una FECHA Y HORA especifica (para agenda).
   */
  const scheduleEventReminder = useCallback(
    async (title: string, body: string, date: Date): Promise<string | null> => {
      try {
        const Notifications = await loadNotifications();
        if (!Notifications) return null;

        const hasPermission = await requestPermissions();
        if (!hasPermission) return null;

        if (date.getTime() <= Date.now()) {
          console.warn('⚠️ No se puede agendar en el pasado');
          return null;
        }

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date,
          },
        });

        console.log(`✅ Recordatorio de evento agendado para ${date.toISOString()}`);
        return id;
      } catch (error) {
        console.error('❌ Error agendando evento:', error);
        return null;
      }
    },
    [requestPermissions],
  );

  /**
   * Cancela una notificacion especifica por su identifier.
   */
  const cancelNotification = useCallback(async (identifier: string): Promise<void> => {
    try {
      const Notifications = await loadNotifications();
      if (!Notifications) return;

      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.log(`ℹ️ No se pudo cancelar notificacion ${identifier}`);
    }
  }, []);

  /**
   * Notificacion inmediata de prueba (boton "Probar" en Settings).
   */
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    try {
      const Notifications = await loadNotifications();
      if (!Notifications) return false;

      const hasPermission = await requestPermissions();
      if (!hasPermission) return false;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Notificacion de prueba',
          body: 'Si ves esto, las notificaciones funcionan correctamente',
          sound: true,
        },
        trigger: null, // inmediato
      });

      return true;
    } catch (error) {
      console.error('❌ Error enviando prueba:', error);
      return false;
    }
  }, [requestPermissions]);

  return {
    isExpoGo, // por si quieres mostrar un banner "limitado en Expo Go"
    requestPermissions,
    scheduleDailyReminder,
    cancelDailyReminder,
    scheduleEventReminder,
    cancelNotification,
    sendTestNotification,
  };
};