import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { IMotivationProviderPort, SobrietyRecord, CaminoRecord } from '../../domain/ports/motivation-provider.port';
import { FraseDiaEntity, FraseGuardadaEntity } from '../../domain/entities/frase.entity';
import { ChallengeEntity } from '../../domain/entities/challenge.entity';
import { UserChallengeEntity } from '../../domain/entities/user-challenge.entity';

@Injectable()
export class RobleMotivationAdapter implements IMotivationProviderPort {
  constructor(private readonly dbService: DatabaseService) {}

  async getFraseDelDia(fecha: string, masterToken: string): Promise<FraseDiaEntity | null> {
    const result = await this.dbService.find('frases_dia', { dia: fecha }, masterToken);
    const rows = Array.isArray(result) ? result : (result?.rows ?? []);
    return rows[0] ?? null;
  }

  async getFraseById(fraseId: string, masterToken: string): Promise<FraseDiaEntity | null> {
    const result = await this.dbService.find('frases_dia', { frase_id: fraseId }, masterToken);
    const rows = Array.isArray(result) ? result : (result?.rows ?? []);
    return rows[0] ?? null;
  }

  async getFrasesPorFecha(fecha: string, masterToken: string): Promise<FraseDiaEntity[]> {
    try {
      const result = await this.dbService.find('frases_dia', {}, masterToken);
      const todasLasFrases = Array.isArray(result) ? result : (result?.rows ?? []);
      const frasesFiltradas = todasLasFrases.filter(
        (f: FraseDiaEntity) => f.dia <= fecha
      );
      return frasesFiltradas.sort(
        (a: FraseDiaEntity, b: FraseDiaEntity) =>
          new Date(b.dia).getTime() - new Date(a.dia).getTime()
      );
    } catch (error) {
      console.error('❌ Error en getFrasesPorFecha:', error);
      return [];
    }
  }

  async getFrasesGuardadas(usuarioId: string, userToken: string): Promise<FraseGuardadaEntity[]> {
    const result = await this.dbService.find('frases_guardadas', { usuario_id: usuarioId }, userToken);
    return Array.isArray(result) ? result : (result?.rows ?? []);
  }

  async isFraseGuardada(usuarioId: string, fraseId: string, userToken: string): Promise<boolean> {
    const result = await this.dbService.find('frases_guardadas', { usuario_id: usuarioId, frase_id: fraseId }, userToken);
    const rows = Array.isArray(result) ? result : (result?.rows ?? []);
    return rows.length > 0;
  }

  async guardarFrase(usuarioId: string, fraseId: string, userToken: string): Promise<any> {
    return await this.dbService.insert('frases_guardadas', [{ usuario_id: usuarioId, frase_id: fraseId }], userToken);
  }

  async desguardarFrase(recordId: string, userToken: string): Promise<any> {
    return await this.dbService.delete('frases_guardadas', '_id', recordId, userToken);
  }

  async getPublishedChallenges(token: string): Promise<ChallengeEntity[]> {
    const result = await this.dbService.find('retos', { estado: 'PUBLISHED' }, token);
    const rows = Array.isArray(result) ? result : (result?.rows ?? []);
    return rows.map((r: any) => new ChallengeEntity(r));
  }

  async getChallengeById(retoId: string, token: string): Promise<ChallengeEntity | null> {
    const result = await this.dbService.find('retos', { reto_id: retoId }, token);
    const rows = Array.isArray(result) ? result : (result?.rows ?? []);
    return rows.length ? new ChallengeEntity(rows[0]) : null;
  }

  async getUserChallenges(usuarioId: string, token: string): Promise<UserChallengeEntity[]> {
    const result = await this.dbService.find('user_retos', { usuario_id: usuarioId }, token);
    const rows = Array.isArray(result) ? result : (result?.rows ?? []);
    return rows.map((r: any) => new UserChallengeEntity(r));
  }

  async getActiveUserChallenges(usuarioId: string, token: string): Promise<UserChallengeEntity[]> {
    const result = await this.dbService.find('user_retos', { usuario_id: usuarioId, estado: 'ACTIVE' }, token);
    const rows = Array.isArray(result) ? result : (result?.rows ?? []);
    return rows.map((r: any) => new UserChallengeEntity(r));
  }

  async startChallenge(data: Partial<UserChallengeEntity>, masterToken: string): Promise<UserChallengeEntity> {
    const now = new Date().toISOString();
    const fechaArranque = data.fecha_inicio || now;
    const result = await this.dbService.insert('user_retos', [{
      user_reto_id: data.user_reto_id,
      usuario_id: data.usuario_id,
      reto_id: data.reto_id,
      estado: data.estado,
      progreso_actual: data.progreso_actual,
      fecha_inicio: fechaArranque,
      fecha_completado: data.estado === 'COMPLETED' ? now : null,
      xp_reclamado: false,
      updated_at: now,
    }], masterToken);
    return new UserChallengeEntity(result.inserted[0]);
  }

  async updateChallengeProgress(
    userRetoId: string,
    progreso: number,
    estado: string,
    masterToken: string,
    nuevaFechaInicio?: string,
  ): Promise<void> {
    const updates: any = {
      progreso_actual: progreso,
      estado: estado,
      updated_at: new Date().toISOString(),
    };

    if (estado === 'COMPLETED') {
      updates.fecha_completado = new Date().toISOString();
    }

    if (nuevaFechaInicio) {
      updates.fecha_inicio = nuevaFechaInicio;
      updates.xp_reclamado = false;
    }

    await this.dbService.update('user_retos', 'user_reto_id', userRetoId, updates, masterToken);
  }

  async getSobrietyRecord(usuarioId: string, masterToken: string): Promise<SobrietyRecord | null> {
    try {
      const result = await this.dbService.find('sobriedad', { usuario_id: usuarioId }, masterToken);
      const rows = Array.isArray(result) ? result : (result?.rows ?? []);
      return rows[0] ?? null;
    } catch (error) {
      console.error('❌ Error en getSobrietyRecord:', error);
      return null;
    }
  }

  async getCaminoRecord(usuarioId: string, masterToken: string): Promise<CaminoRecord | null> {
    try {
      const result = await this.dbService.find('camino', { usuario_id: usuarioId }, masterToken);
      const rows = Array.isArray(result) ? result : (result?.rows ?? []);
      return rows[0] ?? null;
    } catch (error) {
      console.error('❌ Error en getCaminoRecord:', error);
      return null;
    }
  }

  async marcarXpReclamado(userRetoId: string, masterToken: string): Promise<void> {
    await this.dbService.update(
      'user_retos',
      'user_reto_id',
      userRetoId,
      { xp_reclamado: true, updated_at: new Date().toISOString() },
      masterToken,
    );
  }
}