import api from '../../../services/api';
import { cacheService } from '../../../services/cacheService';
import { CACHE_KEYS } from '../../../services/cacheKeys';

export interface ContenidoBackend {
  _id: string;
  contenido_id: string;
  titulo: string;
  tipo: 'ARTICULO' | 'VIDEO';
  duracion_minutos: number | null;
  texto_contenido: string;
  categoria_id: string | null;
  autor_nombre: string;
  autor_profesion: string;
  autor_foto: string;
  hashtags: string[];
  estado: string;
  created_at: string;
  updated_at: string;
  imagen_portada: string;
  video_url: string | null;
  is_favorite: boolean;
  cantidad_vistas: number;
}

export interface ContenidoFrontend {
  id: string;
  title: string;
  type: 'article' | 'video';
  category: string;
  duration: string;
  image: string;
  liked: boolean;
  tags: string[];
  author?: string;
  authorRole?: string;
  body?: string;
  videoUrl?: string;
  autorFoto?: string;
  createdAt: string;
  vistas: number;
}

export interface CategoriaBackend {
  _id: string;
  categoria_id: string | null;
  nombre: string;
  descripcion: string;
  created_at: string;
  cantidad_contenidos: number;
}

interface ContenidoResponse {
  data: ContenidoBackend[];
}

interface CategoriasResponse {
  data: CategoriaBackend[];
}

interface ContenidoPorCategoriaResponse {
  categoria: CategoriaBackend;
  contenido: ContenidoBackend[];
}

// Función para convertir tipo backend a frontend
function convertType(tipo: string): 'article' | 'video' {
  return tipo === 'VIDEO' ? 'video' : 'article';
}

// Función para convertir duración a string legible
function formatDuration(tipo: string, duracion: number | null): string {
  if (tipo === 'VIDEO') {
    return duracion ? `${duracion} min de duración` : 'Video';
  }
  return duracion ? `${duracion} min de lectura` : 'Artículo';
}

// Función para mapear categoría - ahora solo usa el nombre que viene del backend
function mapCategory(categoria: CategoriaBackend | null): string {
  if (!categoria) return 'Otros';
  return categoria.nombre || 'Otros';
}

// Convertir de backend a frontend
function convertToFrontend(item: ContenidoBackend, categoria?: CategoriaBackend | null): ContenidoFrontend {
  return {
    id: item.contenido_id,
    title: item.titulo,
    type: convertType(item.tipo),
    category: categoria ? mapCategory(categoria) : 'Otros',
    duration: formatDuration(item.tipo, item.duracion_minutos),
    image: item.imagen_portada || '',
    liked: item.is_favorite,
    tags: Array.isArray(item.hashtags) ? item.hashtags : [],
    author: item.autor_nombre,
    authorRole: item.autor_profesion,
    body: item.texto_contenido,
    videoUrl: item.video_url || undefined,
    autorFoto: item.autor_foto,
    createdAt: item.created_at,
    vistas: item.cantidad_vistas || 0,
  };
}

export const contentService = {
  async getContenido(): Promise<ContenidoFrontend[]> {
    return cacheService.withCache(
      CACHE_KEYS.CONTENTS,
      30,
      async () => {
        const response = await api.get<ContenidoResponse>('/care/contenido');

        if (response.data?.data && Array.isArray(response.data.data)) {
          const categorias = await contentService.getCategorias();
          const categoriaMap = new Map(categorias.map((c) => [c.categoria_id, c]));

          const converted = response.data.data.map((item) => {
            const categoria = item.categoria_id ? categoriaMap.get(item.categoria_id) : null;
            return convertToFrontend(item, categoria);
          });

          return converted.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        }

        return [];
      },
    );
  },

  async getCategorias(): Promise<CategoriaBackend[]> {
    try {
      const response = await api.get<CategoriasResponse>('/care/categorias');

      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('❌ Error obteniendo categorías:', error.message);
      throw error;
    }
  },

  async getContenidoPorCategoria(
    categoriaId: string | null,
    limit?: number
  ): Promise<{ categoria: CategoriaBackend; contenido: ContenidoFrontend[] }> {
    try {
      const url = categoriaId
        ? `/care/categorias/${categoriaId}/contenido${limit ? `?limit=${limit}` : ''}`
        : `/care/categorias/otros/contenido${limit ? `?limit=${limit}` : ''}`;

      const response = await api.get<ContenidoPorCategoriaResponse>(url);

      if (response.data?.contenido && Array.isArray(response.data.contenido)) {
        const converted = response.data.contenido.map((item) =>
          convertToFrontend(item, response.data.categoria)
        );

        return {
          categoria: response.data.categoria,
          contenido: converted.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
        };
      }

      return { categoria: response.data?.categoria, contenido: [] };
    } catch (error: any) {
      console.error('❌ Error obteniendo contenido por categoría:', error.message);
      throw error;
    }
  },

  async getFavoritos(): Promise<ContenidoFrontend[]> {
    try {
      const response = await api.get<ContenidoResponse>('/care/contenido/favoritos');

      if (response.data?.data && Array.isArray(response.data.data)) {
        const converted = response.data.data.map((item) => convertToFrontend(item, null));
        return converted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      return [];
    } catch (error: any) {
      console.error('❌ Error obteniendo favoritos:', error.message);
      throw error;
    }
  },

  async addFavorito(contenidoId: string): Promise<void> {
    try {
      await api.post(`/care/contenido/${contenidoId}/favorito`);
      console.log('✅ Agregado a favoritos');
    } catch (error: any) {
      console.error('❌ Error agregando favorito:', error.message);
      throw error;
    }
  },

  async removeFavorito(contenidoId: string): Promise<void> {
    try {
      await api.delete(`/care/contenido/${contenidoId}/favorito`);
      console.log('✅ Eliminado de favoritos');
    } catch (error: any) {
      console.error('❌ Error eliminando favorito:', error.message);
      throw error;
    }
  },
};