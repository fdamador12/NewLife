import { Inject, Injectable } from '@nestjs/common';
import { IProgressProviderPort } from '../../domain/ports/progress-provider.port';

@Injectable()
export class GetCalendarUseCase {
  constructor(
    @Inject('IProgressProviderPort')
    private readonly progressProvider: IProgressProviderPort,
  ) {}

  async execute(uid: string, month: number, year: number, userToken: string) {
    const records = await this.progressProvider.getMonthCheckins(uid, month, year, userToken);

    // Agrupar por día
    const dayMap = new Map<number, any[]>();

    records.forEach((r: any) => {
      const fecha = new Date(r.fecha);
      const day = fecha.getDate();
      if (!dayMap.has(day)) {
        dayMap.set(day, []);
      }
      dayMap.get(day)!.push(r);
    });

    const days = Array.from(dayMap.entries()).map(([day, registros]) => {
      // Si hay aunque sea un registro con consumo: true ese día es dificil
      const hayConsumo = registros.some((r: any) => r.consumo === true);

      // Para el resumen tomar el último registro del día
      const ultimo = registros[registros.length - 1];

      const resumen: any = { emocion: ultimo.emocion };

      if (hayConsumo) {
        // Buscar el registro con consumo para mostrar ubicacion y social
        const registroConsumo = registros.find((r: any) => r.consumo === true);
        resumen.ubicacion = registroConsumo?.ubicacion;
        resumen.social = registroConsumo?.social;
      }

      return {
        day,
        tipo: hayConsumo ? 'dificil' : 'limpio',
        resumen,
      };
    });

    days.sort((a, b) => a.day - b.day);

    return { month, year, days };
  }
}