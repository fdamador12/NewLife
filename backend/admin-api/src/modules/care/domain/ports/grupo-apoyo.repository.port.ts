import { GrupoApoyo } from '../entities/grupo-apoyo.entity';

export interface CreateGrupoInput extends Omit<GrupoApoyo, '_id' | 'created_at' | 'updated_at'> {}
export interface UpdateGrupoInput extends Partial<CreateGrupoInput> {}

export const GRUPO_APOYO_REPOSITORY = 'GRUPO_APOYO_REPOSITORY';

export interface IGrupoApoyoRepository {
  findAll(): Promise<GrupoApoyo[]>;
  findById(grupoId: string): Promise<GrupoApoyo | null>;
  create(data: CreateGrupoInput): Promise<GrupoApoyo>;
  update(grupoId: string, data: UpdateGrupoInput): Promise<GrupoApoyo>;
  delete(grupoId: string): Promise<void>;
}