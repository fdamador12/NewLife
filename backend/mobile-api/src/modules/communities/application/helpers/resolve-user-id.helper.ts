import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
 
@Injectable()
export class ResolveUserIdHelper {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}
 
  async getRobleId(usuarioUuid: string): Promise<string> {
    const masterToken = await this.systemAuth.getMasterToken();
    const res = await this.dbService.find('usuarios', { usuario_id: usuarioUuid }, masterToken);
    const rows = Array.isArray(res) ? res : (res.rows || []);
    if (!rows[0]) throw new NotFoundException('Usuario no encontrado.');
    return rows[0]._id;
  }
}