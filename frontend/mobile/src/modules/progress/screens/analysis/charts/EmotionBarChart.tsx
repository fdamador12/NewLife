import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { AnimatedEmotionBar } from './AnimatedComponents';
import { getEmotionColor } from '../utils/emotionColorMap';
import { styles } from '../styles/analysisStyles';
import { colors } from '../../../../../constants/theme';

export const EmotionBarChart = ({
  data,
  maxHeight = 160,
}: {
  data: Array<{ label: string; value: number; active: boolean }>;
  maxHeight?: number;
}) => {
  // ✨ FILTRAR: solo emociones con value > 0
  const activeEmotions = data.filter(item => item.value > 0);

  // ✨ VALIDACIÓN: SI NO HAY EMOCIONES CON VALUE > 0, NO RENDERIZA NADA
  if (activeEmotions.length === 0) {
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
  const maxValue = Math.max(...activeEmotions.map(e => e.value));

  return (
    <View style={styles.card}>
      {/* ✨ HEADER CON ICONO Y TÍTULO */}
      <View style={styles.cardHeader}>
        <Feather name="bar-chart-2" size={20} color={colors.primary} />
        <Text style={styles.cardTitle}>Tus emociones generales</Text>
      </View>

      {/* ✨ DESCRIPCIÓN */}
      <Text style={styles.cardDescription}>
        Cómo te has sentido en tus últimos registros.
      </Text>

      {/* ✨ GRÁFICA */}
      <View style={styles.emotionBarContainer}>
        {activeEmotions.map((item, index) => {
          // ✨ Altura proporcional: máximo = 100% del maxHeight disponible
          const barHeight = (item.value / maxValue) * maxHeight;

          return (
            <View key={index} style={styles.emotionBarWrapper}>
              {/* ✨ BARRA GRIS DE FONDO */}
              <View style={[styles.emotionBarBackground, { height: barHeight }]}>
                
                {/* ✨ BARRA COLOREADA */}
                <AnimatedEmotionBar
                  progress={animationProgress}
                  height={barHeight}
                  color={getEmotionColor(item.label)}
                  inactive={!item.active}
                  maxHeight={barHeight}
                />
                
                {/* ✨ PORCENTAJE DENTRO DE LA BARRA */}
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