import { Inject, Injectable, Logger } from '@nestjs/common';
import { IProgressProviderPort } from '../../domain/ports/progress-provider.port';

@Injectable()
export class InitCaminoUseCase {
  private logger = new Logger(InitCaminoUseCase.name);

  constructor(
    @Inject('IProgressProviderPort')
    private readonly progressProvider: IProgressProviderPort,
  ) { }

  async execute(usuarioId: string, masterToken: string) {
    try {
      this.logger.log(`📊 Verificando/creando registro en camino para usuario: ${usuarioId}`);

      // Obtener registro actual
      const existingCamino = await this.progressProvider.getCamino(usuarioId, masterToken);

      // Si ya existe Y tiene valores válidos, retornar
      if (existingCamino && existingCamino.nivel !== null && existingCamino.subnivel !== null) {
        this.logger.log(`✅ Usuario ya tiene registro en camino:`, existingCamino);
        return {
          data: existingCamino,
          message: 'Registro en camino ya existe',
        };
      }

      // Si no existe O tiene valores nulos, crear/actualizar
      this.logger.log(`🆕 Creando/actualizando registro en camino para usuario: ${usuarioId}`);
      
      await this.progressProvider.upsertCamino(
        {
          usuario_id: usuarioId,
          nivel: 1,
          subnivel: 1,
        },
        masterToken
      );

      this.logger.log(`✅ Registro en camino inicializado con nivel: 1, subnivel: 1`);

      return {
        data: { usuario_id: usuarioId, nivel: 1, subnivel: 1 },
        message: 'Registro en camino inicializado',
      };
    } catch (error: any) {
      this.logger.error(`❌ Error en init-camino:`, error.message);
      // NO lanzar error — si falla, continuamos sin romper el login
      return {
        data: { usuario_id: usuarioId, nivel: 1, subnivel: 1 },
        message: 'Registro en camino inicializado (con valores default)',
      };
    }
  }
}