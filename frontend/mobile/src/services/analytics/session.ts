/**
 * Manejo del session_id y otros estados efimeros de analytics.
 *
 * Filosofia:
 * - Una "sesion" es un periodo continuo de uso de la app por el mismo
 *   usuario, sin desconectarse ni dejar la app cerrada por mas de 30min.
 * - El session_id es un UUID que se genera la primera vez que se llama
 *   getSessionId() y se mantiene en memoria hasta que:
 *     1. El usuario hace logout (reset manual)
 *     2. Pasan mas de 30min desde la ultima actividad (timeout)
 * - Esto permite agrupar eventos por sesion al consultarlos.
 */

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

let currentSessionId: string | null = null;
let lastActivityTimestamp: number = 0;

/**
 * Genera un UUID v4 sin dependencias externas.
 */
function generateUUID(): string {
  return 'sess_' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Devuelve el session_id actual. Si no existe o ha expirado, genera uno nuevo.
 */
export function getSessionId(): string {
  const now = Date.now();

  // Si paso mucho tiempo desde la ultima actividad, expira la sesion
  if (currentSessionId && now - lastActivityTimestamp > SESSION_TIMEOUT_MS) {
    currentSessionId = null;
  }

  if (!currentSessionId) {
    currentSessionId = generateUUID();
  }

  lastActivityTimestamp = now;
  return currentSessionId;
}

/**
 * Resetea la sesion. Se llama al hacer logout para garantizar que el
 * proximo usuario tenga una sesion limpia (y por ende un user_id_hash
 * que no se mezcle con eventos del usuario anterior).
 */
export function resetSession(): void {
  currentSessionId = null;
  lastActivityTimestamp = 0;
}