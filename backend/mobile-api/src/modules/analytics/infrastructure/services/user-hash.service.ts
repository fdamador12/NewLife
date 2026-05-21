import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createHash } from 'crypto';

/**
 * Servicio que hashea identificadores de usuario antes de persistirlos
 * en analytics, para cumplir con la Ley 1581/2012 de Colombia (datos
 * sensibles de salud).
 *
 * Características del hash:
 * - Determinista: mismo user_id siempre genera el mismo hash
 *   → permite medir retención y comportamiento individual
 * - Irreversible: sin la sal secreta, no se puede recuperar el user_id
 *   → si se filtra la BD, los datos no son re-identificables
 * - Estable: la sal NUNCA debe cambiar (cambiarla invalida los hashes anteriores)
 *
 * La sal se lee desde la variable de entorno ANALYTICS_SALT.
 * Generar con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
 */
@Injectable()
export class UserHashService implements OnModuleInit {
  private readonly logger = new Logger(UserHashService.name);
  private salt: string | undefined;

  onModuleInit() {
    this.salt = process.env.ANALYTICS_SALT;
    if (!this.salt) {
      this.logger.error(
        '⚠️ ANALYTICS_SALT no está configurado. El módulo de analytics NO funcionará.',
      );
    } else if (this.salt.length < 32) {
      this.logger.warn(
        '⚠️ ANALYTICS_SALT es muy corto (< 32 caracteres). Se recomienda usar 64+ caracteres aleatorios.',
      );
    }
  }

  /**
   * Hashea un user_id usando SHA-256 con la sal secreta.
   *
   * @param userId El user_id real del usuario (UUID de ROBLE)
   * @returns Hash de 64 caracteres hexadecimales
   * @throws Error si la sal no está configurada
   */
  hashUserId(userId: string): string {
    if (!this.salt) {
      throw new Error(
        'ANALYTICS_SALT no está configurado. No se puede hashear el user_id.',
      );
    }

    if (!userId || typeof userId !== 'string') {
      throw new Error('user_id inválido para hashear');
    }

    return createHash('sha256').update(userId + this.salt).digest('hex');
  }
}