import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';
import { ExpoPushService } from '../../../push/infrastructure/services/expo-push.service';

@Injectable()
export class ReplyDailyForumUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
    // ← Servicio de push notifications
    private readonly expoPush: ExpoPushService,
  ) { }

  async execute(foroId: string, comunidadId: string, usuarioUuid: string, contenido: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const robleId = await this.resolveUserId.getRobleId(usuarioUuid);

    // Verificar membresía y acceso
    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: robleId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    const membresia = membRows[0];

    if (!membresia) throw new ForbiddenException('No eres miembro de esta comunidad.');
    if (membresia.tipo_acceso === 'SOLO_VER') {
      throw new ForbiddenException('Tu tipo de acceso no permite responder.');
    }

    // Verificar que el foro existe y es de hoy
    const foro = await this.dbService.findById('foro_del_dia', foroId, masterToken);

    if (!foro) throw new NotFoundException('Foro no encontrado.');

    const today = new Date().toISOString().split('T')[0];
    if (foro.fecha !== today) {
      throw new BadRequestException('Solo puedes responder al foro del día de hoy.');
    }

    const result = await this.dbService.insert('foros_respuestas', [{
      foro_id: foroId,
      comunidad_id: comunidadId,
      autor_id: robleId,
      contenido,
      created_at: new Date().toISOString(),
      eliminado: false,
    }], masterToken);

    const inserted = result?.inserted?.[0] || result?.[0] || {};

    // ─── NOTIFICACION PUSH (fire-and-forget) ────────────────────────────────
    // Notificar a TODOS los miembros de la comunidad excepto al autor
    this.notifyAllCommunityMembers(comunidadId, robleId, contenido, masterToken)
      .catch(err => console.error('[Push] Error notificando foro diario:', err?.message));

    return { id: inserted._id, contenido: inserted.contenido, created_at: inserted.created_at };
  }

  /**
   * Envia push a TODOS los miembros de la comunidad excepto al autor.
   * No falla la operacion principal si algo sale mal.
   */
  private async notifyAllCommunityMembers(
    comunidadId: string,
    miRobleId: string,
    contenido: string,
    masterToken: string,
  ): Promise<void> {
    try {
      // 1. Buscar TODOS los miembros de la comunidad
      const miembrosRes = await this.dbService.find(
        'comunidad_usuarios',
        { comunidad_id: comunidadId },
        masterToken,
      );
      const miembrosRows = Array.isArray(miembrosRes) ? miembrosRes : (miembrosRes.rows || []);

      // 2. Filtrar — excluir al autor + deduplicar
      const recipients = new Set<string>();
      miembrosRows.forEach((m: any) => {
        if (m.usuario_id && m.usuario_id !== miRobleId) {
          recipients.add(m.usuario_id);
        }
      });

      if (recipients.size === 0) return;

      // 3. Obtener mi nombre y el nombre de la comunidad para personalizar
      const [meRes, comunidadRes] = await Promise.all([
        this.dbService.find('usuarios', { _id: miRobleId }, masterToken).catch(() => []),
        this.dbService.find('comunidades', { _id: comunidadId }, masterToken).catch(() => []),
      ]);
      const meRows = Array.isArray(meRes) ? meRes : (meRes.rows || []);
      const comunidadRows = Array.isArray(comunidadRes) ? comunidadRes : (comunidadRes.rows || []);
      const miNombre = meRows[0]?.nombre || 'Alguien';
      const comunidadNombre = comunidadRows[0]?.nombre || 'tu comunidad';

      const preview = contenido.length > 80 ? contenido.substring(0, 77) + '...' : contenido;

      await this.expoPush.sendToUsers(
        Array.from(recipients),
        `💬 Nueva respuesta en el foro del día`,
        `${miNombre} en ${comunidadNombre}: ${preview}`,
        { type: 'daily_forum_reply', comunidadId },
      );
    } catch (err: any) {
      console.error('[Push] notifyAllCommunityMembers (daily) error:', err?.message);
    }
  }
}