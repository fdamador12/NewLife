import api from './api';

export type ZoneType = 'risk' | 'safe';

export interface Zone {
  _id: string;
  usuario_id: string;
  nombre: string;
  descripcion: string;
  tipo: ZoneType;
  latitud: string;
  longitud: string;
  created_at: string;
}

export const getZones = async (): Promise<Zone[]> => {
  const res = await api.get('/zones');
  return res.data;
};

export const createZone = async (data: {
  nombre: string;
  descripcion?: string;
  tipo: ZoneType;
  latitud: string;
  longitud: string;
}): Promise<{ _id: string }> => {
  const res = await api.post('/zones', data);
  return res.data;
};

export const deleteZone = async (id: string): Promise<void> => {
  await api.delete(`/zones/${id}`);
};