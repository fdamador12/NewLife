import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { IProgressProviderPort } from '../../domain/ports/progress-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { DailyCheckinDto } from '../../presentation/dtos/daily-checkin.dto';

@Injectable()
export class DailyCheckinUseCase {
  private logger = new Logger(DailyCheckinUseCase.name);

  constructor(
    @Inject('IProgressProviderPort')
    private readonly progressProvider: IProgressProviderPort,
    private readonly systemAuth: SystemAuthService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(uid: string, dto: DailyCheckinDto, userToken: string) {
    this.logger.log(`📝 Iniciando registro diario para usuario: ${uid}`);
    this.logger.log(`📝 ¿Consumo? ${dto.consumo}`);

    // ✅ Validar campos obligatorios si hay consumo
    if (dto.consumo) {
      if (!dto.ubicacion || !dto.social || !dto.reflexion) {
        throw new BadRequestException(
          'Si hubo consumo, ubicacion, social y reflexion son obligatorios',
        );
      }
    }

    // ✅ GENERAR FECHA EN UTC-5
    const ahora = new Date();
    const fechaUTC5 = new Date(ahora.getTime() - 5 * 60 * 60 * 1000);
    const fechaFormato = fechaUTC5.toISOString().slice(0, 19) + '-05:00';

    const data = {
      usuario_id: uid,
      emocion: dto.emocion,
      consumo: dto.consumo,
      gratitud: dto.gratitud,
      fecha: fechaFormato,
      ubicacion: dto.consumo ? dto.ubicacion : null,
      social: dto.consumo ? dto.social : null,
      reflexion: dto.consumo ? dto.reflexion : null,
    };

    const existing = await this.progressProvider.getTodayCheckin(uid, userToken);
    const isUpdate = !!existing;

    this.logger.log(
      `📤 Procesando registro diario (${isUpdate ? 'Actualización' : 'Nuevo'})`,
    );

    const checkin = await this.progressProvider.createDailyCheckin(data, userToken);

    this.logger.log(`✅ Registro diario procesado exitosamente`);

    // ✅ SOLO actualizar sobriedad si hay CONSUMO
    if (dto.consumo) {
      try {
        this.logger.log(`🔄 Actualizando fecha de sobriedad a: ${new Date().toISOString()}`);
        const masterToken = await this.systemAuth.getMasterToken();
        await this.progressProvider.updateSobrietyDate(
          uid,
          new Date().toISOString(),
          masterToken,
        );
        this.logger.log(`✅ Sobriedad actualizada (fecha_ultimo_consumo = AHORA)`);
      } catch (error: any) {
        this.logger.error(`⚠️ Error actualizando sobriedad:`, error.message);
      }
    } else {
      this.logger.log(`✅ Sin consumo - fecha_ultimo_consumo NO se modifica`);
    }

    // ✅ LÓGICA DE AHORRO
    try {
      await this.actualizarAhorro(uid, dto.consumo, userToken);
    } catch (error: any) {
      this.logger.error(`⚠️ Error actualizando ahorro:`, error.message);
    }

    // ✅ EMITIR EVENTO para evaluar retos
    this.logger.log(`🎯 Emitiendo evento: progress.checkin.created`);
    this.eventEmitter.emit('progress.checkin.created', {
      usuarioId: uid,
      userToken,
    });

    return {
      message: isUpdate
        ? 'Registro diario actualizado exitosamente.'
        : 'Registro diario guardado exitosamente.',
      data: checkin,
    };
  }

  private async actualizarAhorro(uid: string, consumoNuevo: boolean, userToken: string): Promise<void> {
    const masterToken = await this.systemAuth.getMasterToken();

    // Obtener todos los registros de hoy
    const registrosHoy = await this.progressProvider.getTodayCheckins(uid, userToken);

    // Contar cuántos registros de hoy tienen consumo:true ANTES del que acabamos de guardar
    // Como ya guardamos el nuevo, filtramos todos menos el último
    const registrosAnteriores = registrosHoy.slice(0, -1);
    const hayConsumoAnterior = registrosAnteriores.some(
      (r: any) => r.consumo === true || r.consumo === 'true',
    );
    const hayLimpioAnterior = registrosAnteriores.some(
      (r: any) => r.consumo === false || r.consumo === 'false',
    );

    const gastoSemanal = await this.progressProvider.getGastoSemanal(uid, masterToken);
    const gastoDiario = gastoSemanal / 7;

    const ahorroActual = await this.progressProvider.getAhorro(uid, masterToken);
    const totalActual = ahorroActual?.ahorro_total ?? 0;

    if (!consumoNuevo) {
      // Nuevo registro es limpio
      // Solo sumar si no había ningún consumo previo hoy
      if (!hayConsumoAnterior) {
        const nuevoTotal = totalActual + gastoDiario;
        await this.progressProvider.upsertAhorro(uid, nuevoTotal, masterToken);
        this.logger.log(`💰 Ahorro sumado: +${gastoDiario.toFixed(0)} → total: ${nuevoTotal.toFixed(0)}`);
      } else {
        this.logger.log(`💰 No se suma ahorro — ya hay consumo hoy`);
      }
    } else {
      // Nuevo registro tiene consumo
      // Solo restar si había registros limpios previos y no había consumo previo
      if (hayLimpioAnterior && !hayConsumoAnterior) {
        const nuevoTotal = Math.max(0, totalActual - gastoDiario);
        await this.progressProvider.upsertAhorro(uid, nuevoTotal, masterToken);
        this.logger.log(`💰 Ahorro restado: -${gastoDiario.toFixed(0)} → total: ${nuevoTotal.toFixed(0)}`);
      } else {
        this.logger.log(`💰 No se resta ahorro — no había limpio previo o ya había consumo`);
      }
    }
  }
}