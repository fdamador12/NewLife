/**
 * Lista de tipos de eventos validos para consultar metricas.
 *
 * IMPORTANTE: este archivo es ESPEJO del catalogo en mobile-api:
 * `backend/mobile-api/src/modules/analytics/domain/constants/event-types.constant.ts`
 *
 * El admin-api NO valida eventos al insertar (no inserta, solo lee).
 * Esta lista se usa para:
 * - Validar parametros de query (filtrar por event_type)
 * - Conocer las categorias de eventos
 * - Type safety en use cases
 */

export const ANALYTICS_EVENTS_TABLE = 'analytics_events';

export const VALID_EVENT_TYPES_LIST = [
  // Sesion
  'app_opened',
  'user_logged_in',
  'user_logged_out',
  // Navegacion
  'screen_viewed',
  'tab_switched',
  // Crisis
  'sos_triggered',
  'sos_option_selected',
  'breathing_exercise_started',
  'breathing_exercise_completed',
  'zen_mode_entered',
  'crisis_phrases_viewed',
  // Meditaciones
  'guided_meditation_started',
  'guided_meditation_completed',
  // Frases
  'daily_phrase_viewed',
  'daily_phrase_favorited',
  'motivational_list_viewed',
  // Contenido
  'content_list_viewed',
  'content_viewed',
  'content_favorited',
  'content_searched',
  'favorites_list_viewed',
  // Grupos
  'support_group_list_viewed',
  'support_group_viewed',
  'support_group_contacted',
  // Contactos
  'emergency_contacts_viewed',
  'emergency_contact_used',
  // Agenda
  'agenda_viewed',
  'agenda_event_created',
  // Mascota
  'pet_viewed',
  'pet_evolved',
  // Checkin
  'daily_checkin_started',
  'daily_checkin_completed',
  'daily_checkin_abandoned',
  // Niveles
  'level_path_viewed',
  'level_started',
  'level_completed',
  'level_abandoned',
  // Ahorro
  'savings_viewed',
  // Gratitud
  'gratitude_history_viewed',
  // Analiticas
  'personal_analytics_viewed',
  // Retos
  'challenge_list_viewed',
  'challenge_viewed',
  'challenge_joined',
  'challenge_completed',
  // Medallas
  'medals_viewed',
] as const;

export type ValidEventType = (typeof VALID_EVENT_TYPES_LIST)[number];

export const VALID_EVENT_TYPES: ReadonlySet<string> = new Set(VALID_EVENT_TYPES_LIST);

/**
 * Categorias de eventos. Util para agruparlos en el dashboard.
 */
export const EVENT_CATEGORIES = [
  'session',
  'navigation',
  'crisis',
  'content',
  'care',
  'gamification',
  'progress',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];