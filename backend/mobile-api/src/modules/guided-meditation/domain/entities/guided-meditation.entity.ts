export class GuidedMeditationEntity {
  audio_id: string;
  nombre: string;
  duracion: number;
  categoria: string;
  url: string;

  constructor(data: any) {
    this.audio_id = data.audio_id;
    this.nombre = data.nombre;
    this.duracion = data.duracion;
    this.categoria = data.categoria;
    this.url = data.url;
  }
}