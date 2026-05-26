import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../../constants/theme';
import { useAnalysisData } from './analysis/hooks/useAnalysisData';
import { EmotionBarChart } from './analysis/charts/EmotionBarChart';
import { HorizontalBarChart } from './analysis/charts/HorizontalBarChart';
import { ConsumptionByDayChart } from './analysis/charts/ConsumptionByDayChart';
import { PieChart } from './analysis/charts/PieChart';
import { EmptyStateEmotions } from './analysis/components/EmptyStateEmotions';
import { getColorByIndex, getColorByZone } from './analysis/utils/colorHelpers';
import { styles } from './analysis/styles/analysisStyles';
import { shortenVinculoLabel, shortenZonaLabel } from './analysis/utils/labelMappers';
import { useEmotionStats } from './analysis/hooks/useEmotionStats';
import { useConsumptionByDay } from './analysis/hooks/useConsumptionByDay';
import CalendarScreen from './analysis/calendar/CalendarScreen';
import { analytics, EVENT_TYPES } from '../../../services/analytics';

export default function AnalysisScreen({ navigation }: any) {
  const { summary, riskCharts, loading, error } = useAnalysisData();
  const { emotionStats, loading: emotionLoading } = useEmotionStats();
  const { consumptionByDay, loading: consumptionLoading } = useConsumptionByDay();

  // Analytics: trackear vista de analiticas personales con view_type "chart".
  // Esta pantalla muestra los charts/graficos del usuario.
  // El calendario tambien esta embebido pero se contabiliza como "chart"
  // porque es la misma pantalla.
  useEffect(() => {
    analytics.track(EVENT_TYPES.PERSONAL_ANALYTICS_VIEWED, {
      view_type: 'chart',
    });
  }, []);

  if (loading || emotionLoading || consumptionLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
          <Text style={styles.errorText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✨ DETECTAR SI HAY EMOCIONES CON VALUE > 0
  const hasEmotions = emotionStats.some((e: any) => e.value > 0);
  console.log('📊 hasEmotions:', hasEmotions);
  console.log('📊 emotionStats:', JSON.stringify(emotionStats));
  // Preparar datos para vínculos de riesgo
  const risksLinksData =
    riskCharts?.vinculos_riesgo?.data?.map((p: any, idx: number) => ({
      label: shortenVinculoLabel(p.label),
      value: p.porcentaje || p.value,
      color: getColorByIndex(idx),
    })) || [];

    console.log('📊 riskCharts vinculos:', JSON.stringify(riskCharts?.vinculos_riesgo));
    console.log('📊 risksLinksData:', JSON.stringify(risksLinksData));
    console.log('📊 hasConsumption:', risksLinksData.length > 0);

  // ✨ DETECTAR SI HAY CONSUMO
  const hasConsumption = risksLinksData.length > 0;

  // Preparar datos para zonas de riesgo (pastel)
  const pieData =
    riskCharts?.zonas_riesgo?.data?.map((z: any) => ({
      label: shortenZonaLabel(z.label),
      value: z.value,
      color: getColorByZone(z.label),
      porcentaje: z.porcentaje,
    })) || [];

  // Encontrar la zona más peligrosa para el tooltip
  const largestZone = pieData.reduce(
    (prev, current) => (prev.value > current.value ? prev : current),
    { label: '', value: 0, porcentaje: 0 }
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Mi análisis</Text>
          <Text style={styles.headerSubtitle}>Análisis y gráficos</Text>
        </View>
      </View>

      {/* Resumen Final - SIEMPRE */}
      {summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen de tu progreso</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIconText}>💪</Text>
            <Text style={styles.summaryText}>{summary.animo}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIconText}>🌿</Text>
            <Text style={styles.summaryText}>{summary.sobriedad}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryIconText}>🔎</Text>
            <Text style={styles.summaryText}>{summary.detonantes}</Text>
          </View>
        </View>
      )}

      {/* ✅ CALENDARIO MODULAR */}
      <CalendarScreen />

      {/* SI NO HAY EMOCIONES: MOSTRAR MENSAJE VACÍO */}
      {!hasEmotions && <EmptyStateEmotions />}

      {/* SI HAY EMOCIONES: MOSTRAR TODO */}
      {hasEmotions && (
        <>
          {/* Tus Emociones Generales */}
          <EmotionBarChart data={emotionStats} />

          {/* Vínculos de Riesgo - SOLO SI HAY CONSUMO */}
          {hasConsumption && <HorizontalBarChart data={risksLinksData} />}

          {/* Consumo por Día - SOLO SI HAY CONSUMO */}
          {hasConsumption && <ConsumptionByDayChart data={consumptionByDay} />}

          {/* Zonas de Mayor Riesgo - SOLO SI HAY CONSUMO */}
          {hasConsumption && (
            <PieChart
              data={pieData}
              tooltipLabel={largestZone.label}
              tooltipValue={String(largestZone.porcentaje)}
            />
          )}
        </>
      )}
    </ScrollView>
  );
}