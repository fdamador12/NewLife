import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetContenidoPorCategoriaUseCase {
  constructor(private readonly db: DatabaseService, private readonly systemAuth: SystemAuthService) {}

  async execute(usuarioId: string, categoriaId: string | null, userToken: string, limit?: number) {
    const masterToken = await this.systemAuth.getMasterToken();

    // 1. Obtener la categoría
    let categoria: any = null;
    if (categoriaId && categoriaId !== 'null') {
      const result = await this.db.find('categorias_contenido', { categoria_id: categoriaId }, masterToken);
      const categorias = Array.isArray(result) ? result : (result?.rows ?? []);
      
      if (categorias.length === 0) {
        throw new NotFoundException('Categoría no encontrada');
      }
      categoria = categorias[0];
    } else {
      // "Otros" - sin categoría
      categoria = {
        categoria_id: null,
        nombre: 'Otros',
        descripcion: 'Contenido sin categoría específica',
        created_at: new Date().toISOString(),
      };
    }

    // 2. Obtener contenido de esa categoría
    const filtro = categoriaId && categoriaId !== 'null' 
      ? { estado: 'PUBLISHED', categoria_id: categoriaId }
      : { estado: 'PUBLISHED', categoria_id: null };

    const contenido = await this.db.find('contenido_educativo', filtro, masterToken);
    let listaContenido = Array.isArray(contenido) ? contenido : (contenido?.rows ?? []);

    // 3. Obtener favoritos del usuario
    const favoritos = await this.db.find('contenido_favorito', { usuario_id: usuarioId }, userToken);
    const listaFavoritos = Array.isArray(favoritos) ? favoritos : (favoritos?.rows ?? []);
    const setFavoritos = new Set(listaFavoritos.map(f => f.contenido_id));

    // 4. Formatear contenido
    let data = listaContenido.map(c => {
      let hashtags = [];
      try { hashtags = typeof c.hashtags === 'string' ? JSON.parse(c.hashtags) : (c.hashtags || []); } catch(e){}

      return {
        contenido_id: c.contenido_id,
        titulo: c.titulo,
        tipo: c.tipo,
        duracion_minutos: c.duracion_minutos,
        imagen_portada: c.imagen_portada,
        texto_contenido: c.texto_contenido,
        video_url: c.video_url,
        categoria_id: c.categoria_id,
        autor_nombre: c.autor_nombre,
        autor_profesion: c.autor_profesion,
        autor_foto: c.autor_foto,
        hashtags: hashtags,
        cantidad_vistas: c.cantidad_vistas || 0,
        created_at: c.created_at,
        is_favorite: setFavoritos.has(c.contenido_id)
      };
    });

    // 5. Ordenar por fecha desc
    data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 6. Aplicar limit si viene
    if (limit && limit > 0) {
      data = data.slice(0, limit);
    }

    return {
      categoria,
      contenido: data,
    };
  }
}