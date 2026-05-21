export class Categoria {
  _id!: string;
  categoria_id!: string;
  nombre!: string;
  descripcion?: string;
  created_at!: string;

  constructor(partial: Partial<Categoria>) {
    Object.assign(this, partial);
  }
}