export enum ChallengeDifficulty {
  SUAVE = 'SUAVE',
  MODERADA = 'MODERADA',
  INTENSA = 'INTENSA',
}

export enum ChallengeType {
  SOBRIETY_DAYS = 'SOBRIETY_DAYS',
  CHECKIN_STREAK = 'CHECKIN_STREAK',
  CHECKIN_TOTAL = 'CHECKIN_TOTAL',
  PATH_LEVEL = 'PATH_LEVEL',
}

export enum ChallengeState {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export class Challenge {
  _id!: string;
  reto_id!: string;
  titulo!: string;
  descripcion!: string;
  dificultad!: ChallengeDifficulty;
  tipo!: ChallengeType;
  target!: number;
  estado!: ChallengeState;
  created_at!: string;
  updated_at!: string;

  constructor(partial: Partial<Challenge>) {
    Object.assign(this, partial);
  }
}