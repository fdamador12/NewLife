import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ManageFavoritosUseCase {
  constructor(private readonly db: DatabaseService, private readonly systemAuth: SystemAuthService) {}

  async getFavoritos(usuarioId: string, userToken: string) {
    // 1. Buscamos qué IDs tiene guardados el usuario
    const favs = await this.db.find('contenido_favorito', { usuario_id: usuarioId }, userToken);
    const listaFavs = Array.isArray(favs) ? favs : (favs?.rows ?? []);
    if (!listaFavs.length) return { data: [] };

    // 2. Buscamos el contenido real
    const masterToken = await this.systemAuth.getMasterToken();
    const contenidos = await this.db.find('contenido_educativo', { estado: 'PUBLISHED' }, masterToken);
    const listaContenidos = Array.isArray(contenidos) ? contenidos : (contenidos?.rows ?? []);

    // 3. Filtramos
    const favIds = new Set(listaFavs.map(f => f.contenido_id));
    const data = listaContenidos.filter(c => favIds.has(c.contenido_id)).map(c => {
      let hashtags = [];
      try { hashtags = typeof c.hashtags === 'string' ? JSON.parse(c.hashtags) : (c.hashtags || []); } catch(e){}
      return { ...c, hashtags, is_favorite: true };
    });

    return { data };
  }

  async addFavorito(usuarioId: string, contenidoId: string, userToken: string) {
    const favs = await this.db.find('contenido_favorito', { usuario_id: usuarioId, contenido_id: contenidoId }, userToken);
    const listaFavs = Array.isArray(favs) ? favs : (favs?.rows ?? []);
    
    // Si ya lo tiene, no hacemos nada (evita duplicados)
    if (listaFavs.length > 0) return { message: 'Ya está en favoritos' };

    const payload = {
      favorito_id: uuidv4(),
      usuario_id: usuarioId,
      contenido_id: contenidoId,
      created_at: new Date().toISOString()
    };
    
    const result = await this.db.insert('contenido_favorito', [payload], userToken);

    if (!result || !result.inserted || result.inserted.length === 0) {
      console.error('Error de inserción en Roble:', result?.skipped);
      throw new InternalServerErrorException('No se pudo guardar en favoritos. Verifica la estructura de la base de datos.');
    }

    return { message: 'Agregado a favoritos' };
  }

  async removeFavorito(usuarioId: string, contenidoId: string, userToken: string) {
    const favs = await this.db.find('contenido_favorito', { usuario_id: usuarioId, contenido_id: contenidoId }, userToken);
    const listaFavs = Array.isArray(favs) ? favs : (favs?.rows ?? []);
    if (listaFavs.length === 0) throw new NotFoundException('No está en tus favoritos');

    await this.db.delete('contenido_favorito', 'favorito_id', listaFavs[0].favorito_id, userToken);
    return { message: 'Eliminado de favoritos' };
  }
}