import { Inject, Injectable, Logger } from '@nestjs/common';
import { IProgressProviderPort } from '../../domain/ports/progress-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetAhorroUseCase {
  private logger = new Logger(GetAhorroUseCase.name);

  constructor(
    @Inject('IProgressProviderPort')
    private readonly progressProvider: IProgressProviderPort,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string, userToken: string) {
    const masterToken = await this.systemAuth.getMasterToken();

    const ahorro = await this.progressProvider.getAhorro(usuarioId, masterToken);
    const gastoSemanal = await this.progressProvider.getGastoSemanal(usuarioId, masterToken);
    const gastoDiario = Math.round(gastoSemanal / 7);

    // Contar días limpios para mostrar en UI
    const allRecords = await this.progressProvider.getAllCheckins(usuarioId, userToken);
    const rows: any[] = Array.isArray(allRecords) ? allRecords : ((allRecords as any)?.rows ?? []);

    const dayMap = new Map<string, boolean>();
    rows.forEach((r: any) => {
      const fecha = new Date(r.fecha);
      const dia = fecha.toISOString().split('T')[0];
      const consumo = r.consumo === true || r.consumo === 'true';
      if (dayMap.has(dia)) {
        if (consumo) dayMap.set(dia, true);
      } else {
        dayMap.set(dia, consumo);
      }
    });

    const diasLimpios = Array.from(dayMap.values()).filter((c) => c === false).length;

    return {
      dias_limpios: diasLimpios,
      gasto_diario: gastoDiario,
      ahorro_total: Math.round(ahorro?.ahorro_total ?? 0),
      gasto_semanal: gastoSemanal,
    };
  }
}