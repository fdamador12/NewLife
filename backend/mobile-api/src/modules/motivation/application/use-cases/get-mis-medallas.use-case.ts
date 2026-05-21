import { Injectable, Inject } from '@nestjs/common';
import { IMotivationProviderPort } from '../../domain/ports/motivation-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetMisMedallasUseCase {
  constructor(
    @Inject('IMotivationProviderPort')
    private readonly motivationProvider: IMotivationProviderPort,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string, userToken: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const myChallenges = await this.motivationProvider.getUserChallenges(usuarioId, userToken);
    const medallas = myChallenges.filter(mc => mc.estado === 'COMPLETED');
    if (medallas.length === 0) return { data: [] };
    const allPublished = await this.motivationProvider.getPublishedChallenges(masterToken);
    const result = medallas.map(medalla => {
      const catalogInfo = allPublished.find(p => p.reto_id === medalla.reto_id);
      return {
        user_reto_id: medalla.user_reto_id,
        reto_id: medalla.reto_id,
        titulo: catalogInfo?.titulo || 'Reto Completado',
        dificultad: catalogInfo?.dificultad,
        fecha_completado: medalla.fecha_completado,
      };
    });

    // Ordenamos las medallas de la más reciente a la más antigua
    result.sort((a, b) => {
      if (!a.fecha_completado || !b.fecha_completado) return 0;
      return new Date(b.fecha_completado).getTime() - new Date(a.fecha_completado).getTime();
    });

    return { data: result };
  }
}