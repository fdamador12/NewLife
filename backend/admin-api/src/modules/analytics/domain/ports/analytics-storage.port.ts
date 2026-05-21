import { AnalyticsEvent } from '../entities/analytics-event.entity';

/**
 * Token de inyeccion para el adaptador.
 */
export const ANALYTICS_STORAGE_PORT = Symbol('ANALYTICS_STORAGE_PORT');

/**
 * Filtros opcionales para leer eventos.
 *
 * IMPORTANTE: Roble no soporta filtros de rango nativamente (>=, <=).
 * El adapter trae TODOS los eventos y filtra en memoria.
 * Si la tabla crece mucho, optimizar con paginacion en Roble.
 */
export interface AnalyticsQueryFilters {
  /** Fecha desde (ISO 8601). Filtrado en memoria. */
  from?: string;
  /** Fecha hasta (ISO 8601). Filtrado en memoria. */
  to?: string;
  /** Tipos de evento a incluir. Si esta vacio, trae todos. */
  eventTypes?: string[];
  /** Categorias a incluir. */
  categories?: string[];
  /** user_id_hash especifico (para ver eventos de un usuario). */
  userIdHash?: string;
}

/**
 * Puerto del adapter que lee eventos de analiticas.
 * Solo lectura: el admin-api nunca escribe en esta tabla.
 */
export interface IAnalyticsStoragePort {
  /**
   * Lee eventos aplicando filtros en memoria.
   * Devuelve los eventos ordenados por created_at DESC (mas recientes primero).
   */
  findEvents(filters?: AnalyticsQueryFilters): Promise<AnalyticsEvent[]>;

  /**
   * Invalida el cache (uso futuro: cuando se quiera forzar refresh).
   */
  invalidateCache(): void;
}