import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { IAuthProviderPort } from '../../domain/ports/auth-provider.port';
import { RegisterDto } from '../../presentation/dtos/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('IAuthProviderPort')
    private readonly authProvider: IAuthProviderPort,
  ) { }

  async execute(dto: RegisterDto) {
    try {
      await this.authProvider.register({
        email: dto.email,
        password: dto.password,
        name: dto.username
      });

      return {
        message: 'Registro exitoso. Ahora inicia sesión para activar tu perfil.'
      };
    } catch (error: any) {
      const detail = error.response?.data?.message || error.message;
      throw new BadRequestException(`No se pudo crear la cuenta: ${detail}`);
    }
  }
}