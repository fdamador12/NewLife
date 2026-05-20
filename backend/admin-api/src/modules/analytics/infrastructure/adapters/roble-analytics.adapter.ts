import { Injectable, Logger } from '@nestjs/common';
import { RobleHttpService } from '../../../admin/infrastructure/services/roble-http.service';
import { IAnalyticsStoragePort, AnalyticsQueryFilters } from '../../domain/ports/analytics-storage.port';
import { AnalyticsEvent } from '../../domain/entities/analytics-event.entity';
import { ANALYTICS_EVENTS_TABLE } from '../../domain/constants/event-types.constant';

/**
 * Adapter que lee la tabla `analytics_events` de Roble.
 *
 * ESTRATEGIA: Roble no soporta agregaciones (COUNT, GROUP BY) ni rangos
 * de fechas en filtros. Por lo tanto, traemos TODOS los eventos y filtramos
 * en memoria.
 *
 * CACHE: para no abusar de Roble en cada request del dashboard, cacheamos
 * el resultado completo durante 5 minutos. Cada llamada a findEvents
 * solo invalida si el cache expira.
 *
 * Si la tabla crece a millones de eventos, esta estrategia no escala.
 * Migrar a una DB con agregaciones nativas o usar particionamiento por fecha.
 */
@Injectable()
export class RobleAnalyticsAdapter implements IAnalyticsStoragePort {
  private readonly logger = new Logger(RobleAnalyticsAdapter.name);

  // Cache en memoria del proceso. Se borra al reiniciar el contenedor.
  private cachedEvents: AnalyticsEvent[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

  constructor(private readonly roble: RobleHttpService) {}

  /**
   * Lee eventos aplicando filtros en memoria.
   * Si el cache es valido, devuelve filtrado del cache. Si no, refresca.
   */
  async findEvents(filters: AnalyticsQueryFilters = {}): Promise<AnalyticsEvent[]> {
    const allEvents = await this.getAllEventsCached();
    return this.applyFilters(allEvents, filters);
  }

  /**
   * Invalida el cache. Util para forzar refresh manual.
   */
  invalidateCache(): void {
    this.logger.log('Cache de analytics invalidado manualmente');
    this.cachedEvents = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Trae todos los eventos de Roble, con cache de 5 minutos.
   */
  private async getAllEventsCached(): Promise<AnalyticsEvent[]> {
    const now = Date.now();
    const isCacheValid = this.cachedEvents !== null && (now - this.cacheTimestamp) < this.CACHE_TTL_MS;

    if (isCacheValid) {
      this.logger.debug(`Cache hit (${this.cachedEvents!.length} eventos)`);
      return this.cachedEvents!;
    }

    this.logger.log('Cache miss/expired - leyendo eventos de Roble');
    const rows = await this.roble.dbRead<any[]>(ANALYTICS_EVENTS_TABLE, {});
    const events = (rows || []).map(r => AnalyticsEvent.fromRobleRow(r));

    // Ordenar DESC por created_at (mas recientes primero)
    events.sort((a, b) => b.created_at.localeCompare(a.created_at));

    this.cachedEvents = events;
    this.cacheTimestamp = now;
    this.logger.log(`Cache actualizado: ${events.length} eventos cargados`);

    return events;
  }

  /**
   * Aplica los filtros en memoria sobre el array de eventos.
   */
  private applyFilters(events: AnalyticsEvent[], filters: AnalyticsQueryFilters): AnalyticsEvent[] {
    let result = events;

    if (filters.from) {
      const fromTime = new Date(filters.from).getTime();
      result = result.filter(e => new Date(e.created_at).getTime() >= fromTime);
    }

    if (filters.to) {
      const toTime = new Date(filters.to).getTime();
      result = result.filter(e => new Date(e.created_at).getTime() <= toTime);
    }

    if (filters.eventTypes && filters.eventTypes.length > 0) {
      const typesSet = new Set(filters.eventTypes);
      result = result.filter(e => typesSet.has(e.event_type));
    }

    if (filters.categories && filters.categories.length > 0) {
      const categoriesSet = new Set(filters.categories);
      result = result.filter(e => categoriesSet.has(e.category));
    }

    if (filters.userIdHash) {
      result = result.filter(e => e.user_id_hash === filters.userIdHash);
    }

    return result;
  }
}