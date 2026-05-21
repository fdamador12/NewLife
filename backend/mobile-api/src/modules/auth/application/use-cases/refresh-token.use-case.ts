import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { IAuthProviderPort } from '../../domain/ports/auth-provider.port';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../infrastructure/services/system-auth.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('IAuthProviderPort')
    private readonly authProvider: IAuthProviderPort,
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(refreshToken: string) {
    try {
      // Validar con Roble
      const { accessToken } = await this.authProvider.refreshToken(refreshToken);

      return {
        accessToken,
        message: 'Token refrescado correctamente',
      };
    } catch (error: any) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}