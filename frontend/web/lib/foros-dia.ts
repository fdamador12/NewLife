import api from './axios';

export interface ForoDiaBackend {
  _id: string;
  pregunta: string;
  descripcion?: string;
  fecha: string;
  creado_por: string;
  created_at: string;
}

export interface CreateForoPayload {
  pregunta: string;
  descripcion?: string;
  fecha: string; // Formato YYYY-MM-DD
}

// Para carga masiva (bulk)
export interface CreateForosBulkPayload {
  foros: CreateForoPayload[];
}

export async function getForos(): Promise<ForoDiaBackend[]> {
  const res = await api.get('/api/web/admin/foros-dia');
  return res.data;
}

export async function createForo(data: CreateForoPayload): Promise<ForoDiaBackend> {
  const res = await api.post('/api/web/admin/foros-dia', data);
  return res.data;
}

export async function createForosBulk(foros: CreateForoPayload[]): Promise<any> {
  const payload: CreateForosBulkPayload = { foros };
  const res = await api.post('/api/web/admin/foros-dia/bulk', payload);
  return res.data;
}

export async function updateForo(id: string, data: Partial<CreateForoPayload>): Promise<ForoDiaBackend> {
  const res = await api.patch(`/api/web/admin/foros-dia/${id}`, data);
  return res.data;
}