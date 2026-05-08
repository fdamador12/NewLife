export class BreathingSoundEntity {
  _id: string;
  breathing_id?: string;
  nombre: string;
  descripcion: string;
  freesound_id: number;
  preview_url: string;
  categoria: string;
  duracion_segundos: number;
  es_activo: boolean;
  created_at?: Date;
  updated_at?: Date;

  constructor(data: Partial<BreathingSoundEntity>) {
    Object.assign(this, data);
  }
}