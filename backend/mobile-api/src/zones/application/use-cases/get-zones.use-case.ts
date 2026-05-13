import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../modules/database/infrastructure/database.service';
import { SystemAuthService } from '../../../modules/auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetZonesUseCase {
  constructor(
    private db: DatabaseService,
    private systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string) {
    const token = await this.systemAuth.getMasterToken();
    const result = await this.db.find('zonas', { usuario_id: usuarioId }, token);
    const rows = Array.isArray(result) ? result : (result.rows ?? []);
    return rows;
  }
}