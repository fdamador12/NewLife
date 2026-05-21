import { Injectable, Inject } from '@nestjs/common';
import { ANALYTICS_STORAGE_PORT } from '../../domain/ports/analytics-storage.port';
import type { IAnalyticsStoragePort } from '../../domain/ports/analytics-storage.port';
import { resolveDateRange, formatDateYMD } from './helpers/date-range.helper';

export interface SosStatsInput {
  from?: string;
  to?: string;
}

export interface SosOptionUsage {
  /** Nombre de la opcion (breathing, motivational_phrases, etc.) */
  option: string;
  /** Cuantas veces fue seleccionada */
  count: number;
}

export interface SosDailyBucket {
  date: string;
  count: number;
}

export interface SosStatsResult {
  /** Total de activaciones del SOS en el rango */
  total_triggers: number;
  /** Usuarios unicos que activaron SOS */
  unique_users: number;
  /** Opciones del SOS ordenadas por uso (DESC) */
  options_breakdown: SosOptionUsage[];
  /** SOS por dia (para grafico de barras opcional) */
  daily_breakdown: SosDailyBucket[];
  /** Rango consultado */
  range: { from: string; to: string };
}

/**
 * Estadisticas del boton SOS. Critico para el equipo de salud mental:
 * - Cuantas crisis hubo en el rango
 * - Que opciones usaron mas (respiracion, frases, contactos, etc)
 * - Distribucion por dia (detecta patrones)
 *
 * Las opciones del SOS estan en la property `option` del evento
 * `sos_option_selected`.
 */
@Injectable()
export class GetSosStatsUseCase {
  constructor(
    @Inject(ANALYTICS_STORAGE_PORT)
    private readonly storage: IAnalyticsStoragePort,
  ) {}

  async execute(input: SosStatsInput = {}): Promise<SosStatsResult> {
    const range = resolveDateRange(input.from, input.to);

    const events = await this.storage.findEvents({
      from: range.fromIso,
      to: range.toIso,
      eventTypes: ['sos_triggered', 'sos_option_selected'],
    });

    const uniqueUsers = new Set<string>();
    const optionsCount = new Map<string, number>();
    const dailyCount = new Map<string, number>();

    let totalTriggers = 0;

    for (const event of events) {
      if (event.event_type === 'sos_triggered') {
        totalTriggers++;
        uniqueUsers.add(event.user_id_hash);

        // Agrupar por dia
        const day = formatDateYMD(new Date(event.created_at));
        dailyCount.set(day, (dailyCount.get(day) ?? 0) + 1);
      } else if (event.event_type === 'sos_option_selected') {
        // La opcion esta en properties.option
        const option = event.properties?.option as string | undefined;
        if (option) {
          optionsCount.set(option, (optionsCount.get(option) ?? 0) + 1);
        }
      }
    }

    // Convertir opciones a array ordenado DESC
    const optionsBreakdown: SosOptionUsage[] = Array.from(optionsCount.entries())
      .map(([option, count]) => ({ option, count }))
      .sort((a, b) => b.count - a.count);

    // Daily breakdown ordenado ASC por fecha
    const dailyBreakdown: SosDailyBucket[] = Array.from(dailyCount.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total_triggers: totalTriggers,
      unique_users: uniqueUsers.size,
      options_breakdown: optionsBreakdown,
      daily_breakdown: dailyBreakdown,
      range: { from: range.fromIso, to: range.toIso },
    };
  }
}