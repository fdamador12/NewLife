import { Challenge, ChallengeDifficulty, ChallengeType, ChallengeState } from '../../../motivation/domain/entities/challenge.entity';

export interface CreateChallengeInput {
  reto_id: string; 
  titulo: string;
  descripcion: string;
  dificultad: ChallengeDifficulty;
  tipo: ChallengeType;
  target: number;
  estado: ChallengeState;
}

export interface UpdateChallengeInput {
  titulo?: string;
  descripcion?: string;
  dificultad?: ChallengeDifficulty;
  tipo?: ChallengeType;
  target?: number;
  estado?: ChallengeState;
}

export const CHALLENGE_REPOSITORY = 'CHALLENGE_REPOSITORY';

export interface IChallengeRepository {
  findAll(): Promise<Challenge[]>;
  findByRetoId(retoId: string): Promise<Challenge | null>;
  create(data: CreateChallengeInput): Promise<Challenge>;
  update(retoId: string, data: UpdateChallengeInput): Promise<Challenge>;
  delete(retoId: string): Promise<void>;
  deleteEnrollmentsByRetoId(retoId: string): Promise<void>;
}