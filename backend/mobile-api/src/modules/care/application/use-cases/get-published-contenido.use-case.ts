import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetPublishedContenidoUseCase {
  constructor(private readonly db: DatabaseService, private readonly systemAuth: SystemAuthService) {}

  async execute(usuarioId: string, userToken: string) {
    const masterToken = await this.systemAuth.getMasterToken();

    // 1. Traer TODO el contenido publicado
    const contenido = await this.db.find('contenido_educativo', { estado: 'PUBLISHED' }, masterToken);
    const listaContenido = Array.isArray(contenido) ? contenido : (contenido?.rows ?? []);

    // 2. Traer los favoritos de ESTE paciente en específico
    const favoritos = await this.db.find('contenido_favorito', { usuario_id: usuarioId }, userToken);
    const listaFavoritos = Array.isArray(favoritos) ? favoritos : (favoritos?.rows ?? []);
    
    // Convertimos a un Set para búsquedas instantáneas
    const setFavoritos = new Set(listaFavoritos.map(f => f.contenido_id));

    // 3. Formateamos y unimos la información
    const data = listaContenido.map(c => {
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
        cantidad_vistas: c.cantidad_vistas || 0, // ✅ NUEVO
        created_at: c.created_at,
        is_favorite: setFavoritos.has(c.contenido_id)
      };
    });

    // Ordenar de más reciente a más antiguo
    data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { data };
  }
}