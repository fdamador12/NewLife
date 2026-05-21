export class ContenidoEducativo {
  _id!: string;
  contenido_id!: string;
  titulo!: string;
  tipo!: 'ARTICULO' | 'VIDEO';
  duracion_minutos!: number;
  
  // CAMBIO: Ahora es opcional
  imagen_portada?: string; 
  
  texto_contenido!: string;
  video_url?: string;
  categoria_id?: string;
  
  // CAMBIO: Ahora es opcional
  autor_nombre?: string; 
  
  autor_profesion?: string;
  autor_foto?: string;
  hashtags?: string[];
  estado!: 'PUBLISHED' | 'DRAFT';
  created_at!: string;
  updated_at!: string;

  constructor(partial: Partial<ContenidoEducativo>) {
    Object.assign(this, partial);
    if (typeof this.hashtags === 'string') {
      try {
        this.hashtags = JSON.parse(this.hashtags);
      } catch (e) {
        this.hashtags = [];
      }
    }
  }
}