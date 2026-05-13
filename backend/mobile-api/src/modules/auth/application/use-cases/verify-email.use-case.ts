import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { IAuthProviderPort } from '../../domain/ports/auth-provider.port';
import { VerifyEmailDto } from '../../presentation/dtos/verify-email.dto';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject('IAuthProviderPort')
    private readonly authProvider: IAuthProviderPort,
  ) {}

  async execute(dto: VerifyEmailDto) {
    try {
      await this.authProvider.verifyEmail(dto.email, dto.code);
      return { message: 'Correo verificado. Ya puedes iniciar sesión.' };
    } catch (error: any) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || '';

      if (status === 400 || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expirado')) {
        throw new BadRequestException('Código inválido o expirado. Intenta de nuevo.');
      }

      throw new BadRequestException('No se pudo verificar el correo. Intenta más tarde.');
    }
  }
}