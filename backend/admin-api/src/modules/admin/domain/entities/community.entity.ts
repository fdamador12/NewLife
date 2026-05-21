export enum TipoAcceso {
  SOLO_VER            = 'SOLO_VER',
  POSTEAR_COMENTAR    = 'POSTEAR_COMENTAR',
  CHAT_COMPLETO       = 'CHAT_COMPLETO',
}

export class Community {
  _id!: string;
  nombre!: string;
  descripcion?: string | null;
  creado_por!: string;
  created_at?: string;
  activa!: boolean;

  constructor(partial: Partial<Community>) {
    Object.assign(this, partial);
  }
}

export class ComunidadUsuario {
  _id!: string;
  comunidad_id!: string;
  usuario_id!: string;
  tipo_acceso!: TipoAcceso;
  es_moderador!: boolean;
  joined_at?: string;

  constructor(partial: Partial<ComunidadUsuario>) {
    Object.assign(this, partial);
  }
}