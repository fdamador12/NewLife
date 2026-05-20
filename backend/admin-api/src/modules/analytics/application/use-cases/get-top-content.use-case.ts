import { Injectable, Inject, Logger } from '@nestjs/common';
import { ANALYTICS_STORAGE_PORT } from '../../domain/ports/analytics-storage.port';
import type { IAnalyticsStoragePort } from '../../domain/ports/analytics-storage.port';
import { RobleHttpService } from '../../../admin/infrastructure/services/roble-http.service';
import { resolveDateRange } from './helpers/date-range.helper';

export interface TopContentInput {
  from?: string;
  to?: string;
  /** Cuantos top devolver. Default 10, max 50. */
  limit?: number;
}

export interface TopContentItem {
  content_id: string;
  /** Titulo resuelto de la tabla contenido_educativo. Puede ser null si fue eliminado. */
  title: string | null;
  /** Tipo: ARTICULO o VIDEO. Puede ser null si fue eliminado. */
  type: string | null;
  /** Cantidad de veces que se vio */
  views: number;
  /** Usuarios unicos que lo vieron */
  unique_users: number;
}

export interface TopContentResult {
  items: TopContentItem[];
  /** Total de eventos content_viewed en el rango (todos, no solo top N) */
  total_views: number;
  range: { from: string; to: string };
}

const CONTENIDO_TABLE = 'contenido_educativo';

/**
 * Top de contenidos mas vistos en el rango.
 * Cuenta eventos `content_viewed` agrupando por content_id en properties.
 * Resuelve titulos desde la tabla `contenido_educativo`.
 *
 * IMPORTANTE: si un contenido fue eliminado despues de los eventos, el
 * lookup devuelve null. En ese caso el frontend puede mostrar "(eliminado)".
 */
@Injectable()
export class GetTopContentUseCase {
  private readonly logger = new Logger(GetTopContentUseCase.name);

  constructor(
    @Inject(ANALYTICS_STORAGE_PORT)
    private readonly storage: IAnalyticsStoragePort,
    private readonly roble: RobleHttpService,
  ) {}

  async execute(input: TopContentInput = {}): Promise<TopContentResult> {
    const range = resolveDateRange(input.from, input.to);
    const limit = Math.min(input.limit ?? 10, 50);

    // 1. Traer eventos content_viewed del rango
    const events = await this.storage.findEvents({
      from: range.fromIso,
      to: range.toIso,
      eventTypes: ['content_viewed'],
    });

    // 2. Agrupar por content_id (en properties)
    const counts = new Map<string, { views: number; users: Set<string> }>();
    for (const event of events) {
      const contentId = event.properties?.content_id as string | undefined;
      if (!contentId) continue;

      const bucket = counts.get(contentId) ?? { views: 0, users: new Set() };
      bucket.views++;
      bucket.users.add(event.user_id_hash);
      counts.set(contentId, bucket);
    }

    // 3. Ordenar DESC por views y tomar top N
    const topIds = Array.from(counts.entries())
      .sort((a, b) => b[1].views - a[1].views)
      .slice(0, limit);

    // 4. Lookup en paralelo de los titulos
    // Roble no tiene WHERE IN, asi que hacemos N llamadas paralelas
    const items: TopContentItem[] = await Promise.all(
      topIds.map(async ([contentId, stats]) => {
        const title = await this.fetchContentTitle(contentId);
        return {
          content_id: contentId,
          title: title?.titulo ?? null,
          type: title?.tipo ?? null,
          views: stats.views,
          unique_users: stats.users.size,
        };
      }),
    );

    return {
      items,
      total_views: events.length,
      range: { from: range.fromIso, to: range.toIso },
    };
  }

  /**
   * Resuelve el titulo y tipo de un contenido desde Roble.
   * Devuelve null si el contenido fue eliminado.
   * No cachea aqui: en una llamada al endpoint son max 50 ids, aceptable.
   */
  private async fetchContentTitle(contentId: string): Promise<{ titulo: string; tipo: string } | null> {
    try {
      const rows = await this.roble.dbRead<any[]>(CONTENIDO_TABLE, { contenido_id: contentId });
      if (!rows || rows.length === 0) return null;
      return { titulo: rows[0].titulo, tipo: rows[0].tipo };
    } catch (err) {
      this.logger.warn(`No se pudo resolver titulo de content_id=${contentId}`);
      return null;
    }
  }
}