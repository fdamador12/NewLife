import {
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
  GoneException,
  Inject,
} from '@nestjs/common';
import { DeleteAllDataUseCase } from '../../../users/application/use-cases/delete-all-data.use-case';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../infrastructure/services/system-auth.service';
import { IAuthProviderPort } from '../../domain/ports/auth-provider.port';

export interface RequestAccountDeletionInput {
  email: string;
  password: string;
  motivo?: string;
}

/**
 * Caso de uso publico para eliminar cuenta desde la landing.
 *
 * FLUJO (orden estrategico para seguridad + UX clara):
 *
 * 1. Verifica credenciales contra Roble PRIMERO.
 *    - Si fallan → 401 generico (no revela existencia)
 *
 * 2. Si credenciales OK, busca registro en `usuarios`.
 *    - No existe → 401 generico
 *    - Estado ELIMINADO → 410 Gone (mensaje claro porque demostro identidad)
 *
 * 3. BLOQUEO POR ROL (NUEVO):
 *    - ADMIN o SUPERADMIN no pueden auto-eliminarse desde la landing.
 *    - Razon: evitar que el sistema quede sin admins por accidente o
 *      por credenciales robadas. Los admins deben ser gestionados desde
 *      el panel administrativo con supervision.
 *
 * 4. Continuar con borrado para usuarios normales.
 *
 * IMPORTANTE: este bloqueo NO impide eliminar admins por completo, solo
 * desde la landing publica. Un admin que quiera salir debe contactar al
 * equipo o, en el futuro, otro superadmin podra eliminarlo desde el panel.
 */
@Injectable()
export class RequestAccountDeletionUseCase {
  private readonly logger = new Logger(RequestAccountDeletionUseCase.name);

  // Roles que NO pueden auto-eliminarse desde la landing publica.
  // Mantener esta lista actualizada si se agregan nuevos roles privilegiados.
  private readonly PROTECTED_ROLES = ['ADMIN', 'SUPERADMIN'];

  constructor(
    @Inject('IAuthProviderPort')
    private readonly authProvider: IAuthProviderPort,
    private readonly deleteAllDataUseCase: DeleteAllDataUseCase,
    private readonly db: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(input: RequestAccountDeletionInput): Promise<{ message: string }> {
    const { email, password, motivo } = input;

    // 1. Verificar credenciales contra Roble PRIMERO
    let userUid: string;
    try {
      const authUser = await this.authProvider.login(email, password);
      userUid = authUser.uid;

      if (!userUid) {
        this.logger.error(`Login OK pero authUser sin uid para ${email}`);
        throw new UnauthorizedException('Correo o contrasena invalidos.');
      }
    } catch (err: any) {
      this.logger.warn(`Credenciales invalidas para email=${email}: ${err.message}`);
      throw new UnauthorizedException('Correo o contrasena invalidos.');
    }

    // 2. Buscar registro en `usuarios`
    const masterToken = await this.systemAuth.getMasterToken();
    const searchResult = await this.db.find('usuarios', { email }, masterToken);
    const rows = Array.isArray(searchResult) ? searchResult : (searchResult.rows ?? []);
    const userInDb = rows[0];

    if (!userInDb) {
      this.logger.warn(`Login OK en Roble pero usuario no esta en tabla usuarios: ${email}`);
      throw new UnauthorizedException('Correo o contrasena invalidos.');
    }

    // Cuenta ya eliminada → mensaje claro
    if (userInDb.estado === 'ELIMINADO') {
      this.logger.warn(`Intento de re-eliminacion: ${email}`);
      throw new GoneException('Esta cuenta ya fue eliminada anteriormente.');
    }

    // 3. BLOQUEO POR ROL: admins y superadmins no pueden auto-eliminarse
    //    desde la landing publica.
    if (this.PROTECTED_ROLES.includes(userInDb.rol)) {
      this.logger.warn(
        `Intento de auto-eliminacion bloqueado por rol protegido: ` +
        `email=${email}, rol=${userInDb.rol}`,
      );
      throw new ForbiddenException(
        'Las cuentas con permisos administrativos no pueden eliminarse desde este formulario. ' +
        'Si deseas eliminar tu cuenta, contacta al equipo de NewLife en ' +
        'proyecto.newlife.2026@gmail.com',
      );
    }

    this.logger.log(
      `Eliminacion verificada: email=${email}, uid=${userUid}, rol=${userInDb.rol}, ` +
      `motivo=${motivo ?? '(no especificado)'}`,
    );

    // 4. Delegar al use case de borrado total con el motivo opcional
    await this.deleteAllDataUseCase.execute(userUid, motivo);

    this.logger.log(`Cuenta eliminada exitosamente: email=${email}, uid=${userUid}`);

    return {
      message:
        'Cuenta eliminada exitosamente. Todos tus datos personales han sido borrados permanentemente.',
    };
  }
}