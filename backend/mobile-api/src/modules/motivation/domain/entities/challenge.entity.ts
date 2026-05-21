export class ChallengeEntity {
  reto_id!: string;
  titulo!: string;
  descripcion!: string;
  dificultad!: 'SUAVE' | 'MODERADA' | 'INTENSA';
  tipo!: 'SOBRIETY_DAYS' | 'CHECKIN_STREAK' | 'CHECKIN_TOTAL' | 'PATH_LEVEL';
  target!: number;
  estado!: 'DRAFT' | 'PUBLISHED';

  constructor(partial: Partial<ChallengeEntity>) {
    Object.assign(this, partial);
  }
}