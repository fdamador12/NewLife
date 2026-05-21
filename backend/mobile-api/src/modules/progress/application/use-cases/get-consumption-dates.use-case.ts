import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IProgressProviderPort } from '../../domain/ports/progress-provider.port';

@Injectable()
export class GetConsumptionDatesUseCase {
  private logger = new Logger(GetConsumptionDatesUseCase.name);

  constructor(
    @Inject('IProgressProviderPort')
    private readonly progressProvider: IProgressProviderPort,
  ) {}

  async execute(
    usuarioId: string,
    token: string,
  ): Promise<Array<{ fecha: string; consumo: boolean }>> {
    // ✨ Usar el nuevo método
    const registros = await this.progressProvider.getConsumptionDates(usuarioId, token);

    console.log('📊 Consumo Dates desde use case:', registros);
    this.logger.log('📊 Consumo Dates desde use case:', registros);

    return registros;
  }
}