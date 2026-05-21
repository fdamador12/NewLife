// analysis/types/analysis.ts

export interface DailyCheckin {
  id: string;
  fecha: string;
  emocion: string;
  consumo: boolean;
  ubicacion?: string;
  social?: string;
  reflexion?: string;
  gratitud?: string;
}

export interface EmotionData {
  label: string;
  count: number;
  emoji: string;
  percentage: number;
}

export interface LocationData {
  label: string;
  count: number;
  emoji: string;
  percentage: number;
}

export interface PersonData {
  label: string;
  count: number;
  percentage: number;
}

export interface TimelinePoint {
  timestamp: string;
  emocionValue: number;
  emocion: string;
}

export interface Metrics {
  totalDays: number;
  sobrietyDays: number;
  sobrietyPercent: number;
  consumptionDays: number;
  consumptionPercent: number;
  topEmotions: EmotionData[];
  topLocations: LocationData[];
  topPeople: PersonData[];
  timeline: TimelinePoint[];
  comparison: {
    sobrietyChange: number; // porcentaje de cambio
    emotionalImprovement: number;
    previousPeriodSobriety: number;
  };
}

export interface AnalysisResult {
  metrics: Metrics;
  messages: AnalysisMessages;
  period: 'week' | 'month';
}

export interface AnalysisMessages {
  sobriety: string;
  topTrigger: string;
  topTriggerType: 'emotion' | 'location' | 'person';
  improvement: string;
  riskZone: string;
  riskPerson: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface PieChartData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}