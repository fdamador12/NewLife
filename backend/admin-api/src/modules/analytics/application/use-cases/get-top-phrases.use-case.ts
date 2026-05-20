import { Injectable, Inject, Logger } from '@nestjs/common';
import { ANALYTICS_STORAGE_PORT } from '../../domain/ports/analytics-storage.port';
import type { IAnalyticsStoragePort } from '../../domain/ports/analytics-storage.port';
import { RobleHttpService } from '../../../admin/infrastructure/services/roble-http.service';
import { resolveDateRange } from './helpers/date-range.helper';

export interface TopPhrasesInput {
  from?: string;
  to?: string;
  /** Cuantos top devolver. Default 10, max 50. */
  limit?: number;
}

export interface TopPhraseItem {
  phrase_id: string;
  /** Texto de la frase. Null si fue eliminada. */
  text: string | null;
  /** Cantidad de veces que se marco como favorita */
  favorites: number;
  /** Usuarios unicos que la favoritearon */
  unique_users: number;
}

export interface TopPhrasesResult {
  items: TopPhraseItem[];
  /** Total de eventos daily_phrase_favorited en el rango */
  total_favorites: number;
  range: { from: string; to: string };
}

const FRASES_TABLE = 'frases_dia';

/**
 * Top de frases mas favoriteadas en el rango.
 * Cuenta eventos `daily_phrase_favorited` agrupando por phrase_id en properties.
 * Resuelve textos desde la tabla `frases_dia`.
 *
 * NOTA: frases_dia son las mismas frases motivacionales. La diferencia es
 * el contexto donde se ven (pantalla de frase del dia vs lista en Cuidado
 * vs lista en SOS). El evento daily_phrase_favorited se trackea desde
 * cualquiera de esas pantallas.
 */
@Injectable()
export class GetTopPhrasesUseCase {
  private readonly logger = new Logger(GetTopPhrasesUseCase.name);

  constructor(
    @Inject(ANALYTICS_STORAGE_PORT)
    private readonly storage: IAnalyticsStoragePort,
    private readonly roble: RobleHttpService,
  ) {}

  async execute(input: TopPhrasesInput = {}): Promise<TopPhrasesResult> {
    const range = resolveDateRange(input.from, input.to);
    const limit = Math.min(input.limit ?? 10, 50);

    // 1. Traer eventos daily_phrase_favorited del rango
    const events = await this.storage.findEvents({
      from: range.fromIso,
      to: range.toIso,
      eventTypes: ['daily_phrase_favorited'],
    });

    // 2. Agrupar por phrase_id (en properties)
    const counts = new Map<string, { favorites: number; users: Set<string> }>();
    for (const event of events) {
      const phraseId = event.properties?.phrase_id as string | undefined;
      if (!phraseId) continue;

      const bucket = counts.get(phraseId) ?? { favorites: 0, users: new Set() };
      bucket.favorites++;
      bucket.users.add(event.user_id_hash);
      counts.set(phraseId, bucket);
    }

    // 3. Ordenar DESC por favorites y tomar top N
    const topIds = Array.from(counts.entries())
      .sort((a, b) => b[1].favorites - a[1].favorites)
      .slice(0, limit);

    // 4. Lookup en paralelo de los textos
    const items: TopPhraseItem[] = await Promise.all(
      topIds.map(async ([phraseId, stats]) => {
        const text = await this.fetchPhraseText(phraseId);
        return {
          phrase_id: phraseId,
          text,
          favorites: stats.favorites,
          unique_users: stats.users.size,
        };
      }),
    );

    return {
      items,
      total_favorites: events.length,
      range: { from: range.fromIso, to: range.toIso },
    };
  }

  /**
   * Resuelve el texto de una frase desde Roble.
   * Devuelve null si fue eliminada.
   */
  private async fetchPhraseText(phraseId: string): Promise<string | null> {
    try {
      const rows = await this.roble.dbRead<any[]>(FRASES_TABLE, { frase_id: phraseId });
      if (!rows || rows.length === 0) return null;
      return rows[0].frase ?? null;
    } catch (err) {
      this.logger.warn(`No se pudo resolver texto de phrase_id=${phraseId}`);
      return null;
    }
  }
}