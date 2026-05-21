import { FraseDia } from '../entities/frase-dia.entity';

export interface CreateFraseDiaInput {
  frase: string;
  dia: string;
  frase_id: string;
}

export interface UpdateFraseDiaInput {
  frase?: string;
  dia?: string;
}

export const FRASE_DIA_REPOSITORY = 'FRASE_DIA_REPOSITORY';

export interface IFraseDiaRepository {
  findAll(): Promise<FraseDia[]>;
  findById(id: string): Promise<FraseDia | null>;
  findByDate(dia: string): Promise<FraseDia | null>;
  create(data: CreateFraseDiaInput): Promise<FraseDia>;
  update(id: string, data: UpdateFraseDiaInput): Promise<FraseDia>;
}
