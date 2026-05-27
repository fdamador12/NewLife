import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

// Tablas donde el ID es el UUID (sub del JWT)
const UUID_TABLES = [
  'contactos',
  'registro_diario',
  'user_pet',
  'ahorro_usuario',
  'agenda',
  'camino',
  'sobriedad',
  'frases_guardadas',
  'informacion_personal',
  'user_retos',
  'contenido_favorito',
  'zonas',
  'config_usuarios',
  // FIX 2026-05: agregar tabla de notificaciones para que se borre con la cuenta
  'user_notification_settings',
];

// Tablas donde el ID es el _id de Roble (user_id en esas tablas).
//
// FIX 2025-05: 'comunidad_usuario' (singular) era un typo que dejaba huerfanas
// las membresias del usuario en la tabla real `comunidad_usuarios` (plural).
// Verificado contra el resto del backend: TODAS las demas operaciones
// (insertar membresia, actualizar tipo de acceso, etc.) usan 'comunidad_usuarios'.
//
// FIX 2026-05 (push notifications): agregar 'push_tokens' para que al eliminar
// la cuenta no queden tokens huerfanos en la base. Esto tambien previene que
// si el robleId se reusara, el dispositivo viejo recibiera notificaciones
// del nuevo usuario.
const ROBLE_ID_TABLES = [
  'foro_respuesta_comentarios',
  'comentario_likes',
  'comunidad_usuarios',
  'solicitudes_baneo',
  'posts',
  'foros_respuestas',
  'comentarios',
  'foro_respuesta_likes',
  'mensajes_chat',
  'comentario_respuesta_likes',
  'reacciones',
  'comentario_respuestas',
  'push_tokens',  // ← NUEVO
];

/** Placeholder usado para anonimizar el nombre del usuario eliminado. */
const ANONYMIZED_NAME = '[Cuenta eliminada]';

/**
 * Caso de uso de borrado total de cuenta.
 *
 * FLUJO:
 * 1. Resuelve el _id de Roble del usuario por su usuario_id (uuid del JWT).
 * 2. Borra los datos personales de las tablas en paralelo.
 * 3. SOFT DELETE del registro en `usuarios`:
 *    - Marca estado='ELIMINADO' para bloqueo de login
 *    - Anonimiza `nombre` con placeholder (sin romper schema NOT NULL)
 *    - Guarda `deleted_at` y opcionalmente `delete_motivo`
 *
 * IMPORTANTE: NO ponemos campos a null aunque parezca natural hacerlo.
 * Razon: el schema actual tiene `nombre`, `last_login`, etc. como NOT NULL,
 * y cambiarlos a nullable rompe codigo existente que asume que NO son null
 * (LoginUseCase, getProfile, getHomeSummary, etc.).
 *
 * Estrategia anti-null:
 * - `nombre` → placeholder "[Cuenta eliminada]" (cumple GDPR + no rompe codigo)
 * - `last_login` → se conserva (no es PII identificable)
 * - Otros campos → se conservan (la cuenta no puede acceder, son inutiles)
 *
 * NOTA SOBRE NOTIFICACIONES LOCALES:
 * Las notificaciones agendadas en el DISPOSITIVO del usuario NO pueden ser
 * canceladas desde el backend. El frontend debe llamar a
 * `cancelAllScheduledNotificationsAsync()` ANTES de invocar este endpoint.
 *
 * NOTA SOBRE PUSH NOTIFICATIONS:
 * Los push_tokens se borran como parte de ROBLE_ID_TABLES. Esto significa que
 * el backend NO podra enviar mas pushes a ese dispositivo. Pero el dispositivo
 * podra registrar un nuevo token cuando otro usuario inicie sesion ahi.
 */
@Injectable()
export class DeleteAllDataUseCase {
  private readonly logger = new Logger(DeleteAllDataUseCase.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  /**
   * Borra todos los datos del usuario.
   *
   * @param usuarioUuid - usuario_id (uuid del JWT)
   * @param motivo - motivo opcional de la eliminacion (para auditoria)
   */
  async execute(usuarioUuid: string, motivo?: string): Promise<void> {
    const token = await this.systemAuth.getMasterToken();

    // 1. Resolver _id de Roble del usuario
    const result = await this.db.find('usuarios', { usuario_id: usuarioUuid }, token);
    const rows = Array.isArray(result) ? result : (result.rows ?? []);
    const usuario = rows[0];
    const robleId = usuario?._id;

    this.logger.log(`🗑️ Iniciando borrado total para uuid=${usuarioUuid} robleId=${robleId}`);

    // 2. Borrar tablas por UUID en paralelo
    const uuidDeletes = UUID_TABLES.map(async (tabla) => {
      try {
        await this.db.delete(tabla, 'usuario_id', usuarioUuid, token);
        this.logger.log(`✅ ${tabla} (uuid) borrado`);
      } catch (err: any) {
        this.logger.warn(`⚠️ ${tabla} (uuid): ${err.message}`);
      }
    });

    // 3. Borrar tablas por _id de Roble en paralelo (si se pudo resolver)
    const robleIdDeletes = robleId
      ? ROBLE_ID_TABLES.map(async (tabla) => {
          // columna varía entre usuario_id y autor_id
          const col = ['posts', 'foros_respuestas', 'comentarios',
                       'comentario_respuestas', 'foro_respuesta_comentarios',
                       'mensajes_chat'].includes(tabla)
            ? 'autor_id'
            : 'usuario_id';
          try {
            await this.db.delete(tabla, col, robleId, token);
            this.logger.log(`✅ ${tabla} (robleId) borrado`);
          } catch (err: any) {
            this.logger.warn(`⚠️ ${tabla} (robleId): ${err.message}`);
          }
        })
      : [];

    await Promise.all([...uuidDeletes, ...robleIdDeletes]);

    // 4. SOFT DELETE del registro principal en `usuarios`.
    if (robleId) {
      try {
        const updatePayload: Record<string, any> = {
          estado: 'ELIMINADO',
          nombre: ANONYMIZED_NAME,
          deleted_at: new Date().toISOString(),
        };

        if (motivo) {
          updatePayload.delete_motivo = motivo;
        }

        await this.db.update('usuarios', '_id', robleId, updatePayload, token);
        this.logger.log(
          `✅ usuarios marcado como ELIMINADO y anonimizado` +
          (motivo ? ` motivo="${motivo}"` : ''),
        );
      } catch (err: any) {
        this.logger.error(
          `❌ CRITICO: no se pudo marcar usuario como ELIMINADO. ` +
          `La cuenta puede ser reactivable. Error: ${err.message}`,
        );
        throw err;
      }
    } else {
      this.logger.warn(`⚠️ No se encontro robleId para uuid=${usuarioUuid}, no se pudo hacer soft delete`);
    }

    this.logger.log(`🎉 Borrado total completado para ${usuarioUuid}`);
  }
}