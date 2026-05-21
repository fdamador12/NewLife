export class FraseDia {
  _id!: string;
  frase_id!: string;
  frase!: string;
  dia!: string;
  fecha_actualiz?: string; 

  constructor(partial: Partial<FraseDia>) {
    Object.assign(this, partial);
  }
}