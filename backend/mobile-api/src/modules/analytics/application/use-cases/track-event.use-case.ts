import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  ANALYTICS_STORAGE_PORT,
  IAnalyticsStoragePort,
} from '../../domain/ports/analytics-storage.port';
import { AnalyticsEvent } from '../../domain/entities/analytics-event.entity';
import {
  EVENT_TYPE_TO_CATEGORY,
  VALID_EVENT_TYPES,
} from '../../domain/constants/event-types.constant';
import { UserHashService } from '../../infrastructure/services/user-hash.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

export interface TrackEventInput {
  /** user_id real del usuario (UUID de ROBLE). El use case lo hashea. */
  userId: string;
  /** Tipo del evento. Debe estar en la lista blanca VALID_EVENT_TYPES. */
  eventType: string;
  /** ID de sesión opcional (agrupa eventos de la misma sesión). */
  sessionId?: string;
  /** Versión de la app cliente (ej: "1.0.0"). */
  appVersion?: string;
  /** Datos contextuales adicionales del evento. */
  properties?: Record<string, unknown>;
}

/**
 * Caso de uso: registrar un evento de analytics.
 *
 * Flujo:
 * 1. Valida que el event_type esté en la lista blanca
 * 2. Hashea el user_id con la sal secreta
 * 3. Asigna automáticamente la categoría según el tipo
 * 4. Genera event_id (UUID v4) y timestamp
 * 5. Persiste vía el puerto de storage usando el master token del sistema
 *
 * Decisión técnica: usamos el master token (no el del usuario) para insertar
 * porque la tabla `analytics_events` no tiene RLS específica por usuario.
 * El usuario nunca lee esta tabla; solo escribe.
 */
@Injectable()
export class TrackEventUseCase {
  private readonly logger = new Logger(TrackEventUseCase.name);

  constructor(
    @Inject(ANALYTICS_STORAGE_PORT)
    private readonly storage: IAnalyticsStoragePort,
    private readonly userHash: UserHashService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(input: TrackEventInput): Promise<{ event_id: string }> {
    // 1. Validar event_type contra la lista blanca
    if (!VALID_EVENT_TYPES.has(input.eventType)) {
      throw new BadRequestException(
        `Tipo de evento no permitido: "${input.eventType}".`,
      );
    }

    // 2. Verificar que el ANALYTICS_SALT esté configurado
    //    (lanza si no — fail fast)
    let userIdHash: string;
    try {
      userIdHash = this.userHash.hashUserId(input.userId);
    } catch (err: any) {
      this.logger.error('No se pudo hashear el user_id:', err?.message);
      // No exponemos el detalle al cliente
      throw new BadRequestException('Configuración de analytics inválida');
    }

    // 3. Asignar categoría desde el mapa (no confiamos en lo que mande el cliente)
    const eventCategory = EVENT_TYPE_TO_CATEGORY[input.eventType];

    // 4. Construir la entidad
    const event = new AnalyticsEvent({
      event_id: uuidv4(),
      event_type: input.eventType,
      event_category: eventCategory,
      user_id_hash: userIdHash,
      session_id: input.sessionId ?? null,
      app_version: input.appVersion ?? null,
      properties: input.properties ?? null,
      created_at: new Date().toISOString(),
    });

    // 5. Persistir usando master token (system-level write)
    const masterToken = await this.systemAuth.getMasterToken();
    await this.storage.save(event, masterToken);

    return { event_id: event.event_id };
  }
}