import { ForoDia } from '../entities/foro-dia.entity';

export interface CreateForoDiaInput extends Omit<ForoDia, '_id' | 'created_at' | 'creado_por'> {}
export interface UpdateForoDiaInput extends Partial<CreateForoDiaInput> {}

export const FORO_DIA_REPOSITORY = 'FORO_DIA_REPOSITORY';

export interface IForoDiaRepository {
  findAll(): Promise<ForoDia[]>;
  findById(id: string): Promise<ForoDia | null>;
  findByDate(fecha: string): Promise<ForoDia | null>;
  create(data: CreateForoDiaInput): Promise<ForoDia>;
  createBulk(data: CreateForoDiaInput[]): Promise<void>; // <-- Agregado para carga masiva
  update(id: string, data: UpdateForoDiaInput): Promise<ForoDia>;
}