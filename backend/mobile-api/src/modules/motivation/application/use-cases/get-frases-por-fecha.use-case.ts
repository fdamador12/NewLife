import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IMotivationProviderPort } from '../../domain/ports/motivation-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { FraseDiaEntity } from '../../domain/entities/frase.entity';

@Injectable()
export class GetFrasesPorFechaUseCase {
  constructor(
    @Inject('IMotivationProviderPort')
    private readonly motivationProvider: IMotivationProviderPort,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string | null, fecha: string, userToken: string | null) {
    if (!this.isValidDateFormat(fecha)) {
      throw new BadRequestException('Formato de fecha inválido. Use YYYY-MM-DD');
    }

    const today = new Date().toISOString().split('T')[0];
    if (fecha > today) {
      throw new BadRequestException('No se pueden consultar frases de fechas futuras');
    }

    const masterToken = await this.systemAuth.getMasterToken();
    const frases = await this.motivationProvider.getFrasesPorFecha(fecha, masterToken);

    if (!frases || frases.length === 0) {
      return { data: [] };
    }

    // ✅ Solo verificar favoritos si hay usuario autenticado
    const frasesConFavorito = await Promise.all(
      frases.map(async (frase: FraseDiaEntity) => {
        let isFavorite = false;
        if (usuarioId && userToken) {
          isFavorite = await this.motivationProvider.isFraseGuardada(
            usuarioId, frase.frase_id, userToken
          );
        }
        return {
          _id: frase._id,
          frase_id: frase.frase_id,
          frase: frase.frase,
          dia: frase.dia,
          isFavorite,
        };
      })
    );

    return { data: frasesConFavorito };
  }

  private isValidDateFormat(fecha: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fecha)) return false;
    const date = new Date(fecha + 'T00:00:00');
    return date instanceof Date && !isNaN(date.getTime());
  }
}