/**
 * Helper compartido para resolver rangos de fecha en use cases de analytics.
 *
 * Si el usuario no envia `from`, default es hace 30 dias.
 * Si no envia `to`, default es ahora.
 *
 * Devuelve timestamps en milisegundos para comparaciones rapidas.
 */
export interface ResolvedDateRange {
  fromMs: number;
  toMs: number;
  fromIso: string;
  toIso: string;
}

export function resolveDateRange(from?: string, to?: string): ResolvedDateRange {
  const now = Date.now();
  const thirtyDaysAgoMs = now - 30 * 24 * 60 * 60 * 1000;

  const fromMs = from ? new Date(from).getTime() : thirtyDaysAgoMs;
  const toMs = to ? new Date(to).getTime() : now;

  return {
    fromMs,
    toMs,
    fromIso: new Date(fromMs).toISOString(),
    toIso: new Date(toMs).toISOString(),
  };
}

/**
 * Genera un array de strings "YYYY-MM-DD" entre dos fechas (inclusivo).
 * Util para rellenar dias sin eventos con 0 en daily-events.
 */
export function generateDateRange(fromMs: number, toMs: number): string[] {
  const days: string[] = [];
  const fromDate = new Date(fromMs);
  fromDate.setHours(0, 0, 0, 0);
  const toDate = new Date(toMs);
  toDate.setHours(0, 0, 0, 0);

  const current = new Date(fromDate);
  while (current.getTime() <= toDate.getTime()) {
    days.push(formatDateYMD(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

/**
 * Formatea una fecha como "YYYY-MM-DD" (sin hora, sin timezone).
 */
export function formatDateYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}