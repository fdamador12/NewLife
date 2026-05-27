import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { IProgressProviderPort } from '../../../progress/domain/ports/progress-provider.port';

const LEVEL_NAMES: Record<number, string> = {
    1: 'Reconocer', 2: 'Confiar', 3: 'Entregar', 4: 'Explorar',
    5: 'Compartir', 6: 'Prepararme', 7: 'Pedir cambio', 8: 'Reparar',
    9: 'Actuar', 10: 'Reflexionar', 11: 'Conectar', 12: 'Compartir',
};

/**
 * Devuelve los datos PUBLICOS de un usuario por su robleId.
 *
 * Estrategia: usa IProgressProviderPort.getSobrietyRecord() (la misma
 * implementacion que usa GetSobrietyTimeUseCase y que SI funciona) en
 * lugar de hacer find directo a la tabla sobriety_record (que da 500
 * porque el provider de roble la consulta diferente).
 *
 * Para que esto funcione, ProgressModule debe estar importado en
 * CommunitiesModule (ya esta — exporta 'IProgressProviderPort').
 *
 * En el contexto de una app de sobriedad estos datos son motivacionales
 * y publicos (no sensibles):
 *  - dias sin consumo (desde IProgressProviderPort.getSobrietyRecord)
 *  - nivel del camino de 12 pasos (tabla camino)
 *  - total de medallas (user_retos con estado COMPLETED)
 *  - total de comunidades activas
 *
 * NO incluye: email, motivo_sobrio, gasto_semanal, fecha_ultimo_consumo
 * directa, info de contacto, etc.
 */
@Injectable()
export class GetPublicProfileUseCase {
    private readonly logger = new Logger(GetPublicProfileUseCase.name);

    constructor(
        private readonly dbService: DatabaseService,
        private readonly systemAuth: SystemAuthService,
        @Inject('IProgressProviderPort')
        private readonly progressProvider: IProgressProviderPort,
    ) { }

    async execute(robleId: string) {
        const masterToken = await this.systemAuth.getMasterToken();

        // 1. Datos basicos de la tabla usuarios
        const userRes = await this.dbService.find('usuarios', { _id: robleId }, masterToken);
        const userRows = Array.isArray(userRes) ? userRes : (userRes.rows || []);
        if (userRows.length === 0) {
            throw new NotFoundException('Usuario no encontrado.');
        }
        const user = userRows[0];
        const usuarioUuid = user.usuario_id;

        this.logger.log(`Cargando perfil publico de robleId=${robleId} (uuid=${usuarioUuid})`);

        // 2. Info personal (apodo, pronombre)
        let apodo = '';
        let pronombre = '';
        try {
            const infoRes = await this.dbService.find(
                'informacion_personal',
                { usuario_id: usuarioUuid },
                masterToken,
            );
            const infoRows = Array.isArray(infoRes) ? infoRes : (infoRes.rows || []);
            if (infoRows[0]) {
                apodo = infoRows[0].apodo || '';
                pronombre = infoRows[0].pronombre || '';
            }
        } catch (err: any) {
            this.logger.warn(`No se pudo cargar informacion_personal: ${err?.message}`);
        }

        // 3. Dias sobrios — usando el adapter de progress (mismo path que el use-case que ya funciona)
        let diasSobrio = 0;
        try {
            const sobrietyRecord = await this.progressProvider.getSobrietyRecord(usuarioUuid, masterToken);
            if (sobrietyRecord?.fecha_ultimo_consumo) {
                const lastDate = new Date(sobrietyRecord.fecha_ultimo_consumo);
                const now = new Date();
                const diffMs = Math.max(0, now.getTime() - lastDate.getTime());
                diasSobrio = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                this.logger.log(`Dias sobrios calculados: ${diasSobrio}`);
            } else {
                this.logger.log(`Sin registro de sobriedad para ${usuarioUuid}`);
            }
        } catch (err: any) {
            this.logger.warn(`No se pudo cargar tiempo sobrio: ${err?.message}`);
        }

        // 4. Nivel actual del camino de 12 pasos
        let nivel = 0;
        try {
            const caminoRes = await this.dbService.find(
                'camino',
                { usuario_id: usuarioUuid },
                masterToken,
            );
            const caminoRows = Array.isArray(caminoRes) ? caminoRes : (caminoRes.rows || []);
            nivel = caminoRows[0]?.nivel ?? 0;
        } catch (err: any) {
            this.logger.warn(`No se pudo cargar camino: ${err?.message}`);
        }

        // 5. Total de medallas — contar user_retos con estado COMPLETED
        let totalMedallas = 0;
        try {
            const retosRes = await this.dbService.find(
                'user_retos',
                { usuario_id: usuarioUuid },
                masterToken,
            );
            const retosRows = Array.isArray(retosRes) ? retosRes : (retosRes.rows || []);
            totalMedallas = retosRows.filter((r: any) => r.estado === 'COMPLETED').length;
        } catch (err: any) {
            this.logger.warn(`No se pudo cargar user_retos: ${err?.message}`);
        }

        // 6. Total de comunidades activas a las que pertenece
        let totalComunidades = 0;
        try {
            const commRes = await this.dbService.find(
                'comunidad_usuarios',
                { usuario_id: robleId },
                masterToken,
            );
            const commRows = Array.isArray(commRes) ? commRes : (commRes.rows || []);
            // Contar solo comunidades activas
            const activeCount = await Promise.all(
                commRows.map(async (m: any) => {
                    try {
                        const c = await this.dbService.findById('comunidades', m.comunidad_id, masterToken);
                        return c?.activa === true ? 1 : 0;
                    } catch {
                        return 0;
                    }
                })
            );
            totalComunidades = activeCount.reduce((sum, x) => sum + x, 0);
        } catch (err: any) {
            this.logger.warn(`No se pudo cargar comunidad_usuarios: ${err?.message}`);
        }

        const result = {
            robleId: user._id,
            nombre: user.nombre || '',
            avatar_url: user.avatar_url || null,
            descripcion: user.descripcion || '',
            apodo,
            pronombre,
            dias_sobrio: diasSobrio,
            nivel,
            nivel_nombre: LEVEL_NAMES[nivel] || '',
            total_medallas: totalMedallas,
            total_comunidades: totalComunidades,
        };

        this.logger.log(`Perfil publico cargado: dias=${diasSobrio} nivel=${nivel} medallas=${totalMedallas} comunidades=${totalComunidades}`);
        return result;
    }
}