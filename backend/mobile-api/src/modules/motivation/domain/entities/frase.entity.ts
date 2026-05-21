export class FraseDiaEntity {
  _id!: string;
  frase_id!: string;
  frase!: string;
  dia!: string;
  fecha_actualiz?: string;
}

export class FraseGuardadaEntity {
  _id!: string;
  usuario_id!: string;
  frase_id!: string;
}