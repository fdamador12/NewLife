import { Injectable, Inject } from '@nestjs/common';
import { IMotivationProviderPort } from '../../domain/ports/motivation-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetMyChallengesUseCase {
  constructor(
    @Inject('IMotivationProviderPort')
    private readonly motivationProvider: IMotivationProviderPort,
    private readonly systemAuth: SystemAuthService,
  ) {}

  private calcularDiasSobrio(fechaUltimoConsumo: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastConsumption = new Date(fechaUltimoConsumo);
    lastConsumption.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastConsumption.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(days, 0);
  }

  async execute(usuarioId: string, userToken: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const myChallenges = await this.motivationProvider.getUserChallenges(usuarioId, userToken);
    const allPublished = await this.motivationProvider.getPublishedChallenges(masterToken);

    // ✅ Obtener sobriedad una sola vez si hay retos SOBRIETY_DAYS activos
    const tieneSobrietyActivo = myChallenges.some(
      mc => mc.estado === 'ACTIVE' &&
      allPublished.find(c => c.reto_id === mc.reto_id)?.tipo === 'SOBRIETY_DAYS'
    );

    let diasSobrioActual = 0;
    if (tieneSobrietyActivo) {
      const sobrietyRecord = await this.motivationProvider.getSobrietyRecord(usuarioId, masterToken);
      if (sobrietyRecord?.fecha_ultimo_consumo) {
        diasSobrioActual = this.calcularDiasSobrio(sobrietyRecord.fecha_ultimo_consumo);
      }
    }

    // ✅ Obtener nivel actual una sola vez si hay retos PATH_LEVEL activos
    const tienePathActivo = myChallenges.some(
      mc => mc.estado === 'ACTIVE' &&
      allPublished.find(c => c.reto_id === mc.reto_id)?.tipo === 'PATH_LEVEL'
    );

    let nivelActual = 0;
    if (tienePathActivo) {
      const camino = await this.motivationProvider.getCaminoRecord(usuarioId, masterToken);
      nivelActual = camino?.nivel ?? 0;
    }

    const activos = [];
    const terminados = [];
    const disponibles = [];

    for (const catalogo of allPublished) {
      const userChallenge = myChallenges.find(mc => mc.reto_id === catalogo.reto_id);

      if (!userChallenge) {
        disponibles.push({
          reto_id: catalogo.reto_id,
          titulo: catalogo.titulo,
          descripcion: catalogo.descripcion,
          dificultad: catalogo.dificultad,
          tipo: catalogo.tipo,
          target: catalogo.target,
          texto_progreso: `0% completado — Únete para comenzar`,
        });
      } else {
        // ✅ Calcular progreso en tiempo real según tipo
        let progreso = userChallenge.progreso_actual;

        if (userChallenge.estado === 'ACTIVE') {
          if (catalogo.tipo === 'SOBRIETY_DAYS') {
            progreso = Math.min(diasSobrioActual, catalogo.target);
          } else if (catalogo.tipo === 'PATH_LEVEL') {
            progreso = Math.min(nivelActual, catalogo.target);
          }
        }

        const target = catalogo.target;
        const porcentaje = Math.min(Math.floor((progreso / target) * 100), 100);

        // ✅ Auto-completar si progreso >= target y estado es ACTIVE
        let estadoFinal = userChallenge.estado;
        if (userChallenge.estado === 'ACTIVE' && progreso >= target) {
          estadoFinal = 'COMPLETED';
          // Actualizar en BD en background — no bloqueamos la respuesta
          this.motivationProvider.updateChallengeProgress(
            userChallenge.user_reto_id,
            progreso,
            'COMPLETED',
            masterToken,
          ).catch(err => console.error('Error auto-completando reto:', err));
        }

        let textoProgreso = '';
        if (estadoFinal === 'COMPLETED') {
          textoProgreso = `${target} de ${target} cumplidos`;
        } else if (estadoFinal === 'FAILED') {
          textoProgreso = `Reto interrumpido - Llegaste a ${userChallenge.progreso_actual}/${target}`;
        } else {
          switch (catalogo.tipo) {
            case 'SOBRIETY_DAYS':
              textoProgreso = `${porcentaje}% completado — ${progreso}/${target} días sin consumir`;
              break;
            case 'CHECKIN_STREAK':
              textoProgreso = `${porcentaje}% completado — Racha de ${progreso}/${target} días`;
              break;
            case 'CHECKIN_TOTAL':
              textoProgreso = `${porcentaje}% completado — ${progreso}/${target} registros totales`;
              break;
            case 'PATH_LEVEL':
              textoProgreso = `${porcentaje}% completado — Nivel ${progreso} alcanzado`;
              break;
            default:
              textoProgreso = `${porcentaje}% completado`;
          }
        }

        const retoFormateado = {
          user_reto_id: userChallenge.user_reto_id,
          reto_id: catalogo.reto_id,
          titulo: catalogo.titulo,
          descripcion: catalogo.descripcion,
          dificultad: catalogo.dificultad,
          target: target,
          estado: estadoFinal,
          progreso_actual: progreso,
          porcentaje: porcentaje,
          texto_progreso: textoProgreso,
          xp_reclamado: userChallenge.xp_reclamado ?? false, // ✅ agregar esto
        };

        if (estadoFinal === 'ACTIVE') {
          activos.push(retoFormateado);
        } else {
          terminados.push(retoFormateado);
        }
      }
    }

    return {
      data: {
        activos,
        terminados,
        disponibles,
      }
    };
  }
}