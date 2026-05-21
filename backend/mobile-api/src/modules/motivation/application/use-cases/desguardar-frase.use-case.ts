import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IMotivationProviderPort } from '../../domain/ports/motivation-provider.port';

@Injectable()
export class DesguardarFraseUseCase {
  constructor(
    @Inject('IMotivationProviderPort')
    private readonly motivationProvider: IMotivationProviderPort,
  ) {}

  async execute(usuarioId: string, fraseId: string, userToken: string) {
    const frasesGuardadas = await this.motivationProvider.getFrasesGuardadas(usuarioId, userToken);
    const fraseAEliminar = frasesGuardadas.find(f => f.frase_id === fraseId);

    if (!fraseAEliminar) {
      throw new NotFoundException('La frase no está guardada por el usuario');
    }

    await this.motivationProvider.desguardarFrase(fraseAEliminar._id, userToken);

    return { message: 'Frase removida de tus guardados exitosamente.' };
  }
}