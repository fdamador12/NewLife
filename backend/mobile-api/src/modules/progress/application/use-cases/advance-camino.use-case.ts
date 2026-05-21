import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IProgressProviderPort } from '../../domain/ports/progress-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class AdvanceCaminoUseCase {
  private logger = new Logger(AdvanceCaminoUseCase.name); // Mantén esto de HEAD

  constructor(
    @Inject('IProgressProviderPort')
    private readonly progressProvider: IProgressProviderPort,
    private readonly systemAuth: SystemAuthService,
    private readonly eventEmitter: EventEmitter2, // Esto es vital
  ) { }

  async execute(uid: string, userToken: string, currentLevel: number, currentSublevel: number) {
    const masterToken = await this.systemAuth.getMasterToken();
    const camino = await this.progressProvider.getCamino(uid, masterToken);

    if (!camino || camino.nivel === null) {
      await this.progressProvider.upsertCamino(
        { _id: camino?._id, usuario_id: uid, nivel: 1, subnivel: 1 },
        masterToken,
      );
      this.eventEmitter.emit('progress.checkin.created', { usuarioId: uid, userToken });
      return { nivel: 1, subnivel: 1 };
    }

    this.logger.log(`📊 Camino actual en BD:`, camino);
    this.logger.log(`📊 Módulo que intenta completar: ${currentLevel},${currentSublevel}`);

    // ✅ VALIDACIÓN: Si ya fue completado, NO avanzar
    if (camino && camino.nivel > currentLevel) {
      this.logger.log(`⚠️  Nivel ${currentLevel} ya fue completado`);
      return {
        data: camino,
        message: 'Este nivel ya fue completado',
      };
    }

    if (camino && camino.nivel === currentLevel && camino.subnivel > currentSublevel) {
      this.logger.log(`⚠️  Subnivel ${currentSublevel} ya fue completado`);
      return {
        data: camino,
        message: 'Este módulo ya fue completado',
      };
    }

    // ✅ VALIDACIÓN: Si está intentando hacer un módulo futuro, rechazar
    if (camino && (camino.nivel > currentLevel ||
      (camino.nivel === currentLevel && camino.subnivel > currentSublevel))) {
      this.logger.log(`❌ Intento de hacer módulo ${currentLevel},${currentSublevel} pero está en ${camino.nivel},${camino.subnivel}`);
      throw new Error('No puedes hacer este módulo aún');
    }

    let nuevoNivel = currentLevel;
    let nuevoSubnivel = currentSublevel;

    // Si no existe registro, crear
    if (!camino || camino.nivel === null || camino.subnivel === null) {
      this.logger.log(`🆕 Creando registro inicial`);
      await this.progressProvider.upsertCamino(
        { usuario_id: uid, nivel: currentLevel, subnivel: currentSublevel },
        masterToken,
      );
    } else if (camino.nivel === 12 && camino.subnivel === 3) {
      // Si ya completó todo
      this.logger.log(`✅ Ya completó todos los pasos`);
      nuevoNivel = 12;
      nuevoSubnivel = 3;
    } else {
      // Calcular siguiente
      if (currentSublevel < 3) {
        nuevoSubnivel += 1;
      } else {
        nuevoNivel += 1;
        nuevoSubnivel = 1;
      }

      this.logger.log(`⏭️  Avanzando de ${currentLevel},${currentSublevel} a ${nuevoNivel},${nuevoSubnivel}`);

      // Actualizar
      await this.progressProvider.upsertCamino(
        { usuario_id: uid, nivel: nuevoNivel, subnivel: nuevoSubnivel },
        masterToken,
      );
    }
    this.eventEmitter.emit('progress.checkin.created', { usuarioId: uid, userToken });

    this.logger.log(`✅ Avance completado: nivel=${nuevoNivel}, subnivel=${nuevoSubnivel}`);

    return {
      data: {
        nivel: nuevoNivel,
        subnivel: nuevoSubnivel,
      },
      message: 'Progreso actualizado',
    };
  } catch(error: any) {
    this.logger.error(`❌ Error en advance:`, error.message);
    throw error;
  }
}