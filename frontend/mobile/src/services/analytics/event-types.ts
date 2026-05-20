/**
 * Lista de tipos de eventos de analytics.
 *
 * IMPORTANTE: este archivo debe estar SINCRONIZADO con su gemelo en backend:
 * `backend/mobile-api/src/modules/analytics/domain/constants/event-types.constant.ts`
 */

export const EVENT_TYPES = {
  // Sesion y autenticacion
  APP_OPENED: 'app_opened',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',

  // Navegacion general
  SCREEN_VIEWED: 'screen_viewed',
  TAB_SWITCHED: 'tab_switched',

  // Crisis y SOS
  SOS_TRIGGERED: 'sos_triggered',
  SOS_OPTION_SELECTED: 'sos_option_selected',
  BREATHING_EXERCISE_STARTED: 'breathing_exercise_started',
  BREATHING_EXERCISE_COMPLETED: 'breathing_exercise_completed',
  ZEN_MODE_ENTERED: 'zen_mode_entered',
  // NUEVO: trackea cuando se accede a frases motivacionales desde el SOS
  CRISIS_PHRASES_VIEWED: 'crisis_phrases_viewed',

  // Meditaciones guiadas
  GUIDED_MEDITATION_STARTED: 'guided_meditation_started',
  GUIDED_MEDITATION_COMPLETED: 'guided_meditation_completed',

  // Frases diarias
  // DAILY_PHRASE_VIEWED ahora NO lleva phrase_id porque la pantalla muestra
  // la frase del dia + lista de favoritas. Atribuir a un solo id es enganoso.
  DAILY_PHRASE_VIEWED: 'daily_phrase_viewed',
  DAILY_PHRASE_FAVORITED: 'daily_phrase_favorited',
  // NUEVO: trackea cuando se accede a la lista completa de frases en Cuidado
  MOTIVATIONAL_LIST_VIEWED: 'motivational_list_viewed',

  // Contenido educativo
  CONTENT_LIST_VIEWED: 'content_list_viewed',
  CONTENT_VIEWED: 'content_viewed',
  CONTENT_FAVORITED: 'content_favorited',
  CONTENT_SEARCHED: 'content_searched',
  FAVORITES_LIST_VIEWED: 'favorites_list_viewed',

  // Grupos de apoyo
  SUPPORT_GROUP_LIST_VIEWED: 'support_group_list_viewed',
  SUPPORT_GROUP_VIEWED: 'support_group_viewed',
  SUPPORT_GROUP_CONTACTED: 'support_group_contacted',

  // Contactos de emergencia
  EMERGENCY_CONTACTS_VIEWED: 'emergency_contacts_viewed',
  EMERGENCY_CONTACT_USED: 'emergency_contact_used',

  // Agenda
  AGENDA_VIEWED: 'agenda_viewed',
  AGENDA_EVENT_CREATED: 'agenda_event_created',

  // Mascota
  PET_VIEWED: 'pet_viewed',
  PET_EVOLVED: 'pet_evolved',

  // Checkin diario
  DAILY_CHECKIN_STARTED: 'daily_checkin_started',
  DAILY_CHECKIN_COMPLETED: 'daily_checkin_completed',
  DAILY_CHECKIN_ABANDONED: 'daily_checkin_abandoned',

  // Niveles / 12 pasos
  LEVEL_PATH_VIEWED: 'level_path_viewed',
  LEVEL_STARTED: 'level_started',
  LEVEL_COMPLETED: 'level_completed',
  LEVEL_ABANDONED: 'level_abandoned',

  // Ahorro
  SAVINGS_VIEWED: 'savings_viewed',

  // Gratitud
  GRATITUDE_HISTORY_VIEWED: 'gratitude_history_viewed',

  // Analiticas personales
  PERSONAL_ANALYTICS_VIEWED: 'personal_analytics_viewed',

  // Retos
  CHALLENGE_LIST_VIEWED: 'challenge_list_viewed',
  CHALLENGE_VIEWED: 'challenge_viewed',
  CHALLENGE_JOINED: 'challenge_joined',
  CHALLENGE_COMPLETED: 'challenge_completed',

  // Medallas / Logros
  MEDALS_VIEWED: 'medals_viewed',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

/**
 * Opciones del menu SOS.
 */
export const SOS_OPTIONS = {
  EMERGENCY_CONTACTS: 'emergency_contacts',
  CRISIS_MODE: 'crisis_mode',
  BREATHING: 'breathing',
  MOTIVATIONAL_PHRASES: 'motivational_phrases',
  GUIDED_MEDITATION: 'guided_meditation',
} as const;

export type SosOption = (typeof SOS_OPTIONS)[keyof typeof SOS_OPTIONS];

/**
 * Metodos de contacto para grupos de apoyo y contactos de emergencia.
 */
export const CONTACT_METHODS = {
  PHONE: 'phone',
  WHATSAPP: 'whatsapp',
  SMS: 'sms',
  EMAIL: 'email',
  WEBSITE: 'website',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  COMMUNITY: 'community',
} as const;

export type ContactMethod = (typeof CONTACT_METHODS)[keyof typeof CONTACT_METHODS];