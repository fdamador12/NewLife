import Constants from 'expo-constants';
import { Platform } from 'react-native';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

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

/**
 * Servicio de notificaciones compatible con Expo Go (lazy imports).
 * Mantenido por compatibilidad. La nueva implementacion principal
 * vive en hooks/useLocalNotifications.ts.
 */
export const expoNotifications = {
    async requestPermissions(): Promise<boolean> {
        try {
            const Notifications = await loadNotifications();
            if (!Notifications) return false;

            const Device = await import('expo-device').catch(() => null);
            if (Device && !Device.isDevice) {
                console.warn('⚠️ Solo funciona en dispositivos fisicos');
                return false;
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                if (status !== 'granted') {
                    console.warn('⚠️ Permisos de notificacion denegados');
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('❌ Error solicitando permisos:', error);
            return false;
        }
    },

    async getExpoPushToken(): Promise<string | null> {
        try {
            const Notifications = await loadNotifications();
            if (!Notifications) return null;

            const Device = await import('expo-device').catch(() => null);
            if (Device && !Device.isDevice) {
                console.warn('⚠️ Solo funciona en dispositivos fisicos');
                return null;
            }

            const projectId = Constants.easConfig?.projectId;
            if (!projectId) {
                console.error('❌ No se encontro projectId en app.json');
                return null;
            }

            const token = await Notifications.getExpoPushTokenAsync({ projectId });
            return token.data;
        } catch (error) {
            console.error('❌ Error obteniendo Expo Push Token:', error);
            return null;
        }
    },

    async sendLocalNotification(title: string, body: string, data?: any) {
        try {
            const Notifications = await loadNotifications();
            if (!Notifications) return;

            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: data || {},
                },
                trigger: null,
            });
        } catch (error) {
            console.error('❌ Error enviando notificacion local:', error);
        }
    },

    async onNotificationReceived(
        callback: (notification: any) => void,
    ): Promise<(() => void) | null> {
        const Notifications = await loadNotifications();
        if (!Notifications) return null;

        const subscription = Notifications.addNotificationReceivedListener(callback);
        return () => subscription.remove();
    },

    async onNotificationOpened(
        callback: (response: any) => void,
    ): Promise<(() => void) | null> {
        const Notifications = await loadNotifications();
        if (!Notifications) return null;

        const subscription = Notifications.addNotificationResponseReceivedListener(callback);
        return () => subscription.remove();
    },
};