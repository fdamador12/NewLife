import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import { EVENT_TYPES, EventType } from './event-types';
import { getSessionId, resetSession } from './session';

/**
 * Service de analytics para NewLife.
 *
 * Filosofía:
 * - **Fire-and-forget por defecto**: ningún caller espera respuesta. La pantalla
 *   sigue su flujo aunque el track tarde o falle.
 * - **Excepción - logout**: cuando el caller necesita garantizar que el track
 *   se envíe antes de seguir (ej: borrar el token al cerrar sesión), puede
 *   awaitarlo explícitamente: `await analytics.track(EVENT_TYPES.USER_LOGGED_OUT)`
 * - **No-blocking**: si el server está caído, la app NO se rompe. Los errores
 *   se loggean pero nunca se lanzan.
 * - **Solo usuarios autenticados**: si no hay JWT, simplemente no se trackea.
 * - **DRY con backend**: los EVENT_TYPES son idénticos a los del backend.
 */

const APP_VERSION = '1.1.0';
const ANALYTICS_ENABLED = true;

interface TrackPayload {
  event_type: string;
  session_id: string;
  app_version: string;
  properties?: Record<string, unknown>;
}

/**
 * Registra un evento de analytics.
 *
 * Por defecto: fire-and-forget. Llama y olvídate.
 *   analytics.track(EVENT_TYPES.SOS_TRIGGERED);
 *
 * Caso especial: si necesitas garantizar que el evento se envíe antes de
 * continuar (ej: antes de hacer logout y borrar el token), puedes awaitarlo:
 *   await analytics.track(EVENT_TYPES.USER_LOGGED_OUT);
 *
 * La Promise se resuelve cuando el request termina (exitoso o con error).
 * Nunca rejecta — los errores son atrapados internamente.
 */
async function track(
  eventType: EventType,
  properties?: Record<string, unknown>,
): Promise<void> {
  if (!ANALYTICS_ENABLED) return;

  try {
    // 1. Solo trackeamos usuarios autenticados
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return;

    // 2. Construir payload
    const payload: TrackPayload = {
      event_type: eventType,
      session_id: getSessionId(),
      app_version: APP_VERSION,
      properties,
    };

    // 3. Mandar al backend. Ahora SÍ esperamos el await internamente,
    //    pero envolvemos en try/catch para no rechazar la Promise externa.
    //    Esto permite que el caller pueda awaitarla sin riesgo de unhandled rejection.
    try {
      await api.post('/events', payload);
    } catch (error: any) {
      if (__DEV__) {
        const status = error?.response?.status;
        const message = error?.response?.data?.message ?? error?.message;
        console.warn(
          `[analytics] track('${eventType}') falló (${status}): ${message}`,
        );
      }
    }
  } catch (err) {
    if (__DEV__) {
      console.warn(`[analytics] error inesperado en track('${eventType}'):`, err);
    }
  }
}

/**
 * Helper específico para trackear vistas de pantalla.
 */
function trackScreen(
  screenName: string,
  previousScreen?: string,
): Promise<void> {
  return track(EVENT_TYPES.SCREEN_VIEWED, {
    screen_name: screenName,
    ...(previousScreen ? { previous_screen: previousScreen } : {}),
  });
}

/**
 * Resetea el session_id. Llamar al hacer logout para que el siguiente
 * usuario tenga una sesión limpia.
 */
function reset(): void {
  resetSession();
}

export const analytics = {
  track,
  trackScreen,
  reset,
};

export { EVENT_TYPES, SOS_OPTIONS, CONTACT_METHODS } from './event-types';
export type { EventType, SosOption, ContactMethod } from './event-types';