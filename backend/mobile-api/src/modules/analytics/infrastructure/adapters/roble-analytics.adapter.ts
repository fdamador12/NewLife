import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { IAnalyticsStoragePort } from '../../domain/ports/analytics-storage.port';
import { AnalyticsEvent } from '../../domain/entities/analytics-event.entity';
import { ANALYTICS_EVENTS_TABLE } from '../../domain/constants/event-types.constant';

/**
 * Implementación del puerto de almacenamiento usando ROBLE.
 *
 * Para mobile-api solo necesitamos SAVE (insertar). Las consultas
 * agregadas viven en admin-api.
 */
@Injectable()
export class RobleAnalyticsAdapter implements IAnalyticsStoragePort {
  private readonly logger = new Logger(RobleAnalyticsAdapter.name);

  constructor(private readonly dbService: DatabaseService) {}

  async save(event: AnalyticsEvent, token: string): Promise<void> {
    try {
      // ROBLE espera arrays para insert. La tabla tiene `properties` como JSONB,
      // así que mandamos el objeto tal cual y ROBLE lo serializa.
      const record = {
        event_id: event.event_id,
        event_type: event.event_type,
        event_category: event.event_category,
        user_id_hash: event.user_id_hash,
        session_id: event.session_id,
        app_version: event.app_version,
        properties: event.properties ?? {},
        created_at: event.created_at,
      };

      await this.dbService.insert(ANALYTICS_EVENTS_TABLE, [record], token);
    } catch (error: any) {
      // No lanzamos: si el insert falla, no queremos que el usuario reciba un 500
      // por algo que es solo telemetría. Loggeamos para auditoría.
      this.logger.error(
        `Error al guardar evento ${event.event_type}:`,
        error?.message ?? error,
      );
    }
  }
}