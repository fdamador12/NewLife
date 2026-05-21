import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../modules/database/infrastructure/database.service';
import { SystemAuthService } from '../../../modules/auth/infrastructure/services/system-auth.service';
import { CreateZoneDto } from '../../presentation/dtos/zone.dto';

@Injectable()
export class CreateZoneUseCase {
  constructor(
    private db: DatabaseService,
    private systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string, dto: CreateZoneDto) {
    const token = await this.systemAuth.getMasterToken();
    const now = new Date().toISOString();
    const _id = Math.random().toString(36).substring(2, 14).padEnd(12, '0');

    await this.db.insert('zonas', [{
      _id,
      usuario_id: usuarioId,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? '',
      tipo: dto.tipo,
      latitud: dto.latitud,
      longitud: dto.longitud,
      created_at: now,
    }], token);

    return { _id, message: 'Zona creada' };
  }
}