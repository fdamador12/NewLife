import { Injectable, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class CreatePostUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(comunidadId: string, usuarioId: string, contenido: string) {
    const masterToken = await this.systemAuth.getMasterToken();

    // 1. Verificar membresía y tipo de acceso
    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: usuarioId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    const membresia = membRows[0];

    if (!membresia) {
      throw new ForbiddenException('No eres miembro de esta comunidad.');
    }

    if (membresia.tipo_acceso === 'SOLO_VER') {
      throw new ForbiddenException('Tu tipo de acceso no permite publicar en esta comunidad.');
    }

    // 2. Crear el post
    const now = new Date().toISOString();
    const newPost = {
      comunidad_id: comunidadId,
      autor_id:     usuarioId,
      contenido,
      created_at:   now,
      edited_at:    null,
      eliminado:    false,
    };

    const result = await this.dbService.insert('posts', [newPost], masterToken);
    const inserted = result?.inserted?.[0] || result?.[0] || newPost;

    return {
      id:         inserted._id,
      contenido:  inserted.contenido,
      created_at: inserted.created_at,
    };
  }
}