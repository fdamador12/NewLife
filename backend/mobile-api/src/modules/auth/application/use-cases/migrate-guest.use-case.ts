import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../infrastructure/services/system-auth.service';
import { MigrateGuestDto } from '../../presentation/dtos/migrate-guest.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MigrateGuestUseCase {
  private logger = new Logger(MigrateGuestUseCase.name);

  constructor(
    private db: DatabaseService,
    private systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string, data: MigrateGuestDto): Promise<void> {
    this.logger.log(`🔄 INICIANDO MIGRACIÓN para usuario: ${usuarioId}`);

    if (!data.profile || !usuarioId) {
      throw new BadRequestException('Datos inválidos');
    }

    let token: string;
    try {
      token = await this.systemAuth.getMasterToken();
      this.logger.log(`✅ Master token obtenido`);
    } catch (error) {
      this.logger.error(`❌ Error obteniendo token:`, error.message);
      throw error;
    }

    const now = new Date().toISOString();

    // 1. INFORMACIÓN PERSONAL
    try {
      this.logger.log(`📤 [1/3] Insertando en informacion_personal...`);

      const infoData = {
        usuario_id: usuarioId,
        apodo: data.profile.apodo || '',
        pronombre: data.profile.pronombre || '',
        motivo_sobrio: data.profile.motivo_sobrio || '',
        gasto_semanal: data.profile.gasto_semana || 0,
        created_at: now,
      };

      const infoResult = await this.db.insert(
        'informacion_personal',
        [infoData],
        token,
      );

      if (infoResult.inserted?.length > 0) {
        this.logger.log(`✅ [1/3] informacion_personal INSERTADO`);
      } else if (infoResult.skipped?.length > 0) {
        this.logger.error(`❌ [1/3] informacion_personal NO insertado:`, infoResult.skipped[0].reason);
      }
    } catch (error) {
      this.logger.error(`❌ [1/3] ERROR informacion_personal:`, error.message);
    }

    // 2. SOBRIEDAD
    try {
      this.logger.log(`📤 [2/3] Insertando en sobriedad...`);

      const sobriedadData = {
        usuario_id: usuarioId,
        fecha_ultimo_consumo: data.sobriety?.startDate || new Date().toISOString(),
        updated_at: now,
      };

      const sobriedadResult = await this.db.insert(
        'sobriedad',
        [sobriedadData],
        token,
      );

      if (sobriedadResult.inserted?.length > 0) {
        this.logger.log(`✅ [2/3] sobriedad INSERTADO`);
      } else if (sobriedadResult.skipped?.length > 0) {
        this.logger.error(`❌ [2/3] sobriedad NO insertado:`, sobriedadResult.skipped[0].reason);
      }
    } catch (error) {
      this.logger.error(`❌ [2/3] ERROR sobriedad:`, error.message);
    }

    // 3. CONTACTOS
    if (data.contacts && data.contacts.length > 0) {
      try {
        this.logger.log(`📤 [3/3] Insertando ${data.contacts.length} contacto(s)...`);

        const contactsData = data.contacts.map((contact) => ({
          contacto_id: uuidv4(),
          usuario_id: usuarioId,
          nombre: contact.nombre,
          telefono: parseFloat(contact.telefono) || 0,
          created_at: now,
          updated_at: now,
        }));

        const contactsResult = await this.db.insert(
          'contactos',
          contactsData,
          token,
        );

        if (contactsResult.inserted?.length > 0) {
          this.logger.log(`✅ [3/3] ${contactsResult.inserted.length} contacto(s) INSERTADO(S)`);
        } else if (contactsResult.skipped?.length > 0) {
          this.logger.error(`❌ [3/3] contactos NO insertados:`, contactsResult.skipped[0].reason);
        }
      } catch (error) {
        this.logger.error(`❌ [3/3] ERROR contactos:`, error.message);
      }
    } else {
      this.logger.log(`⏭️  [3/3] contactos OMITIDO (lista vacía)`);
    }

    this.logger.log(`🎉 MIGRACIÓN COMPLETADA para usuario ${usuarioId}`);
  }
}