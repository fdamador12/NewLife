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

      return {
        message: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.',
        email: dto.email,
      };
    } catch (error: any) {
      const detail: string = error.response?.data?.message || error.message || '';
      throw new BadRequestException(this.mapErrorMessage(detail));
    }
  }

  /**
   * Traduce mensajes tecnicos de Roble auth a mensajes claros para el usuario.
   *
   * IMPORTANTE: como no podemos eliminar cuentas de Roble auth desde codigo,
   * un email "eliminado" en nuestra app sigue ocupado en Roble. Cuando alguien
   * intenta registrarse con ese email, Roble dice "Ya existe una cuenta
   * verificada", lo cual confunde al usuario que cree haber eliminado su cuenta.
   *
   * Aqui traducimos ese mensaje a algo mas claro y educativo.
   */
  private mapErrorMessage(detail: string): string {
    const lower = detail.toLowerCase();

    // Caso 1: email ya registrado y verificado (incluye cuentas eliminadas
    // por la limitacion de Roble auth)
    if (lower.includes('ya existe una cuenta verificada')) {
      return (
        'Este correo electrónico no está disponible para registro. ' +
        'Si la cuenta fue eliminada anteriormente, no es posible reutilizar el mismo correo. ' +
        'Por favor, usa un correo electrónico diferente.'
      );
    }

    // Caso 2: email ya existe pero sin verificar
    if (lower.includes('ya existe') || lower.includes('already exists')) {
      return (
        'Este correo electrónico ya está registrado. ' +
        'Si es tu cuenta, intenta iniciar sesión o verifica tu correo.'
      );
    }

    // Caso 3: password no cumple requisitos
    if (lower.includes('password') || lower.includes('contrase')) {
      return (
        'La contraseña no cumple los requisitos mínimos. ' +
        'Usa al menos 8 caracteres incluyendo letras y números.'
      );
    }

    // Caso 4: email mal formado
    if (lower.includes('email') && lower.includes('valid')) {
      return 'El formato del correo electrónico no es válido.';
    }

    // Default: mensaje generico amigable
    return `No se pudo crear la cuenta: ${detail}`;
  }
}