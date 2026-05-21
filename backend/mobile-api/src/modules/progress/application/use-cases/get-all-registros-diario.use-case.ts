import { Inject, Injectable} from '@nestjs/common';
import { IProgressProviderPort } from '../../domain/ports/progress-provider.port';

@Injectable()
export class GetAllRegistrosDiarioUseCase {
  constructor(
    @Inject('IProgressProviderPort')
    private readonly progressProvider: IProgressProviderPort,
  ) {}

  async execute(
    usuarioId: string,
    token: string,
  ): Promise<Array<{ fecha: string; emocion: string }>> {
    return await this.progressProvider.getAllRegistrosDiario(usuarioId, token);
  }
}