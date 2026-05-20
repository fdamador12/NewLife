import { Injectable, Inject } from '@nestjs/common';
import { ANALYTICS_STORAGE_PORT } from '../../domain/ports/analytics-storage.port';
import type { IAnalyticsStoragePort } from '../../domain/ports/analytics-storage.port';
import { resolveDateRange } from './helpers/date-range.helper';

export interface ListEventsInput {
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
  eventType?: string;
  category?: string;
  userHash?: string;
}

export interface EventListItem {
  event_id: string;
  /** Hash anonimizado parcial: primeros 6 chars + "..." (ej: "x7k9ab...") */
  user_id_short: string;
  /** Hash completo, por si el frontend lo necesita (drill-down) */
  user_id_hash: string;
  event_type: string;
  category: string;
  properties: Record<string, any> | null;
  created_at: string;
}

export interface PaginationMeta {
  limit: number;
  offset: number;
  total: number;
  has_more: boolean;
}

export interface ListEventsResult {
  items: EventListItem[];
  pagination: PaginationMeta;
  range: { from: string; to: string };
}

/**
 * Lista paginada de eventos para la tabla del dashboard admin.
 *
 * Soporta filtros por:
 * - Rango de fechas (default: ultimos 30 dias)
 * - Tipo de evento especifico
 * - Categoria
 * - user_id_hash (para drill-down a un usuario)
 *
 * El user_id ya viene hasheado de mobile-api, aqui solo lo anonimizamos
 * MAS para mostrar en UI (primeros 6 chars + "...").
 *
 * Orden: DESC por created_at (mas recientes primero).
 *
 * NOTA: el adapter ya devuelve los eventos ordenados DESC y filtrados.
 * La paginacion se aplica en memoria sobre el resultado filtrado.
 */
@Injectable()
export class GetEventsListUseCase {
  constructor(
    @Inject(ANALYTICS_STORAGE_PORT)
    private readonly storage: IAnalyticsStoragePort,
  ) {}

  async execute(input: ListEventsInput = {}): Promise<ListEventsResult> {
    const range = resolveDateRange(input.from, input.to);
    const limit = Math.min(input.limit ?? 50, 100);
    const offset = Math.max(input.offset ?? 0, 0);

    // Traer eventos filtrados (ya vienen ordenados DESC por el adapter)
    const events = await this.storage.findEvents({
      from: range.fromIso,
      to: range.toIso,
      eventTypes: input.eventType ? [input.eventType] : undefined,
      categories: input.category ? [input.category] : undefined,
      userIdHash: input.userHash,
    });

    const total = events.length;
    const paginated = events.slice(offset, offset + limit);

    // Mapear a formato de respuesta con anonimizacion
    const items: EventListItem[] = paginated.map(event => ({
      event_id: event.event_id,
      user_id_short: this.shortenUserId(event.user_id_hash),
      user_id_hash: event.user_id_hash,
      event_type: event.event_type,
      category: event.category,
      properties: event.properties,
      created_at: event.created_at,
    }));

    return {
      items,
      pagination: {
        limit,
        offset,
        total,
        has_more: offset + limit < total,
      },
      range: { from: range.fromIso, to: range.toIso },
    };
  }

  /**
   * Acorta un hash a "primeros 6 chars + ..." para mostrar en UI.
   * Si el hash es mas corto que 6, lo devuelve completo.
   */
  private shortenUserId(hash: string): string {
    if (!hash) return '...';
    if (hash.length <= 6) return hash;
    return `${hash.substring(0, 6)}...`;
  }
}