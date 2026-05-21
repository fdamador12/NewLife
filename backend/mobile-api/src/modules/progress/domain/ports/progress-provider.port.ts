import { DailyCheckinEntity } from '../entities/daily-checkin.entity';
import { CaminoEntity } from '../entities/camino.entity';

export interface GratitudeEntryResult {
  dia: string;
  hora: string;
  gratitud: string;
}

export interface SobrietyRecord {
  _id: string;
  usuario_id: string;
  fecha_ultimo_consumo: string;
  updated_at: string;
}

export interface AhorroRecord {
  _id: string;
  ahorro_id: string;
  user_id: string;
  ahorro_total: number;
  updated_at: string;
}

export interface IProgressProviderPort {
  createDailyCheckin(data: Partial<DailyCheckinEntity>, token: string): Promise<any>;
  updateSobrietyDate(usuarioId: string, fechaUTC: string, masterToken: string): Promise<void>;
  getGratitudeHistory(usuarioId: string, token: string): Promise<GratitudeEntryResult[]>;
  getCamino(usuarioId: string, masterToken: string): Promise<CaminoEntity | null>;
  upsertCamino(data: Partial<CaminoEntity>, masterToken: string): Promise<void>;
  getAllCheckins(usuarioId: string, token: string): Promise<any[]>;
  getTodayCheckin(usuarioId: string, token: string): Promise<any | null>;
  updateTodayCheckin(id: string, data: Partial<DailyCheckinEntity>, token: string): Promise<any>;
  getMonthCheckins(usuarioId: string, month: number, year: number, token: string): Promise<any[]>;
  getSobrietyRecord(usuarioId: string, masterToken: string): Promise<SobrietyRecord | null>;
  getAllRegistrosDiario(usuarioId: string, token: string): Promise<Array<{ fecha: string; emocion: string }>>;
  getConsumptionDates(usuarioId: string, token: string): Promise<Array<{ fecha: string; consumo: boolean }>>;
  getGastoSemanal(usuarioId: string, masterToken: string): Promise<number>;
  getAhorro(usuarioId: string, masterToken: string): Promise<AhorroRecord | null>;
  upsertAhorro(usuarioId: string, nuevoTotal: number, masterToken: string): Promise<void>;
  getTodayCheckins(usuarioId: string, token: string): Promise<any[]>;
}