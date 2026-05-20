import { Injectable, Inject } from '@nestjs/common';
import { ANALYTICS_STORAGE_PORT } from '../../domain/ports/analytics-storage.port';
import type { IAnalyticsStoragePort } from '../../domain/ports/analytics-storage.port';
import { resolveDateRange } from './helpers/date-range.helper';

export interface ActivityByHourInput {
  from?: string;
  to?: string;
}

export interface HourBucket {
  /** Hora del dia (0-23) */
  hour: number;
  /** Total de eventos en esa hora (sumado a lo largo de todos los dias del rango) */
  events: number;
  /** Usuarios unicos que tuvieron actividad en esa hora */
  unique_users: number;
}

export interface ActivityByHourResult {
  /** 24 buckets, uno por cada hora del dia (0-23) */
  hourly: HourBucket[];
  /**
   * Todas las horas que comparten el VALOR MAXIMO de eventos.
   * Si solo hay un pico, devuelve un array con 1 elemento.
   * Si varias horas empatan, devuelve todas ordenadas asc.
   */
  peak_hours: number[];
  /** Cantidad de eventos en cada peak_hour. */
  peak_value: number;
  /**
   * Todas las horas que comparten el VALOR MINIMO de eventos.
   * Si todas estan en 0, las 24 horas se listan aqui.
   * Logica simetrica a peak_hours.
   */
  lowest_hours: number[];
  /** Cantidad de eventos en cada lowest_hour. */
  lowest_value: number;
  /** Total de eventos en el rango */
  total_events: number;
  /** Rango consultado */
  range: { from: string; to: string };
}

/**
 * Distribucion de actividad por hora del dia.
 *
 * peak_hours y lowest_hours son ARRAYS simetricos:
 * - peak_hours: todas las horas con el VALOR MAXIMO
 * - lowest_hours: todas las horas con el VALOR MINIMO (incluyendo 0)
 *
 * Esto significa que si 11 horas tienen 0 eventos, lowest_hours
 * tendra esas 11 horas. El frontend decide como mostrarlas.
 *
 * NOTA: usa la hora LOCAL del servidor (UTC-5 Barranquilla).
 */
@Injectable()
export class GetActivityByHourUseCase {
  constructor(
    @Inject(ANALYTICS_STORAGE_PORT)
    private readonly storage: IAnalyticsStoragePort,
  ) {}

  async execute(input: ActivityByHourInput = {}): Promise<ActivityByHourResult> {
    const range = resolveDateRange(input.from, input.to);

    const events = await this.storage.findEvents({
      from: range.fromIso,
      to: range.toIso,
    });

    // Inicializar 24 buckets en 0
    const hourlyData: Array<{ events: number; users: Set<string> }> = [];
    for (let h = 0; h < 24; h++) {
      hourlyData.push({ events: 0, users: new Set() });
    }

    // Agrupar por hora del dia
    for (const event of events) {
      const date = new Date(event.created_at);
      const hour = date.getHours(); // 0-23
      hourlyData[hour].events++;
      hourlyData[hour].users.add(event.user_id_hash);
    }

    // Convertir a array de buckets
    const hourly: HourBucket[] = hourlyData.map((data, hour) => ({
      hour,
      events: data.events,
      unique_users: data.users.size,
    }));

    // ── Calcular valor maximo y todas las horas con ese valor ──────────
    let peakValue = hourly[0].events;
    for (const bucket of hourly) {
      if (bucket.events > peakValue) peakValue = bucket.events;
    }
    const peakHours: number[] = [];
    for (const bucket of hourly) {
      if (bucket.events === peakValue) peakHours.push(bucket.hour);
    }

    // ── Calcular valor minimo y todas las horas con ese valor ──────────
    // Logica simetrica a peak_hours. Si todas tienen 0, las 24 horas
    // se listan. El frontend decide como manejarlo.
    let lowestValue = hourly[0].events;
    for (const bucket of hourly) {
      if (bucket.events < lowestValue) lowestValue = bucket.events;
    }
    const lowestHours: number[] = [];
    for (const bucket of hourly) {
      if (bucket.events === lowestValue) lowestHours.push(bucket.hour);
    }

    return {
      hourly,
      peak_hours: peakHours,
      peak_value: peakValue,
      lowest_hours: lowestHours,
      lowest_value: lowestValue,
      total_events: events.length,
      range: { from: range.fromIso, to: range.toIso },
    };
  }
}