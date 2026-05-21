export class GrupoApoyo {
  _id!: string;
  grupo_id!: string;
  nombre!: string;
  descripcion!: string;
  direccion?: string;
  lugar?: string;
  email?: string;
  sitio_web?: string;
  instagram?: string;
  facebook?: string;
  telefonos?: string[];
  whatsapp?: string[];
  comunidad_url?: string;
  logo_url?: string;
  estado!: 'ACTIVE' | 'INACTIVE';
  created_at!: string;
  updated_at!: string;

  constructor(partial: Partial<GrupoApoyo>) {
    Object.assign(this, partial);
    
    if (typeof this.telefonos === 'string') this.telefonos = JSON.parse(this.telefonos);
    if (typeof this.whatsapp === 'string') this.whatsapp = JSON.parse(this.whatsapp);
  }
}