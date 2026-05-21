import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EvaluateChallengesUseCase } from '../use-cases/evaluate-challenges.use-case';

@Injectable()
export class ProgressEventsListener {
  constructor(private readonly evaluateChallengesUseCase: EvaluateChallengesUseCase) {}

  @OnEvent('progress.checkin.created', { async: true })
  async handleCheckinCreatedEvent(payload: {
    usuarioId: string;
    userToken: string;
    consumo: boolean;
  }) {
    console.log(`[Challenges] Evaluando retos para el usuario ${payload.usuarioId}...`);
    try {
      await this.evaluateChallengesUseCase.execute(
        payload.usuarioId,
        payload.userToken,
        payload.consumo,
      );
    } catch (error) {
      console.error('[Challenges] Error al evaluar retos en segundo plano:', error);
    }
  }
}