import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

/**
 * Servicio para enviar push notifications via Expo Push API.
 *
 * Como funciona:
 *  1. Obtenemos los tokens registrados en tabla push_tokens para los
 *     usuarios objetivo
 *  2. Hacemos POST a https://exp.host/--/api/v2/push/send
 *  3. Expo entrega via FCM (Android) o APNS (iOS)
 *
 * Tolerante a fallos — push delivery NO debe fallar la operacion principal.
 */
@Injectable()
export class ExpoPushService {
  private readonly logger = new Logger(ExpoPushService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  /**
   * Envia push a uno o varios usuarios (por robleId).
   *
   * @param usuarioRobleIds - array de robleIds de los destinatarios
   * @param title - titulo de la notificacion
   * @param body - cuerpo de la notificacion
   * @param data - payload opcional para deep linking (ej: { foroId: '...' })
   */
  async sendToUsers(
    usuarioRobleIds: string[],
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    if (!usuarioRobleIds || usuarioRobleIds.length === 0) return;

    try {
      const masterToken = await this.systemAuth.getMasterToken();

      // Obtener TODOS los tokens de todos los usuarios objetivo
      const tokens: string[] = [];
      for (const userId of usuarioRobleIds) {
        const res = await this.db
          .find('push_tokens', { usuario_id: userId }, masterToken)
          .catch(() => [] as any[]);
        const rows = Array.isArray(res) ? res : ((res as any).rows || (res as any).data || []);
        rows.forEach((row: any) => {
          if (row.token && row.token.startsWith('ExponentPushToken[')) {
            tokens.push(row.token);
          }
        });
      }

      if (tokens.length === 0) {
        this.logger.log(`[Push] Sin tokens para usuarios: ${usuarioRobleIds.join(',')}`);
        return;
      }

      this.logger.log(`[Push] Enviando "${title}" a ${tokens.length} dispositivos`);

      const messages = tokens.map(token => ({
        to: token,
        sound: 'default',
        title,
        body,
        data: data || {},
        priority: 'high',
        channelId: 'newlife-default',
      }));

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();
      this.logger.log(`[Push] Resultado: ${JSON.stringify(result).substring(0, 200)}`);
    } catch (err: any) {
      // NUNCA fallar la operacion original por un error de push
      this.logger.error(`[Push] Error: ${err?.message ?? err}`);
    }
  }
}