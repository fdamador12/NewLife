import { Inject, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { IAuthProviderPort } from '../../domain/ports/auth-provider.port';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../infrastructure/services/system-auth.service';
import { LoginDto } from '../../presentation/dtos/login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IAuthProviderPort')
    private readonly authProvider: IAuthProviderPort,
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(dto: LoginDto) {
    const now = new Date().toISOString();
    
    const masterToken = await this.systemAuth.getMasterToken();

    const searchResponse = await this.dbService.find(
      'usuarios', 
      { email: dto.email }, 
      masterToken
    );

    const userInDb = Array.isArray(searchResponse) ? searchResponse[0] : (searchResponse.rows?.[0]);

    if (userInDb) {
      if (userInDb.estado === 'eliminado') {
        throw new ForbiddenException('Tu cuenta ha sido eliminada y no puedes acceder a la aplicación.');
      }
    }
    
    const authUser = await this.authProvider.login(dto.email, dto.password);

    let finalUserData;

    if (!userInDb) {
      const newRecord = {
        usuario_id: authUser.uid,
        email: authUser.email,
        estado: 'activo',
        created_at: now,
        last_login: now,
        rol: 'paciente',
        username: authUser.email.split('@')[0]
      };
      await this.dbService.insert('usuarios', [newRecord], authUser.accessToken);
      finalUserData = newRecord;
    } else {
      await this.dbService.update(
        'usuarios',
        'usuario_id',
        userInDb.usuario_id,
        { last_login: now },
        authUser.accessToken
      );
      finalUserData = { ...userInDb, last_login: now };
    }

    return {
      accessToken: authUser.accessToken,
      refreshToken: authUser.refreshToken,
      user: {
        uid: authUser.uid,
        email: authUser.email,
        username: finalUserData.username,
        role: finalUserData.rol,
        estado: finalUserData.estado,
        last_login: finalUserData.last_login
      }
    };
  }
}