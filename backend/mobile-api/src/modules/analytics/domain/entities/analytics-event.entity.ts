/**
 * Entidad que representa un evento de analytics.
 *
 * Las propiedades reflejan la estructura de la tabla `analytics_events` en ROBLE.
 * Note que no incluimos `_id` (el de ROBLE) porque no lo usamos a nivel de dominio;
 * usamos `event_id` (UUID v4) como identificador propio.
 */
export interface AnalyticsEventProps {
  event_id: string;
  event_type: string;
  event_category: string;
  user_id_hash: string;
  session_id?: string | null;
  app_version?: string | null;
  properties?: Record<string, unknown> | null;
  created_at: string;
}

export class AnalyticsEvent {
  readonly event_id: string;
  readonly event_type: string;
  readonly event_category: string;
  readonly user_id_hash: string;
  readonly session_id: string | null;
  readonly app_version: string | null;
  readonly properties: Record<string, unknown> | null;
  readonly created_at: string;

  constructor(props: AnalyticsEventProps) {
    this.event_id = props.event_id;
    this.event_type = props.event_type;
    this.event_category = props.event_category;
    this.user_id_hash = props.user_id_hash;
    this.session_id = props.session_id ?? null;
    this.app_version = props.app_version ?? null;
    this.properties = props.properties ?? null;
    this.created_at = props.created_at;
  }
}