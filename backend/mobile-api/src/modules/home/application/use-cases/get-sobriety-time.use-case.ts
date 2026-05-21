import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IProgressProviderPort } from '../../../progress/domain/ports/progress-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetSobrietyTimeUseCase {
  private logger = new Logger(GetSobrietyTimeUseCase.name);

  constructor(
    @Inject('IProgressProviderPort')
    private readonly progressProvider: IProgressProviderPort,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string): Promise<any> {
    this.logger.log(`📊 Calculando tiempo sobrio para usuario: ${usuarioId}`);

    try {
      const masterToken = await this.systemAuth.getMasterToken();
      const sobrietyRecord = await this.progressProvider.getSobrietyRecord(
        usuarioId,
        masterToken,
      );

      if (!sobrietyRecord || !sobrietyRecord.fecha_ultimo_consumo) {
        this.logger.warn(
          `⚠️  No hay registro de sobriedad para usuario: ${usuarioId}`,
        );
        return {
          message: 'No hay registro de sobriedad',
          fecha_ultimo_consumo: null,
        };
      }

      // ✅ Retornar SOLO la fecha en UTC
      // El frontend se encarga de convertir a zona horaria local
      this.logger.log(
        `✅ Fecha último consumo (UTC): ${sobrietyRecord.fecha_ultimo_consumo}`,
      );

      return {
        message: 'Fecha de sobriedad obtenida exitosamente',
        fecha_ultimo_consumo: sobrietyRecord.fecha_ultimo_consumo,
      };
    } catch (error: any) {
      this.logger.error(
        `❌ Error calculando tiempo sobrio: ${error.message}`,
      );
      throw error;
    }
  }
}