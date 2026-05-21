// analysis/utils/analyticsOrchestrator.ts

import { DailyCheckin, Metrics, AnalysisResult, AnalysisMessages, EmotionData, LocationData, PersonData, TimelinePoint } from '../types/analysis';
import { DateUtils } from './dateUtils';
import { EMOTION_MAP, getEmotionValue } from './chartConfig';

export class AnalyticsOrchestrator {
  /**
   * Analiza registros diarios y genera métricas e insights
   */
  static analyze(registros: DailyCheckin[], timeframe: 'week' | 'month'): AnalysisResult {
    // 1. Obtener período actual y anterior
    const { current, previous } = DateUtils.getPeriod(timeframe);

    // 2. Filtrar registros por período
    const currentRecords = registros.filter(r => DateUtils.isInRange(r.fecha, current.start, current.end));
    const previousRecords = registros.filter(r => DateUtils.isInRange(r.fecha, previous.start, previous.end));

    // 3. Calcular métricas
    const metrics = this.calculateMetrics(currentRecords, previousRecords);

    // 4. Generar mensajes
    const messages = this.generateMessages(metrics);

    return {
      metrics,
      messages,
      period: timeframe,
    };
  }

  /**
   * Calcula todas las métricas
   */
  private static calculateMetrics(currentRecords: DailyCheckin[], previousRecords: DailyCheckin[]): Metrics {
    const uniqueDates = DateUtils.getUniqueDates(currentRecords);
    const consumptionDates = new Set(
      currentRecords.filter(r => r.consumo).map(r => r.fecha)
    );

    const currentSobrietyDays = uniqueDates.length - consumptionDates.size;
    const currentSobrietyPercent = uniqueDates.length > 0 ? Math.round((currentSobrietyDays / uniqueDates.length) * 100) : 0;

    // Calcular período anterior
    const previousUniqueDates = DateUtils.getUniqueDates(previousRecords);
    const previousConsumptionDates = new Set(
      previousRecords.filter(r => r.consumo).map(r => r.fecha)
    );
    const previousSobrietyDays = previousUniqueDates.length - previousConsumptionDates.size;
    const previousSobrietyPercent = previousUniqueDates.length > 0 ? Math.round((previousSobrietyDays / previousUniqueDates.length) * 100) : 0;

    return {
      totalDays: uniqueDates.length,
      sobrietyDays: currentSobrietyDays,
      sobrietyPercent: currentSobrietyPercent,
      consumptionDays: consumptionDates.size,
      consumptionPercent: 100 - currentSobrietyPercent,
      topEmotions: this.getTopEmotions(currentRecords),
      topLocations: this.getTopLocations(currentRecords),
      topPeople: this.getTopPeople(currentRecords),
      timeline: this.generateTimeline(currentRecords),
      comparison: {
        sobrietyChange: currentSobrietyPercent - previousSobrietyPercent,
        emotionalImprovement: this.calculateEmotionalImprovement(currentRecords, previousRecords),
        previousPeriodSobriety: previousSobrietyPercent,
      },
    };
  }

  /**
   * Obtiene las emociones más frecuentes en días con consumo
   */
  private static getTopEmotions(records: DailyCheckin[]): EmotionData[] {
    const emotionCounts: Record<string, { count: number; emoji: string }> = {};

    // Contar TODAS las emociones en registros con consumo=true
    records
      .filter(r => r.consumo)
      .forEach(r => {
        if (!emotionCounts[r.emocion]) {
          const emoji = EMOTION_MAP[r.emocion]?.emoji || '😐';
          emotionCounts[r.emocion] = { count: 0, emoji };
        }
        emotionCounts[r.emocion].count += 1;
      });

    const total = Object.values(emotionCounts).reduce((sum, e) => sum + e.count, 0);

    return Object.entries(emotionCounts)
      .map(([label, data]) => ({
        label,
        count: data.count,
        emoji: data.emoji,
        percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7); // Top 7
  }

  /**
   * Obtiene las ubicaciones más frecuentes en días con consumo
   */
  private static getTopLocations(records: DailyCheckin[]): LocationData[] {
    const locationCounts: Record<string, number> = {};

    records
      .filter(r => r.consumo && r.ubicacion)
      .forEach(r => {
        locationCounts[r.ubicacion!] = (locationCounts[r.ubicacion!] || 0) + 1;
      });

    const total = Object.values(locationCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(locationCounts)
      .map(([label, count]) => ({
        label,
        count,
        emoji: this.getLocationEmoji(label),
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  }

  /**
   * Obtiene las personas más frecuentes en días con consumo
   */
  private static getTopPeople(records: DailyCheckin[]): PersonData[] {
    const peopleCounts: Record<string, number> = {};

    records
      .filter(r => r.consumo && r.social)
      .forEach(r => {
        peopleCounts[r.social!] = (peopleCounts[r.social!] || 0) + 1;
      });

    const total = Object.values(peopleCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(peopleCounts)
      .map(([label, count]) => ({
        label,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6
  }

  /**
   * Genera timeline de emociones
   */
  private static generateTimeline(records: DailyCheckin[]): TimelinePoint[] {
    return records
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .map(r => ({
        timestamp: r.fecha,
        emocionValue: getEmotionValue(r.emocion),
        emocion: r.emocion,
      }));
  }

  /**
   * Calcula mejora emocional entre períodos
   */
  private static calculateEmotionalImprovement(current: DailyCheckin[], previous: DailyCheckin[]): number {
    const currentAvg = this.calculateEmotionalAverage(current);
    const previousAvg = this.calculateEmotionalAverage(previous);

    if (previousAvg === 0) return 0;

    // Si el promedio BAJA (1 es mejor que 7), es mejora
    const improvement = ((previousAvg - currentAvg) / previousAvg) * 100;
    return Math.round(improvement);
  }

  /**
   * Calcula el promedio emocional (1-7)
   */
  private static calculateEmotionalAverage(records: DailyCheckin[]): number {
    if (records.length === 0) return 0;
    const sum = records.reduce((total, r) => total + getEmotionValue(r.emocion), 0);
    return sum / records.length;
  }

  /**
   * Genera mensajes inteligentes basados en métricas
   */
  private static generateMessages(metrics: Metrics): AnalysisMessages {
    const topEmotion = metrics.topEmotions[0];
    const topLocation = metrics.topLocations[0];
    const topPerson = metrics.topPeople[0];

    let topTriggerType: 'emotion' | 'location' | 'person' = 'emotion';
    let topTrigger = topEmotion?.label || 'Desconocido';

    // Determinar cuál es el detonante principal (más frecuente)
    if (topLocation && topPerson) {
      const locationVsPerson = topLocation.count >= topPerson.count ? topLocation.count : topPerson.count;
      const emotionVsOthers = topEmotion.count >= locationVsPerson ? topEmotion.count : locationVsPerson;

      if (emotionVsOthers === topLocation.count) {
        topTrigger = topLocation.label;
        topTriggerType = 'location';
      } else if (emotionVsOthers === topPerson.count) {
        topTrigger = topPerson.label;
        topTriggerType = 'person';
      }
    }

    return {
      sobriety: this.generateSobrietyMessage(metrics),
      topTrigger,
      topTriggerType,
      improvement: this.generateImprovementMessage(metrics),
      riskZone: topLocation?.label || 'Desconocida',
      riskPerson: topPerson?.label || 'No identificada',
    };
  }

  /**
   * Genera mensaje de sobriedad
   */
  private static generateSobrietyMessage(metrics: Metrics): string {
    const change = metrics.comparison.sobrietyChange;
    const changeText = change > 0 ? `aumentó ${change}%` : change < 0 ? `disminuyó ${Math.abs(change)}%` : 'se mantuvo igual';

    return `Tu promedio de sobriedad fue ${metrics.sobrietyPercent}% (${changeText} respecto al período anterior)`;
  }

  /**
   * Genera mensaje de mejora emocional
   */
  private static generateImprovementMessage(metrics: Metrics): string {
    const improvement = metrics.comparison.emotionalImprovement;

    if (improvement > 10) {
      return `Tu estado emocional mejoró significativamente (+${improvement}%)`;
    } else if (improvement > 0) {
      return `Tu estado emocional mostró ligera mejoría (+${improvement}%)`;
    } else if (improvement < -10) {
      return `Tu estado emocional ha sido más desafiante (${improvement}%)`;
    } else if (improvement < 0) {
      return `Tu estado emocional requiere más atención (${improvement}%)`;
    } else {
      return 'Tu estado emocional se ha mantenido estable';
    }
  }

  /**
   * Obtiene emoji de ubicación
   */
  private static getLocationEmoji(location: string): string {
    const emojis: Record<string, string> = {
      'En mi casa': '🏠',
      'En casa de un amigo': '🏡',
      'En el barrio / calle': '🏙️',
      'En la universidad': '🎓',
      'En un bar o disco': '🪩',
    };
    return emojis[location] || '📍';
  }
}