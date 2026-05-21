import { ContenidoEducativo } from '../entities/contenido.entity';

export interface CreateContenidoInput extends Omit<ContenidoEducativo, '_id' | 'created_at' | 'updated_at'> {}
export interface UpdateContenidoInput extends Partial<CreateContenidoInput> {}

export const CONTENIDO_REPOSITORY = 'CONTENIDO_REPOSITORY';

export interface IContenidoRepository {
  findAll(): Promise<ContenidoEducativo[]>;
  findById(id: string): Promise<ContenidoEducativo | null>;
  create(data: CreateContenidoInput): Promise<ContenidoEducativo>;
  update(id: string, data: UpdateContenidoInput): Promise<ContenidoEducativo>;
  delete(id: string): Promise<void>;
  
  // Método para desvincular categoría al borrarla
  nullifyCategoria(categoriaId: string): Promise<void>;
}