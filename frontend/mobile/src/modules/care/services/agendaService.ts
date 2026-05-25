import api from '../../../services/api';

// ===== TIPOS =====

export interface AgendaEventBackend {
  _id: string;
  evento_id: string;
  usuario_id: string;
  titulo: string;
  fecha: string;
  hora_desde: string;
  hora_hasta: string;
  categoria: string;
  repetir: string;
  recordatorio: boolean;
  tiempo_recordatorio: string;
  created_at: string;
  updated_at: string;
}

export interface AgendaEventFrontend {
  id: string;
  title: string;
  date: Date;
  timeFrom: string;
  timeTo: string;
  category: string;
  reminder: boolean;
  reminderMinutes: number;
  repeat: string;
}

export interface AgendaResponse {
  data: AgendaEventBackend[];
}

// ===== MAPEO DE ENUMS =====

const CATEGORY_MAP_TO_BACKEND: Record<string, string> = {
  'Reunion': 'REUNION',
  'Grupo AA': 'GRUPO_AA',
  'Fundación': 'FUNDACION',
  'Lectura': 'LECTURA',
  'Otro': 'OTRO',
};

const CATEGORY_MAP_TO_FRONTEND: Record<string, string> = {
  'REUNION': 'Reunion',
  'GRUPO_AA': 'Grupo AA',
  'FUNDACION': 'Fundación',
  'LECTURA': 'Lectura',
  'OTRO': 'Otro',
};

// NOTA: el frontend ya no expone opciones de repetir al usuario, pero el
// backend sigue esperando este campo. Por eso siempre mandamos 'UNA_VEZ'
// al crear/editar. El mapeo se mantiene para que eventos existentes
// con valores antiguos se lean correctamente (compatibilidad hacia atras).
const REPEAT_MAP_TO_FRONTEND: Record<string, string> = {
  'UNA_VEZ': 'none',
  'DIARIO': 'daily',
  'SEMANAL': 'weekly',
  'MENSUAL': 'monthly',
};

const REMINDER_MAP_TO_BACKEND: Record<number, string> = {
  5: '5_MIN',
  30: '30_MIN',
  60: '60_MIN',
};

const REMINDER_MAP_TO_FRONTEND: Record<string, number> = {
  '5_MIN': 5,
  '30_MIN': 30,
  '60_MIN': 60,
};

// ===== FUNCIONES DE CONVERSIÓN =====

function timeToBackend(time: string): string {
  const [timePart, period] = time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

function timeToFrontend(time: string): string {
  let [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'pm' : 'am';

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  return `${hours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Convierte un Date local a string YYYY-MM-DD sin sufrir desfase de timezone.
 *
 * BUG anterior: usar event.date.toISOString().split('T')[0] convertia a UTC
 * primero, lo que en zonas horarias negativas (como Colombia UTC-5) causaba
 * que un evento del "25 de mayo a las 9pm hora local" se guardara como
 * "26 de mayo" en BD (porque ese momento en UTC ya es del dia siguiente).
 *
 * Fix: extraer ano/mes/dia con getters LOCALES y formar el string a mano.
 */
function dateToLocalISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convierte un string YYYY-MM-DD del backend a un Date LOCAL del frontend
 * sin desfase de timezone.
 *
 * BUG anterior: new Date('2026-05-25') interpreta el string como UTC,
 * lo que en zonas negativas hacia que se mostrara como "24 de mayo" en
 * pantalla.
 *
 * Fix: construir el Date con los componentes locales directamente.
 */
function dateFromBackend(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function eventToBackend(event: AgendaEventFrontend): Omit<AgendaEventBackend, '_id' | 'evento_id' | 'usuario_id' | 'created_at' | 'updated_at'> {
  return {
    titulo: event.title,
    fecha: dateToLocalISOString(event.date),
    hora_desde: timeToBackend(event.timeFrom),
    hora_hasta: timeToBackend(event.timeTo),
    categoria: CATEGORY_MAP_TO_BACKEND[event.category] || event.category,
    // Siempre UNA_VEZ: el frontend ya no expone la opcion de repetir.
    // Si en el futuro se quiere reactivar, agregar el control en EventForm
    // y volver a mapear event.repeat aqui.
    repetir: 'UNA_VEZ',
    recordatorio: event.reminder,
    tiempo_recordatorio: event.reminder ? REMINDER_MAP_TO_BACKEND[event.reminderMinutes] || '30_MIN' : '',
  };
}

function eventToFrontend(event: AgendaEventBackend): AgendaEventFrontend {
  return {
    id: event.evento_id,
    title: event.titulo,
    date: dateFromBackend(event.fecha),
    timeFrom: timeToFrontend(event.hora_desde),
    timeTo: timeToFrontend(event.hora_hasta),
    category: CATEGORY_MAP_TO_FRONTEND[event.categoria] || event.categoria,
    reminder: event.recordatorio,
    reminderMinutes: REMINDER_MAP_TO_FRONTEND[event.tiempo_recordatorio] || 30,
    repeat: REPEAT_MAP_TO_FRONTEND[event.repetir] || 'none',
  };
}

// ===== API SERVICE =====

export const agendaService = {
  async getAgenda(): Promise<AgendaEventFrontend[]> {
    const response = await api.get<AgendaResponse>('/care/agenda');
    return response.data.data.map(eventToFrontend);
  },

  async createAgenda(event: AgendaEventFrontend): Promise<AgendaEventFrontend> {
    try {
      const payload = eventToBackend(event);
      const response = await api.post<AgendaEventBackend>('/care/agenda', payload);
      return eventToFrontend(response.data);
    } catch (error: any) {
      console.log('❌ Error creando evento:', error.message);
      throw error;
    }
  },

  async updateAgenda(evento_id: string, event: AgendaEventFrontend): Promise<AgendaEventFrontend> {
    try {
      const payload = eventToBackend(event);
      const response = await api.patch<AgendaEventBackend>(`/care/agenda/${evento_id}`, payload);
      return eventToFrontend(response.data);
    } catch (error: any) {
      console.log('❌ Error actualizando evento:', error.message);
      throw error;
    }
  },

  async deleteAgenda(evento_id: string): Promise<void> {
    try {
      await api.delete(`/care/agenda/${evento_id}`);
    } catch (error: any) {
      console.log('❌ Error eliminando evento:', error.message);
      throw error;
    }
  },
};