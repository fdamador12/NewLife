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
];

// Tablas donde el ID es el _id de Roble (user_id en esas tablas)
const ROBLE_ID_TABLES = [
  'foro_respuesta_comentarios',
  'comentario_likes',
  'comunidad_usuario',
  'solicitudes_baneo',
  'posts',
  'foros_respuestas',
  'comentarios',
  'foro_respuesta_likes',
  'mensajes_chat',
  'comentario_respuesta_likes',
  'reacciones',
  'comentario_respuestas',
];

@Injectable()
export class DeleteAllDataUseCase {
  private readonly logger = new Logger(DeleteAllDataUseCase.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioUuid: string): Promise<void> {
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

    // 4. Borrar el registro principal de usuarios al final
    try {
      if (robleId) {
        await this.db.delete('usuarios', '_id', robleId, token);
        this.logger.log(`✅ usuarios borrado`);
      }
    } catch (err: any) {
      this.logger.warn(`⚠️ usuarios: ${err.message}`);
    }

    this.logger.log(`🎉 Borrado total completado para ${usuarioUuid}`);
  }
}