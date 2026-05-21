import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AnimatedEmotionBar } from './AnimatedComponents';
import { styles } from '../styles/analysisStyles';
import { colors } from '../../../../../constants/theme';

const CONSUMPTION_COLOR = '#4CAF50'; // Verde (mismo que Tranquilo)

export const ConsumptionByDayChart = ({
  data,
  maxHeight = 160,
}: {
  data: Array<{ label: string; value: number; active: boolean }>;
  maxHeight?: number;
}) => {
  // ✨ FILTRAR: solo días con value > 0
  const activeDays = data.filter(item => item.value > 0);

  // ✨ VALIDACIÓN: SI NO HAY DÍAS CON VALUE > 0, NO RENDERIZA NADA
  if (activeDays.length === 0) {
    return null;
  }

  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  // ✨ Encontrar el valor máximo
  const maxValue = Math.max(...activeDays.map(e => e.value));

  return (
    <View style={styles.card}>
      {/* ✨ HEADER CON ICONO Y TÍTULO */}
      <View style={styles.cardHeader}>
        <Feather name="calendar" size={20} color={colors.primary} />
        <Text style={styles.cardTitle}>Consumo por día</Text>
      </View>

      {/* ✨ DESCRIPCIÓN */}
      <Text style={styles.cardDescription}>
        Qué días de la semana consumes más frecuentemente.
      </Text>

      {/* ✨ GRÁFICA */}
      <View style={styles.emotionBarContainer}>
        {data.map((item, index) => {
          // Mostrar todos los días, pero con diferentes alturas
          const barHeight = item.value > 0 
            ? (item.value / maxValue) * maxHeight 
            : maxHeight * 0.05; // Línea mínima si no hay consumo

          return (
            <View key={index} style={styles.emotionBarWrapper}>
              {/* ✨ BARRA GRIS DE FONDO */}
              <View style={[styles.emotionBarBackground, { height: barHeight }]}>
                
                {/* ✨ BARRA COLOREADA (VERDE) */}
                <AnimatedEmotionBar
                  progress={animationProgress}
                  height={barHeight}
                  color={CONSUMPTION_COLOR}
                  inactive={!item.active}
                  maxHeight={barHeight}
                />
                
                {/* ✨ PORCENTAJE DENTRO DE LA BARRA (solo si > 0) */}
                {item.value > 0 && (
                  <Text style={styles.emotionPercentageLabel}>
                    {item.value}%
                  </Text>
                )}
              </View>
              <Text style={styles.emotionLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};