/**
 * Lista blanca de eventos validos del sistema de analytics.
 *
 * SINCRONIZACION CRITICA: este archivo debe ser identico (en valores) a su
 * gemelo del frontend.
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
  // Meditaciones
  'guided_meditation_started',
  'guided_meditation_completed',
  // Frases
  'daily_phrase_viewed',
  'daily_phrase_favorited',
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
] as const;

export type ValidEventType = (typeof VALID_EVENT_TYPES_LIST)[number];

/**
 * Set para validacion O(1) en el use case.
 */
export const VALID_EVENT_TYPES: ReadonlySet<string> = new Set(VALID_EVENT_TYPES_LIST);

/**
 * Mapeo automatico de event_type a category.
 */
export const EVENT_TYPE_TO_CATEGORY: Record<ValidEventType, string> = {
  app_opened: 'session',
  user_logged_in: 'session',
  user_logged_out: 'session',
  screen_viewed: 'navigation',
  tab_switched: 'navigation',
  sos_triggered: 'crisis',
  sos_option_selected: 'crisis',
  breathing_exercise_started: 'crisis',
  breathing_exercise_completed: 'crisis',
  zen_mode_entered: 'crisis',
  guided_meditation_started: 'content',
  guided_meditation_completed: 'content',
  daily_phrase_viewed: 'content',
  daily_phrase_favorited: 'content',
  content_list_viewed: 'content',
  content_viewed: 'content',
  content_favorited: 'content',
  content_searched: 'content',
  favorites_list_viewed: 'content',
  support_group_list_viewed: 'care',
  support_group_viewed: 'care',
  support_group_contacted: 'care',
  emergency_contacts_viewed: 'care',
  emergency_contact_used: 'care',
  agenda_viewed: 'care',
  agenda_event_created: 'care',
  pet_viewed: 'gamification',
  pet_evolved: 'gamification',
  daily_checkin_started: 'progress',
  daily_checkin_completed: 'progress',
  level_path_viewed: 'progress',
  level_started: 'progress',
  level_completed: 'progress',
  level_abandoned: 'progress',
  savings_viewed: 'progress',
  gratitude_history_viewed: 'progress',
  personal_analytics_viewed: 'progress',
  challenge_list_viewed: 'gamification',
  challenge_viewed: 'gamification',
  challenge_joined: 'gamification',
  challenge_completed: 'gamification',
};