import { AnalyticsEvent } from '../entities/analytics-event.entity';

/**
 * Puerto que abstrae la persistencia de eventos de analytics.
 *
 * Para mobile-api solo nos interesa SAVE (ingesta).
 * Las operaciones de consulta (findAll con filtros, agregaciones, etc.)
 * viven en admin-api con su propia implementación de este mismo puerto.
 */
export interface IAnalyticsStoragePort {
  /**
   * Persiste un evento en el almacenamiento.
   * @param event Evento ya hasheado y validado, listo para guardar
   * @param token Token de autenticación para ROBLE (master token)
   */
  save(event: AnalyticsEvent, token: string): Promise<void>;
}

/**
 * Símbolo de inyección para el puerto.
 * Lo usamos con @Inject(ANALYTICS_STORAGE_PORT) en use cases.
 */
export const ANALYTICS_STORAGE_PORT = 'IAnalyticsStoragePort';