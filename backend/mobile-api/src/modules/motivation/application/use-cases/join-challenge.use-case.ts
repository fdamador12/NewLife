import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IMotivationProviderPort } from '../../domain/ports/motivation-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ChallengeEvaluatorFactory } from '../strategies/challenge-evaluator.factory';

@Injectable()
export class JoinChallengeUseCase {
  constructor(
    @Inject('IMotivationProviderPort')
    private readonly motivationProvider: IMotivationProviderPort,
    private readonly systemAuth: SystemAuthService,
    private readonly evaluatorFactory: ChallengeEvaluatorFactory,
  ) {}

  async execute(usuarioId: string, retoId: string, userToken: string) {
    const masterToken = await this.systemAuth.getMasterToken();

    const reto = await this.motivationProvider.getChallengeById(retoId, masterToken);
    if (!reto || reto.estado !== 'PUBLISHED') {
      throw new NotFoundException('El reto no está disponible o no existe.');
    }

    const inscripciones = await this.motivationProvider.getUserChallenges(usuarioId, userToken);
    const inscripcionExistente = inscripciones.find(i => i.reto_id === retoId);

    if (inscripcionExistente) {
      if (inscripcionExistente.estado === 'ACTIVE') {
        throw new ConflictException('Ya tienes este reto activo en tu lista.');
      }
      if (inscripcionExistente.estado === 'COMPLETED') {
        throw new ConflictException('¡Ya ganaste esta medalla! No es necesario reiniciar el reto.');
      }
    }

    const fechaInicioNueva = new Date().toISOString();
    const evaluator = this.evaluatorFactory.getEvaluator(reto.tipo);
    const progresoReal = await evaluator.evaluate(usuarioId, reto.target, fechaInicioNueva, userToken, masterToken);
    const nuevoEstado = progresoReal >= reto.target ? 'COMPLETED' : 'ACTIVE';

    if (inscripcionExistente && inscripcionExistente.estado === 'FAILED') {
      // ✅ Usar masterToken
      await this.motivationProvider.updateChallengeProgress(
        inscripcionExistente.user_reto_id,
        progresoReal,
        nuevoEstado,
        masterToken,
        fechaInicioNueva,
      );

      return {
        message: nuevoEstado === 'COMPLETED'
          ? '¡Reto reiniciado y completado automáticamente!'
          : '¡Reto reiniciado! Sigue adelante.',
        estado: nuevoEstado,
        progreso_actual: progresoReal,
      };
    } else {
      // ✅ Usar masterToken
      return this.motivationProvider.startChallenge({
        user_reto_id: uuidv4(),
        usuario_id: usuarioId,
        reto_id: retoId,
        estado: nuevoEstado,
        progreso_actual: progresoReal,
        fecha_inicio: fechaInicioNueva,
      }, masterToken);
    }
  }
}