import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { IAuthProviderPort } from '../../domain/ports/auth-provider.port';
import { RegisterDto } from '../../presentation/dtos/register.dto';
import { DatabaseService } from '../../../database/infrastructure/database.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('IAuthProviderPort') private readonly authProvider: IAuthProviderPort,
    private readonly dbService: DatabaseService,
  ) {}

  async execute(dto: RegisterDto) {
    try {
      const projectToken = process.env.ROBLE_PROJECT_TOKEN;

      const authUser = await this.authProvider.register({
        email: dto.email,
        password: dto.password,
        name: dto.username,
        rol: dto.rol
      });

      await this.dbService.insert('usuarios', [{
        usuario_id: authUser.uid,
        email: dto.email,
        rol: dto.rol,
        estado: 'pendiente_verificacion',
        created_at: new Date().toISOString()
      }], projectToken);

      return {
        message: 'Registro exitoso. Por favor verifica tu correo electrónico para continuar.',
        uid: authUser.uid
      };
    } catch (error: any) {
      throw new BadRequestException(error.response?.data?.message || 'Error en el registro');
    }
  }
}