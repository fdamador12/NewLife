import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { IMotivationProviderPort } from '../../domain/ports/motivation-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { AddXpUseCase } from '../../../pet/application/use-cases/add-xp.use-case';

const XP_POR_DIFICULTAD: Record<string, string> = {
  SUAVE: 'challenge_complete_suave',
  MODERADA: 'challenge_complete_moderada',
  INTENSA: 'challenge_complete_intensa',
};

@Injectable()
export class ReclamarXpUseCase {
  constructor(
    @Inject('IMotivationProviderPort')
    private readonly motivationProvider: IMotivationProviderPort,
    private readonly systemAuth: SystemAuthService,
    private readonly addXpUseCase: AddXpUseCase,
  ) {}

  async execute(usuarioId: string, userRetoId: string, userToken: string) {
    const masterToken = await this.systemAuth.getMasterToken();

    // ✅ Buscar el user_reto
    const userChallenges = await this.motivationProvider.getUserChallenges(usuarioId, userToken);
    const userChallenge = userChallenges.find(uc => uc.user_reto_id === userRetoId);

    if (!userChallenge) {
      throw new NotFoundException('Reto no encontrado');
    }

    if (userChallenge.estado !== 'COMPLETED') {
      throw new BadRequestException('Solo puedes reclamar XP de retos completados');
    }

    if (userChallenge.xp_reclamado) {
      throw new BadRequestException('Ya reclamaste la XP de este reto');
    }

    // ✅ Obtener dificultad del catálogo
    const retoCatalogo = await this.motivationProvider.getChallengeById(
      userChallenge.reto_id,
      masterToken,
    );

    if (!retoCatalogo) {
      throw new NotFoundException('Reto del catálogo no encontrado');
    }

    const accion = XP_POR_DIFICULTAD[retoCatalogo.dificultad];
    if (!accion) {
      throw new BadRequestException(`Dificultad desconocida: ${retoCatalogo.dificultad}`);
    }

    // ✅ Sumar XP a la mascota
    const xpResult = await this.addXpUseCase.execute(usuarioId, accion);

    // ✅ Marcar como reclamado
    await this.motivationProvider.marcarXpReclamado(userRetoId, masterToken);

    return {
      xp_gained: xpResult.xp_gained,
      xp_total: xpResult.xp,
      evolved: xpResult.evolved,
      new_form: xpResult.form,
      selected_form: xpResult.selected_form,
      already_given: xpResult.already_given,
    };
  }
}