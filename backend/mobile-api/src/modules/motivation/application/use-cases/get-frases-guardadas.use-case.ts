import { Injectable, Inject } from '@nestjs/common';
import { IMotivationProviderPort } from '../../domain/ports/motivation-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetFrasesGuardadasUseCase {
  constructor(
    @Inject('IMotivationProviderPort')
    private readonly motivationProvider: IMotivationProviderPort,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string, userToken: string) {
    const frasesGuardadas = await this.motivationProvider.getFrasesGuardadas(usuarioId, userToken);
    
    if (!frasesGuardadas.length) {
      return { data: [] };
    }

    const masterToken = await this.systemAuth.getMasterToken();

    const frasesCompletas = await Promise.all(
      frasesGuardadas.map(async (guardada) => {
        const fraseOriginal = await this.motivationProvider.getFraseById(guardada.frase_id, masterToken);
        
        return {
          _id: guardada._id,
          frase_id: guardada.frase_id,
          frase: fraseOriginal?.frase || 'Frase no disponible',
          dia: fraseOriginal?.dia || 'Fecha desconocida',
        };
      })
    );

    return { data: frasesCompletas };
  }
}