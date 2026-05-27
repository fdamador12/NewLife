import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

/**
 * Obtiene el perfil completo del usuario.
 *
 * Combina datos de DOS tablas:
 * - `usuarios`: datos de cuenta (nombre, email, avatar_url, descripcion)
 * - `informacion_personal`: datos de onboarding (apodo, pronombre, motivo, gasto)
 *
 * Si alguna tabla no tiene fila, los campos devuelven valores neutros.
 */
@Injectable()
export class GetProfileUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(userId: string) {
    const masterToken = await this.systemAuth.getMasterToken();

    const [userRes, infoRes] = await Promise.all([
      this.dbService.find('usuarios', { usuario_id: userId }, masterToken),
      this.dbService.find('informacion_personal', { usuario_id: userId }, masterToken),
    ]);

    const user = Array.isArray(userRes) ? userRes[0] : userRes.rows?.[0];
    const info = Array.isArray(infoRes) ? infoRes[0] : infoRes.rows?.[0];

    return {
      nombre: user?.nombre || '',
      avatar_url: user?.avatar_url || null,
      descripcion: user?.descripcion || '',
      apodo: info?.apodo || '',
      pronombre: info?.pronombre || '',
      motivo_sobrio: info?.motivo_sobrio || '',
      gasto_semanal: info?.gasto_semanal || 0,
    };
  }
}