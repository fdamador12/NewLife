import { Injectable, Inject } from '@nestjs/common';
import { ANALYTICS_STORAGE_PORT } from '../../domain/ports/analytics-storage.port';
import type { IAnalyticsStoragePort } from '../../domain/ports/analytics-storage.port';
import { resolveDateRange } from './helpers/date-range.helper';

export interface CheckinFunnelInput {
  from?: string;
  to?: string;
}

export interface CheckinFunnelResult {
  /** Cantidad de check-ins iniciados */
  started: number;
  /** Cantidad de check-ins completados */
  completed: number;
  /** Cantidad de check-ins abandonados */
  abandoned: number;
  /** Tasa de completion (completed / started * 100) */
  completion_rate: number;
  /** Tasa de abandono (abandoned / started * 100) */
  abandonment_rate: number;
  /** Rango consultado */
  range: { from: string; to: string };
}

/**
 * Devuelve el funnel del check-in diario: cuantos iniciaron vs completaron
 * vs abandonaron. Util para detectar si el flujo del check-in es muy largo
 * o tiene friccion.
 *
 * NOTA: el evento DAILY_CHECKIN_ABANDONED se trackea en cleanup del useEffect,
 * lo cual es fire-and-forget. Puede haber un pequeno gap entre started y
 * (completed + abandoned) si la app se mato abruptamente.
 */
@Injectable()
export class GetCheckinFunnelUseCase {
  constructor(
    @Inject(ANALYTICS_STORAGE_PORT)
    private readonly storage: IAnalyticsStoragePort,
  ) {}

  async execute(input: CheckinFunnelInput = {}): Promise<CheckinFunnelResult> {
    const range = resolveDateRange(input.from, input.to);

    const events = await this.storage.findEvents({
      from: range.fromIso,
      to: range.toIso,
      eventTypes: [
        'daily_checkin_started',
        'daily_checkin_completed',
        'daily_checkin_abandoned',
      ],
    });

    let started = 0;
    let completed = 0;
    let abandoned = 0;

    for (const event of events) {
      switch (event.event_type) {
        case 'daily_checkin_started':
          started++;
          break;
        case 'daily_checkin_completed':
          completed++;
          break;
        case 'daily_checkin_abandoned':
          abandoned++;
          break;
      }
    }

    // Evitar division por cero
    const completionRate = started > 0 ? (completed / started) * 100 : 0;
    const abandonmentRate = started > 0 ? (abandoned / started) * 100 : 0;

    return {
      started,
      completed,
      abandoned,
      completion_rate: Math.round(completionRate * 10) / 10, // 1 decimal
      abandonment_rate: Math.round(abandonmentRate * 10) / 10,
      range: { from: range.fromIso, to: range.toIso },
    };
  }
}