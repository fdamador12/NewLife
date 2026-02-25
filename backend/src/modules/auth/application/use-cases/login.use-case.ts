import { Inject, Injectable } from '@nestjs/common';
import { IAuthProviderPort } from '../../domain/ports/auth-provider.port';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { LoginDto } from '../../presentation/dtos/login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IAuthProviderPort')
    private readonly authProvider: IAuthProviderPort,
    private readonly dbService: DatabaseService,
  ) { }

  async execute(dto: LoginDto) {
    const authUser = await this.authProvider.login(dto.email, dto.password);
    const now = new Date().toISOString();

    const response = await this.dbService.find(
      'usuarios',
      { usuario_id: authUser.uid },
      authUser.accessToken
    );

    const userDataArray = Array.isArray(response) ? response : (response.rows || []);
    let finalUserData;

    if (userDataArray.length === 0) {
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
      try {
        await this.dbService.update(
          'usuarios',
          'usuario_id',
          authUser.uid,
          { last_login: now },
          authUser.accessToken
        );
      } catch (e: any) {
        const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
        console.error("[LOGIN ERROR] Falló la actualización de last_login:", errorMessage);
      }

      finalUserData = userDataArray[0];
      finalUserData.last_login = now;
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