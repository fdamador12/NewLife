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

  async execute(usuarioId: string, fecha: string, userToken: string) {
    // 1️⃣ Validar formato de fecha
    if (!this.isValidDateFormat(fecha)) {
      throw new BadRequestException('Formato de fecha inválido. Use YYYY-MM-DD');
    }

    // 2️⃣ Validar que la fecha no sea futura
    const today = new Date().toISOString().split('T')[0];
    if (fecha > today) {
      throw new BadRequestException('No se pueden consultar frases de fechas futuras');
    }

    // 3️⃣ Obtener token maestro
    const masterToken = await this.systemAuth.getMasterToken();

    // 4️⃣ Obtener todas las frases hasta esa fecha
    const frases = await this.motivationProvider.getFrasesPorFecha(fecha, masterToken);

    if (!frases || frases.length === 0) {
      return { data: [] };
    }

    // 5️⃣ Para cada frase, verificar si está guardada
    const frasesConFavorito = await Promise.all(
      frases.map(async (frase: FraseDiaEntity) => {
        const isFavorite = await this.motivationProvider.isFraseGuardada(
          usuarioId,
          frase.frase_id,
          userToken
        );

        return {
          _id: frase._id,
          frase_id: frase.frase_id,
          frase: frase.frase,
          dia: frase.dia,
          isFavorite,
        };
      })
    );

    console.log(`📜 Frases obtenidas hasta ${fecha}: ${frasesConFavorito.length} frases`);

    return { data: frasesConFavorito };
  }

  private isValidDateFormat(fecha: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fecha)) return false;

    const date = new Date(fecha + 'T00:00:00');
    return date instanceof Date && !isNaN(date.getTime());
  }
}