import { Inject, Injectable } from '@nestjs/common';
import { IProgressProviderPort } from '../../domain/ports/progress-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

const EMOTION_SCORE: Record<string, number> = {
    animado: 6,
    tranquilo: 5,
    normal: 4,
    bajoneado: 2,
    saturado: 2,
    irritado: 1,
    ansioso: 1,
};

const SOCIAL_LABEL: Record<string, string> = {
    'solo': 'estar solo',
    'con amigos': 'estar con amigos',
    'con mi pareja': 'estar con tu pareja',
    'con gente del trabajo': 'estar con compañeros de trabajo',
    'con gente de la uni': 'estar con compañeros de universidad',
    'con desconocidos': 'estar con desconocidos',
};

const UBICACION_LABEL: Record<string, string> = {
    'en mi casa': 'estar en tu casa',
    'en casa de un amigo': 'estar en casa de un amigo',
    'en el barrio / calle': 'estar en la calle',
    'en la universidad': 'estar en la universidad',
    'en un bar o disco': 'estar en un bar o discoteca',
};

@Injectable()
export class ProgressSummaryUseCase {
    constructor(
        @Inject('IProgressProviderPort')
        private readonly progressProvider: IProgressProviderPort,
        private readonly systemAuth: SystemAuthService,
    ) {}

    async execute(uid: string, userToken: string) {
        const allRecords = await this.progressProvider.getAllCheckins(uid, userToken);
        const rows: any[] = Array.isArray(allRecords) ? allRecords : ((allRecords as any)?.rows ?? []);

        // Agrupar todos los registros por día — si hay consumo ese día es malo
        const allDays = this.groupByDay(rows);

        const now = new Date();
        const startOfThisWeek = this.getStartOfWeek(now, 0);
        const startOfLastWeek = this.getStartOfWeek(now, 1);
        const endOfLastWeek = new Date(startOfThisWeek.getTime() - 1);

        const thisWeekDays = allDays.filter((d) => new Date(d.fecha) >= startOfThisWeek);
        const lastWeekDays = allDays.filter((d) => {
            const f = new Date(d.fecha);
            return f >= startOfLastWeek && f <= endOfLastWeek;
        });

        return {
            animo: this.buildAnimoFrase(thisWeekDays, lastWeekDays),
            sobriedad: this.buildSobriedadFrase(thisWeekDays, lastWeekDays),
            detonantes: this.buildDetonantesFrase(rows),
        };
    }

    // Agrupa registros por día — si hay aunque sea un consumo:true ese día es malo
    private groupByDay(rows: any[]): Array<{ fecha: string; consumo: boolean; emocion: string }> {
        const dayMap = new Map<string, { consumo: boolean; emocion: string; lastFecha: string }>();

        rows.forEach((r: any) => {
            const fecha = new Date(r.fecha);
            const dia = fecha.toISOString().split('T')[0];
            const consumo = r.consumo === true || r.consumo === 'true';

            if (dayMap.has(dia)) {
                const existing = dayMap.get(dia)!;
                // Si hay aunque sea un consumo ese día es malo — no se puede revertir
                if (consumo) existing.consumo = true;
                // Para emoción tomamos el último registro del día
                existing.emocion = r.emocion;
                existing.lastFecha = r.fecha;
            } else {
                dayMap.set(dia, {
                    consumo,
                    emocion: r.emocion,
                    lastFecha: r.fecha,
                });
            }
        });

        return Array.from(dayMap.entries()).map(([dia, data]) => ({
            fecha: data.lastFecha,
            consumo: data.consumo,
            emocion: data.emocion,
        }));
    }

    private getStartOfWeek(date: Date, weeksAgo: number): Date {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff - weeksAgo * 7);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    private avg(scores: number[]): number {
        if (!scores.length) return 0;
        return scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    private pctChange(current: number, previous: number): number {
        if (previous === 0) return 100;
        const raw = Math.round(((current - previous) / previous) * 100);
        return Math.min(raw, 99);
    }

    private getTop(counts: Record<string, number>): string {
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    }

    private buildAnimoFrase(thisWeek: any[], lastWeek: any[]): string {
        const scoresThis = thisWeek
            .map((r) => EMOTION_SCORE[r.emocion?.toLowerCase()] ?? null)
            .filter((s) => s !== null) as number[];

        const scoresLast = lastWeek
            .map((r) => EMOTION_SCORE[r.emocion?.toLowerCase()] ?? null)
            .filter((s) => s !== null) as number[];

        if (!scoresThis.length) return 'No tienes registros esta semana aún.';
        if (!scoresLast.length) return '¡Esta es tu primera semana registrada, sigue así!';

        const avgThis = this.avg(scoresThis);
        const avgLast = this.avg(scoresLast);
        const pct = Math.abs(this.pctChange(avgThis, avgLast));

        if (avgThis > avgLast) return `Tu ánimo ha mejorado un ${pct}% esta semana.`;
        if (avgThis < avgLast) return `Tu ánimo ha bajado un ${pct}% esta semana.`;
        return 'Tu ánimo se ha mantenido estable esta semana.';
    }

    private buildSobriedadFrase(thisWeek: any[], lastWeek: any[]): string {
        if (!thisWeek.length) return 'No tienes registros esta semana aún.';

        const sobriosThis = thisWeek.filter((r) => r.consumo === false).length;
        const totalThis = thisWeek.length;

        if (!lastWeek.length) {
            if (sobriosThis === totalThis) return '¡Llevas toda la semana sin consumir, excelente!';
            if (sobriosThis === 0) return 'No tuviste días sobrios esta semana, ¡sigue intentando!';
            return `Llevas ${sobriosThis} día(s) sobrio(s) esta semana.`;
        }

        const sobriosLast = lastWeek.filter((r) => r.consumo === false).length;

        if (sobriosThis === totalThis) return '¡Llevas toda la semana sin consumir, excelente!';
        if (sobriosThis === 0 && sobriosLast === 0) return 'No tuviste días sobrios esta semana, ¡sigue intentando!';
        if (sobriosThis === 0) return 'Esta semana no tuviste días sobrios, la semana pasada sí. ¡No te rindas!';
        if (sobriosLast === 0) return `Llevas ${sobriosThis} día(s) sobrio(s) esta semana.`;

        const pct = Math.abs(this.pctChange(sobriosThis, sobriosLast));

        if (sobriosThis > sobriosLast) return `Tu promedio de días sobrios aumentó un ${pct}% esta semana.`;
        if (sobriosThis < sobriosLast) return `Tu promedio de días sobrios bajó un ${pct}% esta semana.`;
        return 'Mantuviste los mismos días sobrios que la semana pasada.';
    }

    private buildDetonantesFrase(allRows: any[]): string {
        // Detonantes sí usan registros individuales — queremos saber
        // en qué contextos específicos ocurrió el consumo
        const conConsumo = allRows.filter((r) => r.consumo === true);
        if (!conConsumo.length) return 'No tienes detonantes registrados, ¡sigue así!';

        const socialCount: Record<string, number> = {};
        const ubicacionCount: Record<string, number> = {};

        for (const r of conConsumo) {
            if (r.social) socialCount[r.social] = (socialCount[r.social] ?? 0) + 1;
            if (r.ubicacion) ubicacionCount[r.ubicacion] = (ubicacionCount[r.ubicacion] ?? 0) + 1;
        }

        const topSocialRaw = this.getTop(socialCount);
        const topUbicacionRaw = this.getTop(ubicacionCount);

        const topSocial = SOCIAL_LABEL[topSocialRaw?.toLowerCase()] ?? topSocialRaw;
        const topUbicacion = UBICACION_LABEL[topUbicacionRaw?.toLowerCase()] ?? topUbicacionRaw;

        if (topSocial && topUbicacion) {
            return `Tus principales detonantes han sido ${topSocial} y ${topUbicacion}.`;
        }
        if (topSocial) return `Tu principal detonante ha sido ${topSocial}.`;
        if (topUbicacion) return `Tu principal detonante ha sido ${topUbicacion}.`;

        return 'No tienes detonantes registrados, ¡sigue así!';
    }
}