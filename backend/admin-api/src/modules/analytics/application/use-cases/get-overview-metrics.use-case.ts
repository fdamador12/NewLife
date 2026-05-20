import { Injectable, Inject } from '@nestjs/common';
import { ANALYTICS_STORAGE_PORT } from '../../domain/ports/analytics-storage.port';
// CRITICAL: con isolatedModules + emitDecoratorMetadata, las interfaces que
// se inyectan via @Inject(SYMBOL) DEBEN importarse como type-only.
// Si no, TypeScript intenta emitir metadata de la interfaz (que no existe
// en runtime) y falla con error 1272.
import type { IAnalyticsStoragePort } from '../../domain/ports/analytics-storage.port';

/**
 * DTO de respuesta del overview.
 * Estos son los KPIs principales que se muestran en las cards arriba
 * del dashboard.
 */
export interface OverviewMetricsResult {
  /** Usuarios unicos activos hoy (con al menos un evento en las ultimas 24h) */
  active_users_today: number;
  /** Usuarios unicos activos en los ultimos 7 dias */
  active_users_week: number;
  /** Usuarios unicos activos en los ultimos 30 dias */
  active_users_month: number;
  /** Check-ins completados hoy */
  checkins_today: number;
  /** Activaciones del SOS hoy */
  sos_triggered_today: number;
  /** Total de eventos registrados (todo el historial) */
  total_events: number;
  /** Total de usuarios unicos (todo el historial) */
  total_users: number;
}

@Injectable()
export class GetOverviewMetricsUseCase {
  constructor(
    @Inject(ANALYTICS_STORAGE_PORT)
    private readonly storage: IAnalyticsStoragePort,
  ) {}

  async execute(): Promise<OverviewMetricsResult> {
    // Trae todos los eventos (con cache de 5 min en el adapter)
    const allEvents = await this.storage.findEvents();

    const now = Date.now();
    const todayStart = this.getTodayStart();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Sets para contar usuarios unicos
    const usersToday = new Set<string>();
    const usersWeek = new Set<string>();
    const usersMonth = new Set<string>();
    const allUsers = new Set<string>();

    let checkinsToday = 0;
    let sosToday = 0;

    for (const event of allEvents) {
      const eventTime = new Date(event.created_at).getTime();

      allUsers.add(event.user_id_hash);

      if (eventTime >= monthAgo) usersMonth.add(event.user_id_hash);
      if (eventTime >= weekAgo) usersWeek.add(event.user_id_hash);
      if (eventTime >= todayStart) usersToday.add(event.user_id_hash);

      // Contadores especificos de hoy
      if (eventTime >= todayStart) {
        if (event.event_type === 'daily_checkin_completed') checkinsToday++;
        if (event.event_type === 'sos_triggered') sosToday++;
      }
    }

    return {
      active_users_today: usersToday.size,
      active_users_week: usersWeek.size,
      active_users_month: usersMonth.size,
      checkins_today: checkinsToday,
      sos_triggered_today: sosToday,
      total_events: allEvents.length,
      total_users: allUsers.size,
    };
  }

  /**
   * Devuelve el timestamp de las 00:00:00 de hoy en hora local del servidor.
   */
  private getTodayStart(): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  }
}