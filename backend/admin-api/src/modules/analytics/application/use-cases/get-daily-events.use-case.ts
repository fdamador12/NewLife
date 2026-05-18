import { Injectable, Inject } from '@nestjs/common';
import { ANALYTICS_STORAGE_PORT } from '../../domain/ports/analytics-storage.port';
import type { IAnalyticsStoragePort } from '../../domain/ports/analytics-storage.port';
import { resolveDateRange, generateDateRange, formatDateYMD } from './helpers/date-range.helper';

export interface DailyEventsInput {
  from?: string;
  to?: string;
  category?: string;
}

export interface DailyEventsBucket {
  /** Fecha del bucket en formato YYYY-MM-DD */
  date: string;
  /** Total de eventos ese dia */
  total: number;
  /** Usuarios unicos activos ese dia */
  unique_users: number;
}

export interface DailyEventsResult {
  /** Buckets ordenados ascendente por fecha. Incluye dias sin eventos (total=0). */
  buckets: DailyEventsBucket[];
  /** Resumen del rango consultado */
  range: {
    from: string;
    to: string;
    days: number;
  };
}

/**
 * Devuelve una serie temporal de eventos por dia.
 * Util para el grafico de lineas del dashboard.
 *
 * - Rellena dias sin eventos con total=0 (grafico continuo).
 * - Cuenta usuarios unicos por dia (no eventos totales).
 */
@Injectable()
export class GetDailyEventsUseCase {
  constructor(
    @Inject(ANALYTICS_STORAGE_PORT)
    private readonly storage: IAnalyticsStoragePort,
  ) {}

  async execute(input: DailyEventsInput = {}): Promise<DailyEventsResult> {
    const range = resolveDateRange(input.from, input.to);

    const events = await this.storage.findEvents({
      from: range.fromIso,
      to: range.toIso,
      categories: input.category ? [input.category] : undefined,
    });

    // Generar todos los dias del rango (para rellenar con 0s)
    const allDays = generateDateRange(range.fromMs, range.toMs);

    // Inicializar buckets con 0s
    const bucketMap = new Map<string, { total: number; users: Set<string> }>();
    for (const day of allDays) {
      bucketMap.set(day, { total: 0, users: new Set() });
    }

    // Agrupar eventos por dia
    for (const event of events) {
      const day = formatDateYMD(new Date(event.created_at));
      const bucket = bucketMap.get(day);
      if (bucket) {
        bucket.total++;
        bucket.users.add(event.user_id_hash);
      }
    }

    // Convertir a array ordenado
    const buckets: DailyEventsBucket[] = allDays.map(day => {
      const b = bucketMap.get(day)!;
      return {
        date: day,
        total: b.total,
        unique_users: b.users.size,
      };
    });

    return {
      buckets,
      range: {
        from: range.fromIso,
        to: range.toIso,
        days: allDays.length,
      },
    };
  }
}