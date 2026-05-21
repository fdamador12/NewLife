/**
 * Entidad del dominio que representa un evento de analiticas
 * registrado por la app movil.
 *
 * Se persiste en la tabla `analytics_events` de Roble por el mobile-api.
 * El admin-api SOLO lee de esta tabla, nunca escribe.
 *
 * IMPORTANTE: la columna en ROBLE se llama `event_category` (no `category`).
 * En el dominio admin la exponemos como `category` para mantener un nombre
 * mas limpio en el dashboard.
 */

export interface AnalyticsEventProps {
  event_id: string;
  user_id_hash: string;
  event_type: string;
  category: string;
  properties: Record<string, any> | null;
  created_at: string; // ISO 8601
}

export class AnalyticsEvent {
  readonly event_id: string;
  readonly user_id_hash: string;
  readonly event_type: string;
  readonly category: string;
  readonly properties: Record<string, any> | null;
  readonly created_at: string;

  constructor(props: AnalyticsEventProps) {
    this.event_id = props.event_id;
    this.user_id_hash = props.user_id_hash;
    this.event_type = props.event_type;
    this.category = props.category;
    this.properties = props.properties ?? null;
    this.created_at = props.created_at;
  }

  /**
   * Constructor desde una fila cruda de Roble.
   *
   * FIX: la columna en ROBLE se llama `event_category`, no `category`.
   * Mapear correctamente al construir la entidad.
   *
   * Las properties pueden venir como string JSON o como objeto.
   */
  static fromRobleRow(row: any): AnalyticsEvent {
    let properties: Record<string, any> | null = null;
    if (row.properties) {
      if (typeof row.properties === 'string') {
        try {
          properties = JSON.parse(row.properties);
        } catch {
          properties = null;
        }
      } else if (typeof row.properties === 'object') {
        properties = row.properties;
      }
    }

    return new AnalyticsEvent({
      event_id: row.event_id,
      user_id_hash: row.user_id_hash,
      event_type: row.event_type,
      // FIX: ROBLE tiene la columna `event_category`, no `category`.
      // Fallback a `category` por compatibilidad si en el futuro se renombra.
      category: row.event_category ?? row.category ?? '',
      properties,
      created_at: row.created_at,
    });
  }
}