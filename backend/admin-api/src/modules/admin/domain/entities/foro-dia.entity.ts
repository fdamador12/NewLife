export class ForoDia {
  _id!: string;
  pregunta!: string;
  descripcion?: string;
  fecha!: string;
  creado_por!: string;
  created_at?: string;

  constructor(partial: Partial<ForoDia>) {
    Object.assign(this, partial);
  }
}