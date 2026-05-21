import api from './axios';

export interface CreateGrupoPayload {
  nombre: string;
  descripcion: string;
  direccion?: string | null;
  lugar?: string | null;
  email?: string | null;
  sitio_web?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  telefonos?: string[];
  whatsapp?: string[];
  comunidad_url?: string | null;
  logo_url?: string | null;
  estado: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateGrupoPayload extends Partial<CreateGrupoPayload> {}

export async function getGrupos(): Promise<any[]> {
  const res = await api.get('/api/web/admin/grupos-apoyo');
  return res.data;
}

export async function getGrupoById(id: string): Promise<any> {
  const res = await api.get(`/api/web/admin/grupos-apoyo/${id}`);
  return res.data;
}

export async function createGrupo(data: CreateGrupoPayload): Promise<any> {
  const res = await api.post('/api/web/admin/grupos-apoyo', data);
  return res.data;
}

export async function updateGrupo(id: string, data: UpdateGrupoPayload): Promise<any> {
  const res = await api.patch(`/api/web/admin/grupos-apoyo/${id}`, data);
  return res.data;
}

export async function deleteGrupo(id: string): Promise<void> {
  await api.delete(`/api/web/admin/grupos-apoyo/${id}`);
}