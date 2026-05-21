import { Categoria } from '../entities/categoria.entity';

export interface CreateCategoriaInput extends Omit<Categoria, '_id' | 'created_at'> {}
export interface UpdateCategoriaInput extends Partial<CreateCategoriaInput> {}

export const CATEGORIA_REPOSITORY = 'CATEGORIA_REPOSITORY';

export interface ICategoriaRepository {
  findAll(): Promise<Categoria[]>;
  findById(id: string): Promise<Categoria | null>;
  create(data: CreateCategoriaInput): Promise<Categoria>;
  update(id: string, data: UpdateCategoriaInput): Promise<Categoria>;
  delete(id: string): Promise<void>;
}