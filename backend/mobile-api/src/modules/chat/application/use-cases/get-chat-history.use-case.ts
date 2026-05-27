import { Injectable, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetChatHistoryUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(comunidadId: string, usuarioRobleId: string, limit = 50) {
    const masterToken = await this.systemAuth.getMasterToken();

    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: usuarioRobleId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    if (membRows.length === 0) throw new ForbiddenException('No eres miembro de esta comunidad.');

    const msgsRes = await this.dbService.find(
      'mensajes_chat',
      { comunidad_id: comunidadId },
      masterToken,
    );
    const allMsgs = Array.isArray(msgsRes) ? msgsRes : (msgsRes.rows || []);

    return allMsgs
      .filter((m: any) => !m.eliminado)
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-limit)
      .map((m: any) => ({
        id:           m._id,
        comunidad_id: m.comunidad_id,
        autor_id:     m.autor_id,
        autor_nombre: m.autor_nombre,
        contenido:    m.contenido,
        created_at:   m.created_at,
      }));
  }
}
