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
      this.logger.error(`❌ Error obteniendo token:`, (error as any).message);
      throw error;
    }

    const now = new Date().toISOString();

    // ─── 1. INFORMACIÓN PERSONAL ──────────────────────────────────────────────
    try {
      this.logger.log(`📤 [1/6] Insertando en informacion_personal...`);
      const infoData = {
        usuario_id: usuarioId,
        apodo: data.profile.apodo || '',
        pronombre: data.profile.pronombre || '',
        motivo_sobrio: data.profile.motivo_sobrio || '',
        gasto_semanal: data.profile.gasto_semana || 0,
        created_at: now,
      };
      const infoResult = await this.db.insert('informacion_personal', [infoData], token);
      if (infoResult.inserted?.length > 0) {
        this.logger.log(`✅ [1/6] informacion_personal INSERTADO`);
      } else {
        this.logger.warn(`⚠️ [1/6] informacion_personal NO insertado:`, infoResult.skipped?.[0]?.reason);
      }
    } catch (error) {
      this.logger.error(`❌ [1/6] ERROR informacion_personal:`, (error as any).message);
    }

    // ─── 2. SOBRIEDAD ─────────────────────────────────────────────────────────
    try {
      this.logger.log(`📤 [2/6] Insertando en sobriedad...`);
      const sobriedadData = {
        usuario_id: usuarioId,
        fecha_ultimo_consumo: data.sobriety?.startDate || now,
        updated_at: now,
      };
      const sobriedadResult = await this.db.insert('sobriedad', [sobriedadData], token);
      if (sobriedadResult.inserted?.length > 0) {
        this.logger.log(`✅ [2/6] sobriedad INSERTADO`);
      } else {
        this.logger.warn(`⚠️ [2/6] sobriedad NO insertado:`, sobriedadResult.skipped?.[0]?.reason);
      }
    } catch (error) {
      this.logger.error(`❌ [2/6] ERROR sobriedad:`, (error as any).message);
    }

    // ─── 3. CONTACTOS ─────────────────────────────────────────────────────────
    if (data.contacts && data.contacts.length > 0) {
      try {
        this.logger.log(`📤 [3/6] Insertando ${data.contacts.length} contacto(s)...`);
        const contactsData = data.contacts.map((contact) => ({
          contacto_id: uuidv4(),
          usuario_id: usuarioId,
          nombre: contact.nombre,
          telefono: parseFloat(contact.telefono) || 0,
          created_at: now,
          updated_at: now,
        }));
        const contactsResult = await this.db.insert('contactos', contactsData, token);
        this.logger.log(`✅ [3/6] ${contactsResult.inserted?.length ?? 0} contacto(s) INSERTADO(S)`);
      } catch (error) {
        this.logger.error(`❌ [3/6] ERROR contactos:`, (error as any).message);
      }
    } else {
      this.logger.log(`⏭️  [3/6] contactos OMITIDO (lista vacía)`);
    }

    // ─── 4. REGISTROS DIARIOS ─────────────────────────────────────────────────
    if (data.checkins && data.checkins.length > 0) {
      try {
        this.logger.log(`📤 [4/6] Insertando ${data.checkins.length} registro(s) diario(s)...`);
        const checkinsData = data.checkins.map((c) => ({
          usuario_id: usuarioId,
          fecha: c.fecha,
          emocion: c.emocion,
          consumo: c.consumo,
          gratitud: c.gratitud,
          ubicacion: c.ubicacion ?? null,
          social: c.social ?? null,
          reflexion: c.reflexion ?? null,
        }));
        const checkinsResult = await this.db.insert('registro_diario', checkinsData, token);
        this.logger.log(`✅ [4/6] ${checkinsResult.inserted?.length ?? 0} registro(s) INSERTADO(S)`);
      } catch (error) {
        this.logger.error(`❌ [4/6] ERROR registros diarios:`, (error as any).message);
      }
    } else {
      this.logger.log(`⏭️  [4/6] registros diarios OMITIDO (lista vacía)`);
    }

    // ─── 5. PROGRESO CAMINO — upsert ─────────────────────────────────────────
    if (data.progress) {
      try {
        this.logger.log(`📤 [5/6] Upsert progreso camino...`);

        // ✅ Verificar si ya existe un registro de camino
        const existing = await this.db.find('camino', { usuario_id: usuarioId }, token);
        const rows = Array.isArray(existing) ? existing : (existing?.rows ?? []);

        if (rows.length > 0) {
          // ✅ Ya existe — actualizar con el progreso del guest
          await this.db.update(
            'camino',
            'usuario_id',
            usuarioId,
            {
              nivel: data.progress.nivel,
              subnivel: data.progress.subnivel,
              updated_at: now,
            },
            token,
          );
          this.logger.log(`✅ [5/6] camino ACTUALIZADO — nivel ${data.progress.nivel}, subnivel ${data.progress.subnivel}`);
        } else {
          // ✅ No existe — insertar
          const caminoResult = await this.db.insert('camino', [{
            usuario_id: usuarioId,
            nivel: data.progress.nivel,
            subnivel: data.progress.subnivel,
            updated_at: now,
          }], token);
          this.logger.log(`✅ [5/6] camino INSERTADO — nivel ${data.progress.nivel}, subnivel ${data.progress.subnivel}`);
        }
      } catch (error) {
        this.logger.error(`❌ [5/6] ERROR camino:`, (error as any).message);
      }
    } else {
      this.logger.log(`⏭️  [5/6] camino OMITIDO (sin progreso)`);
    }

    // ─── 6. MASCOTA — upsert ─────────────────────────────────────────────────
    if (data.pet) {
      try {
        this.logger.log(`📤 [6/6] Upsert mascota...`);

        const existing = await this.db.find('user_pet', { usuario_id: usuarioId }, token);
        const rows = Array.isArray(existing) ? existing : (existing?.rows ?? []);

        if (rows.length > 0) {
          // ✅ Ya existe — actualizar con datos del guest
          await this.db.update(
            'user_pet',
            'usuario_id',
            usuarioId,
            {
              xp: data.pet.xp ?? 0,
              selected_form: data.pet.selected_form ?? 'seed',
              unlocked_forms: JSON.stringify(data.pet.unlocked_forms ?? ['seed']),
              last_actions: JSON.stringify(data.pet.last_actions ?? {}),
              updated_at: now,
            },
            token,
          );
          this.logger.log(`✅ [6/6] mascota ACTUALIZADA — xp: ${data.pet.xp}`);
        } else {
          // ✅ No existe — insertar
          await this.db.insert('user_pet', [{
            usuario_id: usuarioId,
            xp: data.pet.xp ?? 0,
            selected_form: data.pet.selected_form ?? 'seed',
            unlocked_forms: JSON.stringify(data.pet.unlocked_forms ?? ['seed']),
            last_actions: JSON.stringify(data.pet.last_actions ?? {}),
            updated_at: now,
          }], token);
          this.logger.log(`✅ [6/6] mascota INSERTADA — xp: ${data.pet.xp}`);
        }
      } catch (error) {
        this.logger.error(`❌ [6/6] ERROR mascota:`, (error as any).message);
      }
    } else {
      this.logger.log(`⏭️  [6/6] mascota OMITIDA (sin datos)`);
    }

    this.logger.log(`🎉 MIGRACIÓN COMPLETADA para usuario ${usuarioId}`);
  }
}