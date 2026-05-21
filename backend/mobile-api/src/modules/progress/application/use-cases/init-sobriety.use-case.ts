import { Inject, Injectable, Logger } from '@nestjs/common';
import { IProgressProviderPort } from '../../domain/ports/progress-provider.port';

@Injectable()
export class InitSobrietyUseCase {
  private logger = new Logger(InitSobrietyUseCase.name);

  constructor(
    @Inject('IProgressProviderPort')
    private readonly progressProvider: IProgressProviderPort,
  ) {}

  async execute(uid: string, fechaUTC: string, masterToken: string): Promise<any> {
    this.logger.log(`🆕 Inicializando sobriedad para usuario: ${uid}`);
    this.logger.log(`📅 Fecha último consumo (UTC): ${fechaUTC}`);

    try {
      await this.progressProvider.updateSobrietyDate(uid, fechaUTC, masterToken);
      this.logger.log(`✅ Sobriedad inicializada`);

      return {
        message: 'Fecha de sobriedad inicializada',
        fecha_ultimo_consumo: fechaUTC,
      };
    } catch (error: any) {
      this.logger.error(`❌ Error inicializando sobriedad:`, error.message);
      throw error;
    }
  }
}