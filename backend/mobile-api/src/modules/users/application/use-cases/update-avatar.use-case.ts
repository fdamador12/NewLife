import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { MinioService } from '../../../media/minio.service';

/**
 * Caso de uso para actualizar la foto de perfil del usuario.
 *
 * Recibe la URL pública del avatar (que ya fue subido a MinIO mediante
 * POST /media/upload-avatar) y la guarda en `usuarios.avatar_url`.
 *
 * Si el usuario ya tenia un avatar previo, lo elimina de MinIO para no dejar
 * archivos huerfanos (falla silenciosamente si no se puede borrar).
 *
 * Si avatar_url viene como null o cadena vacia, se interpreta como "quitar
 * avatar", se borra el archivo previo y la columna queda en null.
 */
@Injectable()
export class UpdateAvatarUseCase {
  private readonly logger = new Logger(UpdateAvatarUseCase.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly minioService: MinioService,
  ) {}

  async execute(userId: string, avatarUrl: string | null) {
    const masterToken = await this.systemAuth.getMasterToken();

    // Buscar el registro del usuario
    const res = await this.dbService.find('usuarios', { usuario_id: userId }, masterToken);
    const rows = Array.isArray(res) ? res : (res.rows || []);

    if (rows.length === 0) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const record = rows[0];
    const previousAvatarUrl = record.avatar_url;

    // Normalizar: cadena vacia o undefined → null
    const newAvatarUrl = avatarUrl && avatarUrl.trim().length > 0 ? avatarUrl.trim() : null;

    // Actualizar la columna avatar_url
    await this.dbService.update(
      'usuarios',
      '_id',
      record._id,
      { avatar_url: newAvatarUrl },
      masterToken,
    );

    // Si habia un avatar anterior y ahora cambio, eliminar el archivo antiguo
    if (previousAvatarUrl && previousAvatarUrl !== newAvatarUrl) {
      this.logger.log(`Eliminando avatar antiguo: ${previousAvatarUrl}`);
      // Fire and forget: no esperamos porque no es critico
      this.minioService.deleteByUrl(previousAvatarUrl).catch(err => {
        this.logger.warn(`No se pudo eliminar avatar antiguo: ${err.message}`);
      });
    }

    return {
      message: newAvatarUrl
        ? 'Foto de perfil actualizada exitosamente.'
        : 'Foto de perfil eliminada.',
      avatar_url: newAvatarUrl,
    };
  }
}