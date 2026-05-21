import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class GetDailyForumDetailUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) {}

  async execute(foroId: string, comunidadId: string, usuarioUuid: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const robleId = await this.resolveUserId.getRobleId(usuarioUuid);

    // Verificar membresía
    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: robleId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    if (membRows.length === 0) throw new ForbiddenException('No eres miembro de esta comunidad.');

    // Obtener foro
    const foro = await this.dbService.findById('foro_del_dia', foroId, masterToken);

    if (!foro) throw new NotFoundException('Foro no encontrado.');

    const today  = new Date().toISOString().split('T')[0];
    const es_hoy = foro.fecha === today;

    // Respuestas de esta comunidad para este foro
    const repRes = await this.dbService.find(
      'foros_respuestas',
      { foro_id: foroId, comunidad_id: comunidadId },
      masterToken,
    );
    const allReplies = Array.isArray(repRes) ? repRes : (repRes.rows || []);
    const replies = allReplies.filter((r: any) => !r.eliminado);

    // Enriquecer respuestas con autor, likes y comentarios
    const enrichedReplies = await Promise.all(
      replies.map(async (reply: any) => {
        const [autorRes, likesRes, commentsRes] = await Promise.all([
          this.dbService.findById('usuarios', reply.autor_id, masterToken),
          this.dbService.find('foro_respuesta_likes', { respuesta_id: reply._id }, masterToken),
          this.dbService.find('foro_respuesta_comentarios', { respuesta_id: reply._id }, masterToken),
        ]);

        const autor    = Array.isArray(autorRes) ? autorRes[0] : autorRes.rows?.[0];
        const likes    = Array.isArray(likesRes) ? likesRes : (likesRes.rows || []);
        const comments = Array.isArray(commentsRes) ? commentsRes : (commentsRes.rows || []);
        const activeComments = comments.filter((c: any) => !c.eliminado);

        // Enriquecer comentarios con autor
        const enrichedComments = await Promise.all(
          activeComments.map(async (c: any) => {
            const cAutor = await this.dbService.findById('usuarios', c.autor_id, masterToken);
            return {
              id:         c._id,
              contenido:  c.contenido,
              created_at: c.created_at,
              es_mio:     c.autor_id === robleId,
              autor:      { id: c.autor_id, nombre: cAutor?.nombre || 'Usuario' },
            };
          })
        );

        return {
          id:           reply._id,
          contenido:    reply.contenido,
          created_at:   reply.created_at,
          es_mio:       reply.autor_id === robleId,
          autor:        { id: reply.autor_id, nombre: autor?.nombre || 'Usuario' },
          total_likes:  likes.length,
          yo_di_like:   likes.some((l: any) => l.usuario_id === robleId),
          comentarios:  enrichedComments,
        };
      })
    );

    return {
      foro: {
        id:          foro._id,
        pregunta:    foro.pregunta,
        descripcion: foro.descripcion,
        fecha:       foro.fecha,
        es_hoy,
      },
      puede_responder: es_hoy && membRows[0]?.tipo_acceso !== 'SOLO_VER',
      respuestas: enrichedReplies.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    };
  }
}