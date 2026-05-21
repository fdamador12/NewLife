import api from './axios';

// --- TIPOS PARA CATEGORÍAS ---
export interface CreateCategoriaPayload {
  nombre: string;
  descripcion?: string | null;
}

export interface UpdateCategoriaPayload extends Partial<CreateCategoriaPayload> {}

// --- TIPOS PARA CONTENIDO EDUCATIVO ---
export interface CreateContenidoPayload {
  titulo: string;
  tipo: 'ARTICULO' | 'VIDEO';
  duracion_minutos: number;
  imagen_portada?: string | null;  // <-- Ahora es opcional/nullable
  texto_contenido: string;
  video_url?: string | null;
  categoria_id?: string | null;
  autor_nombre?: string | null;    // <-- Ahora es opcional/nullable
  autor_profesion?: string | null;
  autor_foto?: string | null;
  hashtags?: string[];
  estado: 'PUBLISHED' | 'DRAFT';
}

export interface UpdateContenidoPayload extends Partial<CreateContenidoPayload> {}

// --- PETICIONES: CATEGORÍAS ---
export async function getCategorias(): Promise<any[]> {
  const res = await api.get('/api/web/admin/categorias');
  return res.data;
}

export async function createCategoria(data: CreateCategoriaPayload): Promise<any> {
  const res = await api.post('/api/web/admin/categorias', data);
  return res.data;
}

export async function updateCategoria(id: string, data: UpdateCategoriaPayload): Promise<any> {
  const res = await api.patch(`/api/web/admin/categorias/${id}`, data);
  return res.data;
}

export async function deleteCategoria(id: string): Promise<void> {
  await api.delete(`/api/web/admin/categorias/${id}`);
}

// --- PETICIONES: CONTENIDO ---
export async function getContenidos(): Promise<any[]> {
  const res = await api.get('/api/web/admin/contenido');
  return res.data;
}

export async function createContenido(data: CreateContenidoPayload): Promise<any> {
  const res = await api.post('/api/web/admin/contenido', data);
  return res.data;
}

export async function updateContenido(id: string, data: UpdateContenidoPayload): Promise<any> {
  const res = await api.patch(`/api/web/admin/contenido/${id}`, data);
  return res.data;
}

export async function deleteContenido(id: string): Promise<void> {
  await api.delete(`/api/web/admin/contenido/${id}`);
}