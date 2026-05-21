import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(comunidadId: string, postId: string, usuarioId: string, contenido: string) {
    const masterToken = await this.systemAuth.getMasterToken();

    // 1. Verificar membresía y acceso
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
      throw new ForbiddenException('Tu tipo de acceso no permite comentar.');
    }

    // 2. Verificar que el post existe y no está eliminado
    const postRes = await this.dbService.find('posts', { _id: postId }, masterToken);
    const postRows = Array.isArray(postRes) ? postRes : (postRes.rows || []);
    const post = postRows[0];

    if (!post || post.eliminado) {
      throw new NotFoundException('Post no encontrado.');
    }
    if (post.comunidad_id !== comunidadId) {
      throw new NotFoundException('Post no encontrado en esta comunidad.');
    }

    // 3. Crear comentario
    const now = new Date().toISOString();
    const newComment = {
      post_id:    postId,
      autor_id:   usuarioId,
      contenido,
      created_at: now,
      eliminado:  false,
    };

    const result = await this.dbService.insert('comentarios', [newComment], masterToken);
    const inserted = result?.inserted?.[0] || result?.[0] || newComment;

    return {
      id:         inserted._id,
      contenido:  inserted.contenido,
      created_at: inserted.created_at,
    };
  }
}