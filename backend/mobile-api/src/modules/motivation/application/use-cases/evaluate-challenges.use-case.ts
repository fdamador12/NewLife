import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IMotivationProviderPort } from '../../domain/ports/motivation-provider.port';
import { ChallengeEvaluatorFactory } from '../strategies/challenge-evaluator.factory';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class EvaluateChallengesUseCase {
  private logger = new Logger(EvaluateChallengesUseCase.name);

  constructor(
    @Inject('IMotivationProviderPort')
    private readonly motivationProvider: IMotivationProviderPort,
    private readonly evaluatorFactory: ChallengeEvaluatorFactory,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string, userToken: string, consumo: boolean = false) {
    this.logger.log(`🎯 [EvaluateChallengesUseCase] Iniciando evaluación para usuario: ${usuarioId}`);
    this.logger.log(`🎯 [EvaluateChallengesUseCase] ¿Hubo consumo? ${consumo}`);

    try {
      const masterToken = await this.systemAuth.getMasterToken();
      const activeChallenges = await this.motivationProvider.getActiveUserChallenges(usuarioId, userToken);

      this.logger.log(`🎯 [EvaluateChallengesUseCase] Retos activos encontrados: ${activeChallenges.length}`);

      if (activeChallenges.length === 0) {
        this.logger.log(`🎯 [EvaluateChallengesUseCase] No hay retos activos, nada que evaluar`);
        return;
      }

      for (const userChallenge of activeChallenges) {
        this.logger.log(`🎯 [EvaluateChallengesUseCase] Evaluando reto: ${userChallenge.reto_id}`);

        const retoCatalogo = await this.motivationProvider.getChallengeById(
          userChallenge.reto_id,
          masterToken,
        );

        if (!retoCatalogo) {
          this.logger.warn(`🎯 [EvaluateChallengesUseCase] Reto no encontrado: ${userChallenge.reto_id}`);
          continue;
        }

        // ✅ Solo SOBRIETY_DAYS falla por consumo directo
        // CHECKIN_STREAK falla por no registrar un día — el consumo no lo afecta
        if (consumo && retoCatalogo.tipo === 'SOBRIETY_DAYS') {
          this.logger.log(
            `🎯 [EvaluateChallengesUseCase] ❌ RETO FALLIDO por consumo: "${retoCatalogo.titulo}" (tipo: ${retoCatalogo.tipo})`,
          );
          await this.motivationProvider.updateChallengeProgress(
            userChallenge.user_reto_id,
            userChallenge.progreso_actual,
            'FAILED',
            masterToken,
          );
          continue;
        }

        const evaluator = this.evaluatorFactory.getEvaluator(retoCatalogo.tipo);
        this.logger.log(`🎯 [EvaluateChallengesUseCase] Evaluador seleccionado: ${retoCatalogo.tipo}`);

        const nuevoProgreso = await evaluator.evaluate(
          usuarioId,
          retoCatalogo.target,
          userChallenge.fecha_inicio,
          userToken,
          masterToken,
        );

        this.logger.log(`🎯 [EvaluateChallengesUseCase] Reto: "${retoCatalogo.titulo}" (tipo: ${retoCatalogo.tipo})`);
        this.logger.log(`🎯 [EvaluateChallengesUseCase] Target: ${retoCatalogo.target}, Progreso anterior: ${userChallenge.progreso_actual}, Nuevo: ${nuevoProgreso}`);

        if (nuevoProgreso !== userChallenge.progreso_actual) {
          let estadoFinal = 'ACTIVE';

          if (nuevoProgreso >= retoCatalogo.target) {
            estadoFinal = 'COMPLETED';
            this.logger.log(`🎯 [EvaluateChallengesUseCase] ✅ RETO COMPLETADO: "${retoCatalogo.titulo}"`);
          } else if (
            nuevoProgreso < userChallenge.progreso_actual &&
            retoCatalogo.tipo === 'CHECKIN_STREAK'
          ) {
            // ✅ CHECKIN_STREAK falla solo cuando la racha baja (no registró un día)
            estadoFinal = 'FAILED';
            this.logger.log(`🎯 [EvaluateChallengesUseCase] ❌ RETO FALLIDO por racha rota: "${retoCatalogo.titulo}"`);
          }

          this.logger.log(`🎯 [EvaluateChallengesUseCase] Actualizando: user_reto_id=${userChallenge.user_reto_id}, progreso=${nuevoProgreso}, estado=${estadoFinal}`);

          await this.motivationProvider.updateChallengeProgress(
            userChallenge.user_reto_id,
            nuevoProgreso,
            estadoFinal,
            masterToken,
          );

          this.logger.log(`🎯 [EvaluateChallengesUseCase] ✅ Reto actualizado correctamente`);
        } else {
          this.logger.log(`🎯 [EvaluateChallengesUseCase] ℹ️ Sin cambios en progreso (${nuevoProgreso} = ${userChallenge.progreso_actual})`);
        }
      }

      this.logger.log(`🎯 [EvaluateChallengesUseCase] Evaluación completada exitosamente`);
    } catch (error: any) {
      this.logger.error(`🎯 [EvaluateChallengesUseCase] Error durante evaluación:`, error.message);
      throw error;
    }
  }
}