import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IMotivationProviderPort } from '../../domain/ports/motivation-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetFraseDelDiaUseCase {
  constructor(
    @Inject('IMotivationProviderPort')
    private readonly motivationProvider: IMotivationProviderPort,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string, userToken: string) {
    const offset = -5;
    const localDate = new Date(new Date().getTime() + offset * 3600 * 1000);
    const targetDate = localDate.toISOString().split('T')[0];

    const masterToken = await this.systemAuth.getMasterToken();
    const frase = await this.motivationProvider.getFraseDelDia(targetDate, masterToken);

    if (!frase) {
      throw new NotFoundException(`No hay una frase del día registrada para hoy (${targetDate})`);
    }

    const isGuardada = await this.motivationProvider.isFraseGuardada(usuarioId, frase.frase_id, userToken);

    return { data: frase, isGuardada };
  }
}