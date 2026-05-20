import { Injectable, Inject } from '@nestjs/common';
import { ANALYTICS_STORAGE_PORT } from '../../domain/ports/analytics-storage.port';
import type { IAnalyticsStoragePort } from '../../domain/ports/analytics-storage.port';

export interface LevelDistributionInput {
  // Sin filtros: siempre calcula sobre TODO el historial para saber el nivel
  // actual de cada usuario.
}

export interface LevelCell {
  level: number;
  sublevel: number;
  /** Usuarios trabajando actualmente en este (nivel, sublevel) */
  users_in_progress: number;
  /** Usuarios que ya completaron este (nivel, sublevel) */
  users_completed: number;
}

export interface LevelSummary {
  level: number;
  /** Suma de usuarios que han completado al menos un sublevel de este nivel */
  users_reached: number;
  /** Usuarios que completaron LOS 3 sublevels del nivel */
  users_completed: number;
}

export interface LevelDistributionResult {
  /** Matriz 12 x 3 con detalle por celda */
  matrix: LevelCell[];
  /** Resumen por nivel (1-12) */
  by_level: LevelSummary[];
  /** Total de usuarios que han iniciado al menos un modulo */
  total_users_with_progress: number;
  /** Nivel mas avanzado alcanzado por algun usuario */
  highest_level_reached: number;
}

const TOTAL_LEVELS = 12;
const SUBLEVELS_PER_LEVEL = 3;

/**
 * Distribucion de usuarios por nivel en el programa de 12 pasos.
 *
 * Para cada usuario, calcula su (nivel, sublevel) actual:
 * - Si nunca completo nada → nivel 1, sublevel 1 (esta empezando)
 * - Si su ultimo completed fue (N, M) → esta trabajando en el siguiente
 *
 * Sin rango de fechas: siempre se calcula sobre el historial completo,
 * porque queremos saber el ESTADO ACTUAL de los usuarios.
 *
 * NO trackeamos a usuarios que solo entraron al path pero nunca completaron
 * un modulo (esos no tienen progreso real).
 */
@Injectable()
export class GetLevelDistributionUseCase {
  constructor(
    @Inject(ANALYTICS_STORAGE_PORT)
    private readonly storage: IAnalyticsStoragePort,
  ) {}

  async execute(_input: LevelDistributionInput = {}): Promise<LevelDistributionResult> {
    // 1. Traer TODOS los eventos level_completed (historial completo)
    const events = await this.storage.findEvents({
      eventTypes: ['level_completed'],
    });

    // 2. Para cada usuario, encontrar su modulo MAS ALTO completado.
    // "Mas alto" se mide como: level * 100 + sublevel
    // Ej: (3, 2) = 302, (3, 3) = 303, (4, 1) = 401
    const userHighest = new Map<string, { level: number; sublevel: number; score: number }>();

    for (const event of events) {
      const level = Number(event.properties?.level);
      const sublevel = Number(event.properties?.sublevel);
      if (!level || !sublevel) continue;

      const score = level * 100 + sublevel;
      const current = userHighest.get(event.user_id_hash);

      if (!current || score > current.score) {
        userHighest.set(event.user_id_hash, { level, sublevel, score });
      }
    }

    // 3. Construir matriz 12 x 3 contando usuarios "en progreso" en cada celda.
    // Un usuario esta EN PROGRESO en la celda SIGUIENTE a la ultima completada.
    const matrix: LevelCell[] = [];
    for (let level = 1; level <= TOTAL_LEVELS; level++) {
      for (let sublevel = 1; sublevel <= SUBLEVELS_PER_LEVEL; sublevel++) {
        let usersInProgress = 0;
        let usersCompleted = 0;

        for (const [, highest] of userHighest.entries()) {
          // Completed: el usuario ya termino este modulo o uno superior
          const cellScore = level * 100 + sublevel;
          if (highest.score >= cellScore) {
            usersCompleted++;
          }

          // In progress: el usuario completo el modulo anterior y NO este
          const nextScore = this.getNextScore(highest.level, highest.sublevel);
          if (nextScore === cellScore) {
            usersInProgress++;
          }
        }

        matrix.push({
          level,
          sublevel,
          users_in_progress: usersInProgress,
          users_completed: usersCompleted,
        });
      }
    }

    // 4. Resumen por nivel (agregado de los 3 sublevels)
    const byLevel: LevelSummary[] = [];
    for (let level = 1; level <= TOTAL_LEVELS; level++) {
      let usersReached = 0;
      let usersCompleted = 0;

      for (const [, highest] of userHighest.entries()) {
        // Reached: completo al menos un sublevel del nivel o superior
        if (highest.level >= level) {
          usersReached++;
        }
        // Completed: completo los 3 sublevels del nivel
        const fullLevelScore = level * 100 + SUBLEVELS_PER_LEVEL;
        if (highest.score >= fullLevelScore) {
          usersCompleted++;
        }
      }

      byLevel.push({ level, users_reached: usersReached, users_completed: usersCompleted });
    }

    // 5. Nivel mas alto alcanzado
    let highestLevelReached = 0;
    for (const [, highest] of userHighest.entries()) {
      if (highest.level > highestLevelReached) {
        highestLevelReached = highest.level;
      }
    }

    return {
      matrix,
      by_level: byLevel,
      total_users_with_progress: userHighest.size,
      highest_level_reached: highestLevelReached,
    };
  }

  /**
   * Calcula el score del siguiente modulo despues de (level, sublevel).
   * Si esta en (3, 3) → siguiente es (4, 1) → score 401
   * Si esta en (3, 2) → siguiente es (3, 3) → score 303
   */
  private getNextScore(level: number, sublevel: number): number {
    if (sublevel < SUBLEVELS_PER_LEVEL) {
      return level * 100 + (sublevel + 1);
    }
    // Termino los 3 sublevels: siguiente nivel, sublevel 1
    if (level < TOTAL_LEVELS) {
      return (level + 1) * 100 + 1;
    }
    // Termino el nivel 12, sublevel 3: completo todo
    return Infinity;
  }
}