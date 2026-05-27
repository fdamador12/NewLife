import Constants from 'expo-constants';
import api from './api';

/**
 * Registra el push token del dispositivo con el backend.
 *
 * Llamar despues de que el usuario este autenticado (ya tiene JWT).
 * Si no hay auth, el backend devuelve 401 y se ignora silenciosamente.
 *
 * Idempotente — el backend deduplica.
 */
export async function registerPushToken(): Promise<string | null> {
  // Skip en Expo Go
  if (Constants.executionEnvironment === 'storeClient') {
    console.log('[Push] Expo Go — skip register');
    return null;
  }

  try {
    const Notifications = await import('expo-notifications');

    // 1. Pedir permisos
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('[Push] Permiso denegado');
      return null;
    }

    // 2. Obtener Expo Push Token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.log('[Push] No projectId en expoConfig.extra.eas');
      return null;
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResponse.data;
    console.log('[Push] Token obtenido:', token.substring(0, 40) + '...');

    // 3. Registrar en backend
    await api.post('/push/register', { token });
    console.log('[Push] Token registrado en backend');

    return token;
  } catch (err: any) {
    // Falla silenciosa — no romper la app si push no funciona
    console.log('[Push] Error:', err?.message ?? err);
    return null;
  }
}