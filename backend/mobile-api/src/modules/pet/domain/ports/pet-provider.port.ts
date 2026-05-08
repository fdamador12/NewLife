import { PetEntity } from '../entities/pet.entity';

export interface IPetProviderPort {
  getPet(usuarioId: string, masterToken: string): Promise<PetEntity | null>;
  upsertPet(data: Partial<PetEntity>, masterToken: string): Promise<void>;
}