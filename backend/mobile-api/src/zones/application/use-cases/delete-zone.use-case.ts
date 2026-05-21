import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../../modules/database/infrastructure/database.service';
import { SystemAuthService } from '../../../modules/auth/infrastructure/services/system-auth.service';

@Injectable()
export class DeleteZoneUseCase {
    constructor(
        private db: DatabaseService,
        private systemAuth: SystemAuthService,
    ) { }

    async execute(usuarioId: string, zoneId: string) {
        const token = await this.systemAuth.getMasterToken();

        const result = await this.db.find('zonas', { usuario_id: usuarioId }, token);
        const rows = Array.isArray(result) ? result : (result.rows ?? []);
        const zone = rows.find((z: any) => z._id === zoneId);

        if (!zone) throw new NotFoundException('Zona no encontrada');
        if (zone.usuario_id !== usuarioId) throw new ForbiddenException('No puedes eliminar esta zona');

        await this.db.delete('zonas', '_id', zoneId, token);
        return { message: 'Zona eliminada' };
    }
}