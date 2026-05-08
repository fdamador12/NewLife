import api from '../../../services/api';

export interface Grupo {
  grupo_id: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  lugar: string;
  email?: string;
  sitio_web?: string;
  instagram?: string;
  facebook?: string;
  telefonos?: string[];
  whatsapp?: string[];
  comunidad_url?: string;
  logo_url?: string;
}

export interface GruposResponse {
  data: Grupo[];
}

export const gruposService = {
  async getGrupos(): Promise<Grupo[]> {
    try {
      const response = await api.get<GruposResponse>('/care/grupos');
      return response.data.data || [];
    } catch (error: any) {
      console.log('❌ Error obteniendo grupos:', error.message);
      throw error;
    }
  },
};