import api from '../../../services/api';
import { cacheService } from '../../../services/cacheService';
import { CACHE_KEYS } from '../../../services/cacheKeys';

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

const REPEAT_MAP_TO_BACKEND: Record<string, string> = {
  'none': 'UNA_VEZ',
  'daily': 'DIARIO',
  'weekly': 'SEMANAL',
  'monthly': 'MENSUAL',
};

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

function eventToBackend(event: AgendaEventFrontend): Omit<AgendaEventBackend, '_id' | 'evento_id' | 'usuario_id' | 'created_at' | 'updated_at'> {
  return {
    titulo: event.title,
    fecha: event.date.toISOString().split('T')[0],
    hora_desde: timeToBackend(event.timeFrom),
    hora_hasta: timeToBackend(event.timeTo),
    categoria: CATEGORY_MAP_TO_BACKEND[event.category] || event.category,
    repetir: REPEAT_MAP_TO_BACKEND[event.repeat] || event.repeat,
    recordatorio: event.reminder,
    tiempo_recordatorio: event.reminder ? REMINDER_MAP_TO_BACKEND[event.reminderMinutes] || '30_MIN' : '',
  };
}

function eventToFrontend(event: AgendaEventBackend): AgendaEventFrontend {
  return {
    id: event.evento_id,
    title: event.titulo,
    date: new Date(event.fecha),
    timeFrom: timeToFrontend(event.hora_desde),
    timeTo: timeToFrontend(event.hora_hasta),
    category: CATEGORY_MAP_TO_FRONTEND[event.categoria] || event.categoria,
    reminder: event.recordatorio,
    reminderMinutes: REMINDER_MAP_TO_FRONTEND[event.tiempo_recordatorio] || 30,
    repeat: REPEAT_MAP_TO_FRONTEND[event.repetir] || event.repetir,
  };
}

// ===== API SERVICE =====

export const agendaService = {
  async getAgenda(): Promise<AgendaEventFrontend[]> {
    return cacheService.withCache(
      CACHE_KEYS.AGENDA_EVENTS,
      5,
      async () => {
        const response = await api.get<AgendaResponse>('/care/agenda');
        return response.data.data.map(eventToFrontend);
      },
    );
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