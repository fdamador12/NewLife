import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../../../communities/application/helpers/resolve-user-id.helper';

/**
 * Registra el push token de un dispositivo para el usuario autenticado.
 * Idempotente — si el token ya existe para el usuario, no duplica.
 */
@Injectable()
export class RegisterPushTokenUseCase {
  private readonly logger = new Logger(RegisterPushTokenUseCase.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) {}

  async execute(
    usuarioUuid: string,
    expoPushToken: string,
  ): Promise<{ ok: boolean }> {
    // Validar formato del Expo Push Token
    if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken[')) {
      this.logger.warn(`Token invalido recibido: ${expoPushToken?.substring(0, 30)}`);
      return { ok: false };
    }

    const masterToken = await this.systemAuth.getMasterToken();

    // Resolver uuid del JWT a robleId (string de 12 chars usado en todas las tablas)
    const robleId = await this.resolveUserId.getRobleId(usuarioUuid);

    // Verificar si ya existe ese token para este usuario (idempotente)
    const existing = await this.db
      .find('push_tokens', { usuario_id: robleId, token: expoPushToken }, masterToken)
      .catch(() => [] as any[]);
    const rows = Array.isArray(existing) ? existing : ((existing as any).rows || (existing as any).data || []);

    if (rows.length > 0) {
      this.logger.log(`Token ya registrado para usuario ${robleId}`);
      return { ok: true };
    }

    // Insertar nuevo token
    await this.db.insert(
      'push_tokens',
      [{
        usuario_id: robleId,
        token: expoPushToken,
        created_at: new Date().toISOString(),
      }],
      masterToken,
    );

    this.logger.log(`Push token registrado para usuario ${robleId}`);
    return { ok: true };
  }
}