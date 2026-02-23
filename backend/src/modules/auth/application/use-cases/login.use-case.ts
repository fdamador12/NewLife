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
  ) {}

  async execute(dto: LoginDto) {
    const authUser = await this.authProvider.login(dto.email, dto.password);

    const users = await this.dbService.find(
      'usuarios', 
      { usuario_id: authUser.uid }, 
      authUser.accessToken
    );

    if (users.length === 0) {
      await this.dbService.insert('usuarios', [{
        usuario_id: authUser.uid,
        email: authUser.email,
        rol: authUser.role,
        estado: 'activo'
      }], authUser.accessToken);
    }

    return authUser;
  }
}