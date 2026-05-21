import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IProgressProviderPort } from '../../domain/ports/progress-provider.port';
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

      // Obtener registro de sobriedad
      const sobrietyRecord = await this.progressProvider.getSobrietyRecord(usuarioId, masterToken);

      if (!sobrietyRecord) {
        this.logger.warn(`⚠️  No hay registro de sobriedad para usuario: ${usuarioId}`);
        return {
          message: 'No hay registro de sobriedad',
          contador: { dias: 0, horas: 0, minutos: 0 },
        };
      }

      const fechaUltimoConsumo = new Date(sobrietyRecord.fecha_ultimo_consumo);
      const ahora = new Date();

      // Calcular diferencia
      const diffMs = Math.max(0, ahora.getTime() - fechaUltimoConsumo.getTime());
      const totalMinutos = Math.floor(diffMs / (1000 * 60));
      const totalHoras = Math.floor(totalMinutos / 60);
      const dias = Math.floor(totalHoras / 24);
      const horas = totalHoras % 24;
      const minutos = totalMinutos % 60;

      this.logger.log(`✅ Tiempo sobrio calculado: ${dias}d ${horas}h ${minutos}m`);

      return {
        message: 'Tiempo sobrio calculado exitosamente',
        contador: { dias, horas, minutos },
      };
    } catch (error: any) {
      this.logger.error(`❌ Error calculando tiempo sobrio:`, error.message);
      return {
        message: 'Error calculando tiempo sobrio',
        contador: { dias: 0, horas: 0, minutos: 0 },
      };
    }
  }
}