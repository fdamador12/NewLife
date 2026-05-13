import api from '../../../services/api';
import { cacheService } from '../../../services/cacheService';
import { CACHE_KEYS } from '../../../services/cacheKeys';

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
    return cacheService.withCache(
      CACHE_KEYS.GROUPS,
      15,
      async () => {
        const response = await api.get<GruposResponse>('/care/grupos');
        return response.data.data || [];
      },
    );
  },
};