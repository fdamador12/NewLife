import { Injectable, Inject, ConflictException, ForbiddenException } from '@nestjs/common';
import { IMotivationProviderPort } from '../../domain/ports/motivation-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GuardarFraseUseCase {
  constructor(
    @Inject('IMotivationProviderPort')
    private readonly motivationProvider: IMotivationProviderPort,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string, fraseId: string, userToken: string) {
    const alreadyGuarded = await this.motivationProvider.isFraseGuardada(usuarioId, fraseId, userToken);

    if (alreadyGuarded) {
      throw new ConflictException('Esta frase ya está guardada por el usuario');
    }

    const masterToken = await this.systemAuth.getMasterToken();
    const fraseExists = await this.motivationProvider.getFraseById(fraseId, masterToken);
    
    if (!fraseExists) {
      throw new ForbiddenException('La frase especificada no existe en la base de datos');
    }

    const result = await this.motivationProvider.guardarFrase(usuarioId, fraseId, userToken);
    
    return {
      message: 'Frase guardada exitosamente.',
      data: result,
    };
  }
}