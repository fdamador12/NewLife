import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ExpoPushService } from '../../../push/infrastructure/services/expo-push.service';

@Injectable()
export class ReplyForumUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    // ← Servicio de push notifications
    private readonly expoPush: ExpoPushService,
  ) { }

  async execute(comunidadId: string, foroId: string, usuarioId: string, contenido: string) {
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
      throw new ForbiddenException('Tu tipo de acceso no permite responder foros.');
    }

    // 2. Verificar que el foro existe y está activo
    const foroRes = await this.dbService.find('foros', { _id: foroId }, masterToken);
    const foroRows = Array.isArray(foroRes) ? foroRes : (foroRes.rows || []);
    const foro = foroRows[0];

    if (!foro || foro.comunidad_id !== comunidadId) {
      throw new NotFoundException('Foro no encontrado.');
    }
    if (foro.activo === false) {
      throw new ForbiddenException('Este foro ya no está activo.');
    }

    // 3. Crear respuesta
    const now = new Date().toISOString();
    const newReply = {
      foro_id: foroId,
      autor_id: usuarioId,
      contenido,
      created_at: now,
      eliminado: false,
    };

    const result = await this.dbService.insert('foros_respuestas', [newReply], masterToken);
    const inserted = result?.inserted?.[0] || result?.[0] || newReply;

    // ─── NOTIFICACION PUSH (fire-and-forget) ────────────────────────────────
    // Notificar a TODOS los miembros de la comunidad excepto al autor
    this.notifyAllCommunityMembers(comunidadId, usuarioId, foro, contenido, masterToken)
      .catch(err => console.error('[Push] Error notificando foro:', err?.message));

    return {
      id: inserted._id,
      contenido: inserted.contenido,
      created_at: inserted.created_at,
    };
  }

  /**
   * Envia push a TODOS los miembros de la comunidad excepto al autor.
   */
  private async notifyAllCommunityMembers(
    comunidadId: string,
    miRobleId: string,
    foro: any,
    contenido: string,
    masterToken: string,
  ): Promise<void> {
    try {
      // 1. TODOS los miembros de la comunidad
      const miembrosRes = await this.dbService.find(
        'comunidad_usuarios',
        { comunidad_id: comunidadId },
        masterToken,
      );
      const miembrosRows = Array.isArray(miembrosRes) ? miembrosRes : (miembrosRes.rows || []);

      // 2. Excluir al autor + deduplicar
      const recipients = new Set<string>();
      miembrosRows.forEach((m: any) => {
        if (m.usuario_id && m.usuario_id !== miRobleId) {
          recipients.add(m.usuario_id);
        }
      });

      if (recipients.size === 0) return;

      // 3. Personalizar el mensaje
      const meRes = await this.dbService.find('usuarios', { _id: miRobleId }, masterToken).catch(() => []);
      const meRows = Array.isArray(meRes) ? meRes : (meRes.rows || []);
      const miNombre = meRows[0]?.nombre || 'Alguien';

      const preview = contenido.length > 80 ? contenido.substring(0, 77) + '...' : contenido;
      const foroTitulo = foro?.titulo || 'el foro';

      await this.expoPush.sendToUsers(
        Array.from(recipients),
        `💬 Nueva respuesta en "${foroTitulo}"`,
        `${miNombre}: ${preview}`,
        { type: 'forum_reply', foroId: foro?._id, comunidadId },
      );
    } catch (err: any) {
      console.error('[Push] notifyAllCommunityMembers (forum) error:', err?.message);
    }
  }
}