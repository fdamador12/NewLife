import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetActiveGruposUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute() {
    const masterToken = await this.systemAuth.getMasterToken();
    
    const result = await this.dbService.find('grupos_apoyo', { estado: 'ACTIVE' }, masterToken);
    
    let grupos = Array.isArray(result) ? result : (result?.rows ?? []);
    
    const gruposFormateados = grupos.map((g: any) => {
      let telefonos = [];
      let whatsapp = [];

      try {
        if (g.telefonos) telefonos = typeof g.telefonos === 'string' ? JSON.parse(g.telefonos) : g.telefonos;
        if (g.whatsapp) whatsapp = typeof g.whatsapp === 'string' ? JSON.parse(g.whatsapp) : g.whatsapp;
      } catch (e) {
        console.warn(`Error parseando teléfonos del grupo ${g.grupo_id}`);
      }

      return {
        grupo_id: g.grupo_id,
        nombre: g.nombre,
        descripcion: g.descripcion,
        direccion: g.direccion,
        lugar: g.lugar,
        email: g.email,
        sitio_web: g.sitio_web,
        instagram: g.instagram,
        facebook: g.facebook,
        telefonos: telefonos,
        whatsapp: whatsapp,
        comunidad_url: g.comunidad_url,
        logo_url: g.logo_url,
      };
    });

    return { data: gruposFormateados };
  }
}