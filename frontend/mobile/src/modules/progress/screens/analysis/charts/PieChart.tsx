import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../../../../constants/theme';
import { AnimatedPieSlice } from './AnimatedComponents';
import { styles } from '../styles/analysisStyles';

export const PieChart = ({
  data,
  size = 220,
  tooltipLabel = '',
  tooltipValue = '',
}: {
  data: Array<{ label: string; value: number; color: string; porcentaje?: number }>;
  size?: number;
  tooltipLabel?: string;
  tooltipValue?: string;
}) => {
  const animationProgress = useSharedValue(0);
  const radius = size / 2;
  const center = size / 2;

  useEffect(() => {
    animationProgress.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  // ✅ CONTROL TOTAL
  if (!data || data.length === 0) {
    return null;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  let currentAngle = -90;

  const slices = data.map((item, index) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...item, startAngle, angle, index };
  });

  return (
    <View style={[styles.card, styles.lastCard]}>
      
      {/* HEADER */}
      <View style={styles.cardHeader}>
        <Feather name="map-pin" size={20} color={colors.primary} />
        <Text style={styles.cardTitle}>Zonas de mayor riesgo</Text>
      </View>

      <Text style={styles.cardDescription}>
        Puntos sensibles en espacios sociales.
      </Text>

      {/* CHART */}
      <View style={styles.pieWrapper}>
        <View style={styles.pieContainer}>
          <Svg width={size} height={size}>
            <G>
              {data.length === 1 ? (
                <Circle
                  cx={center}
                  cy={center}
                  r={radius - 10}
                  fill={data[0].color}
                />
              ) : (
                slices.map((slice) => (
                  <AnimatedPieSlice
                    key={slice.index}
                    slice={slice}
                    radius={radius}
                    center={center}
                    progress={animationProgress}
                  />
                ))
              )}
            </G>
          </Svg>

          {tooltipValue && (
            <View style={styles.pieTooltip}>
              <Text style={styles.pieTooltipText}>
                {data.length === 1
                  ? `${data[0].label}: 100%`
                  : `${tooltipLabel}: ${tooltipValue}%`}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* LEGEND */}
      <PieLegend data={data} />
    </View>
  );
};

export const PieLegend = ({
  data,
}: {
  data: Array<{ label: string; value: number; color: string; porcentaje?: number }>;
}) => {
  if (!data || data.length === 0) return null;

  const rows = [];
  for (let i = 0; i < data.length; i += 2) {
    rows.push(data.slice(i, i + 2));
  }

  return (
    <View style={styles.legendContainer}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.legendRow}>
          {row.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>
                {item.label} ({item.porcentaje || item.value}%)
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};