// frontend/mobile/src/modules/progress/screens/analysis/components/ChartPie.tsx

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, fontSizes, borderRadius } from '../../../../../constants/theme';

interface PieData {
  label: string;
  value: number;
  color: string;
  porcentaje: number;
}

interface ChartPieProps {
  data: PieData[];
  size?: number;
}

const { width } = Dimensions.get('window');

// Función simple para dibujar un pastel con SVG
function generatePieSlices(data: PieData[], radius: number) {
  let currentAngle = 0;
  const slices = [];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const sliceAngle = (item.value / total) * 360;
    slices.push({
      label: item.label,
      color: item.color,
      startAngle: currentAngle,
      endAngle: currentAngle + sliceAngle,
      porcentaje: item.porcentaje,
    });
    currentAngle += sliceAngle;
  }

  return slices;
}

export default function ChartPie({ data, size = 200 }: ChartPieProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No hay datos disponibles</Text>
      </View>
    );
  }

  const slices = generatePieSlices(data, size / 2);

  return (
    <View style={styles.container}>
      {/* Contenedor simple - usando rectángulos de color apilados */}
      <View style={styles.donutContainer}>
        {data.map((item, idx) => (
          <View
            key={idx}
            style={[
              styles.donutSegment,
              {
                flex: item.value,
                backgroundColor: item.color,
              },
            ]}
          >
            <Text style={styles.donutLabel}>{item.porcentaje}%</Text>
          </View>
        ))}
      </View>

      {/* Leyenda */}
      <View style={styles.legend}>
        {data.map((item, idx) => (
          <View key={idx} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: item.color },
              ]}
            />
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendLabel}>{item.label}</Text>
              <Text style={styles.legendValue}>
                {item.value} ({item.porcentaje}%)
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  donutContainer: {
    flexDirection: 'column',
    height: 40,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  donutSegment: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutLabel: {
    fontSize: fontSizes.xs,
    color: colors.white,
    fontWeight: '700',
  },
  legend: {
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '600',
  },
  legendValue: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});