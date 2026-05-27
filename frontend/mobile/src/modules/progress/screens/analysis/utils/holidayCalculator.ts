import { CalendarEvent, EVENTS_DATA } from '../data/colombianEvents';

export interface CalendarEventWithDate {
  date: string; // YYYY-MM-DD
  event: CalendarEvent;
}

// ✅ Convierte Date a string local sin timezone
function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ✅ Algoritmo de Butcher para calcular Pascua
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// ✅ Traslada festivo al lunes siguiente si no cae en lunes
function transferToNextMonday(month: number, day: number, year: number): Date {
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  if (dayOfWeek !== 1) {
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    date.setDate(date.getDate() + daysUntilMonday);
  }
  return date;
}

// ✅ Agrega días a una fecha
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ✅ Obtiene el N-ésimo día de la semana de un mes
// weekday: 0=Dom, 1=Lun, ..., 6=Sab
// nth: 1=primero, 2=segundo, etc.
function getNthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
  const first = new Date(year, month - 1, 1);
  const firstWeekday = first.getDay();
  let diff = weekday - firstWeekday;
  if (diff < 0) diff += 7;
  const day = 1 + diff + (nth - 1) * 7;
  return new Date(year, month - 1, day);
}

// ✅ Calcula TODOS los eventos del año
export function calculateEventsForYear(year: number): Record<string, CalendarEvent[]> {
  const events: Record<string, CalendarEvent[]> = {};

  const addEvent = (date: Date, eventId: string) => {
    const key = toLocalDateString(date);
    const event = EVENTS_DATA[eventId];
    if (!event) return;
    if (!events[key]) events[key] = [];
    events[key].push(event);
  };

  const easter = getEasterDate(year);

  // ── CARNAVAL DE BARRANQUILLA ─────────────────────────────────────────────
  // Ash Wednesday = Easter - 46 days
  const ashWednesday = addDays(easter, -46);
  // Guacherna = Friday before Carnival Saturday = ashWednesday - 11 days
  const guacherna = addDays(ashWednesday, -11);
  // Batalla de Flores = Saturday = ashWednesday - 10 days  
  const batallaDFlores = addDays(ashWednesday, -10);
  // Gran Parada 1 = Sunday
  const granParada1 = addDays(ashWednesday, -9);
  // Gran Parada 2 = Monday
  const granParada2 = addDays(ashWednesday, -8);
  // Joselito = Tuesday
  const joselito = addDays(ashWednesday, -7);

  addEvent(guacherna, 'carnaval_guacherna');
  addEvent(batallaDFlores, 'carnaval_batalla_flores');
  addEvent(granParada1, 'carnaval_gran_parada_1');
  addEvent(granParada2, 'carnaval_gran_parada_2');
  addEvent(joselito, 'carnaval_joselito');
  addEvent(ashWednesday, 'carnaval_miercoles_ceniza');

  // ── SEMANA SANTA ─────────────────────────────────────────────────────────
  addEvent(addDays(easter, -3), 'semana_santa_jueves'); // Jueves Santo
  addEvent(addDays(easter, -2), 'semana_santa_viernes'); // Viernes Santo
  addEvent(easter, 'semana_santa_domingo'); // Domingo de Pascua

  // ── FESTIVOS RELIGIOSOS MÓVILES (trasladados a lunes) ────────────────────
  addEvent(transferToNextMonday(0, 0, year), 'ascension'); // 40 días después de Pascua → lunes
  const ascension = addDays(easter, 39);
  addEvent(transferToNextMonday(ascension.getMonth() + 1, ascension.getDate(), year), 'ascension');

  const corpusChristi = addDays(easter, 60);
  addEvent(transferToNextMonday(corpusChristi.getMonth() + 1, corpusChristi.getDate(), year), 'corpus_christi');

  const sagradoCorazon = addDays(easter, 68);
  addEvent(transferToNextMonday(sagradoCorazon.getMonth() + 1, sagradoCorazon.getDate(), year), 'sagrado_corazon');

  // ── FESTIVOS NACIONALES FIJOS ─────────────────────────────────────────────
  addEvent(new Date(year, 0, 1), 'anio_nuevo');           // 1 ene
  addEvent(transferToNextMonday(1, 6, year), 'reyes_magos'); // 6 ene trasladado
  addEvent(transferToNextMonday(3, 19, year), 'dia_san_jose'); // 19 mar trasladado
  addEvent(new Date(year, 4, 1), 'dia_trabajo');          // 1 may
  addEvent(transferToNextMonday(6, 29, year), 'san_pedro_pablo'); // 29 jun trasladado
  addEvent(new Date(year, 6, 20), 'independencia_colombia'); // 20 jul
  addEvent(new Date(year, 7, 7), 'batalla_boyaca');       // 7 ago
  addEvent(transferToNextMonday(8, 15, year), 'asuncion_virgen'); // 15 ago trasladado
  addEvent(transferToNextMonday(10, 12, year), 'dia_raza'); // 12 oct trasladado
  addEvent(transferToNextMonday(11, 1, year), 'todos_santos'); // 1 nov trasladado
  addEvent(transferToNextMonday(11, 11, year), 'independencia_cartagena'); // 11 nov trasladado
  addEvent(new Date(year, 11, 7), 'noche_velitas');       // 7 dic
  addEvent(new Date(year, 11, 8), 'inmaculada_concepcion'); // 8 dic
  addEvent(new Date(year, 11, 25), 'navidad');            // 25 dic

  // ── FECHAS CULTURALES NACIONALES ─────────────────────────────────────────
  addEvent(new Date(year, 9, 31), 'halloween');           // 31 oct
  addEvent(new Date(year, 11, 31), 'anio_viejo');         // 31 dic
  addEvent(getNthWeekdayOfMonth(year, 9, 6, 3), 'amor_amistad'); // 3er sáb sep
  addEvent(getNthWeekdayOfMonth(year, 5, 0, 2), 'dia_madre');    // 2do dom may
  addEvent(getNthWeekdayOfMonth(year, 6, 0, 3), 'dia_padre');    // 3er dom jun

  // ── BARRANQUILLA ESPECÍFICO ───────────────────────────────────────────────
  addEvent(new Date(year, 3, 7), 'fundacion_barranquilla'); // 7 abr

  // ── LIMPIAR DUPLICADOS (ascensión se agregó dos veces por error) ──────────
  Object.keys(events).forEach(key => {
    const seen = new Set<string>();
    events[key] = events[key].filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  });

  return events;
}