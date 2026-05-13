// src/auth/application/use-cases/register.use-case.ts
import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IAuthProviderPort } from '../../domain/ports/auth-provider.port';
import { RegisterDto } from '../../presentation/dtos/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('IAuthProviderPort')
    private readonly authProvider: IAuthProviderPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: RegisterDto) {
    try {
      const result = await this.authProvider.register({
        email: dto.email,
        password: dto.password,
        name: dto.nombre,
      });

      if (result?.uid) {
        this.eventEmitter.emit('user.registered', { uid: result.uid });
      }

      // Ya no retorna tokens — el usuario debe verificar su correo primero
      return {
        message: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.',
        email: dto.email,
      };
    } catch (error: any) {
      const detail = error.response?.data?.message || error.message;
      throw new BadRequestException(`No se pudo crear: ${detail}`);
    }
  }
}