export interface Grupo {
  _id: string;
  nombre: string;
  descripcion: string;
  tipo: 'AA' | 'NA' | 'FUNDACION' | 'OTRO';
  direccion?: string;
  telefono?: string;
  horario?: string;
  imagen_url?: string;
}

export interface Contact {
  _id: string;
  contacto_id: string;  // ← AGREGAR ESTO
  nombre: string;
  telefono: string;
  foto_url?: string;
  usuario_id?: string;
}

export interface Contenido {
  _id: string;
  titulo: string;
  descripcion: string;
  categoria_id: string;
  tipo: 'ARTICULO' | 'VIDEO' | 'PODCAST';
  contenido_url: string;
  imagen_url?: string;
  isFavorito?: boolean;
}

export interface Categoria {
  _id: string;
  nombre: string;
  icono?: string;
}

export interface AgendaEvent {
  _id: string;
  titulo: string;
  fecha: string;
  hora_desde: string;
  hora_hasta: string;
  categoria: 'REUNION' | 'GRUPO_AA' | 'FUNDACION' | 'LECTURA' | 'OTRO';
  repetir: 'UNA_VEZ' | 'DIARIO' | 'SEMANAL' | 'MENSUAL';
  recordatorio: boolean;
  tiempo_recordatorio?: '30_MIN' | '1_HORA' | '1_DIA';
  usuario_id?: string;
}

export interface CareContextType {
  grupos: Grupo[];
  contactos: Contact[];
  contenido: Contenido[];
  favoritos: Contenido[];
  categorias: Categoria[];
  eventos: AgendaEvent[];
  loading: boolean;
  error: string | null;
  fetchGrupos: () => Promise<void>;
  fetchContactos: () => Promise<void>;
  fetchContenido: () => Promise<void>;
  fetchFavoritos: () => Promise<void>;
  fetchCategorias: () => Promise<void>;
  fetchEventos: () => Promise<void>;
  toggleFavorito: (contenidoId: string) => Promise<void>;
  addContacto: (data: Partial<Contact>) => Promise<void>;
  deleteContacto: (contactoId: string) => Promise<void>;
  addEvento: (data: Partial<AgendaEvent>) => Promise<void>;
  updateEvento: (eventoId: string, data: Partial<AgendaEvent>) => Promise<void>;
  deleteEvento: (eventoId: string) => Promise<void>;
}