// frontend/mobile/src/modules/progress/screens/analysis/components/ChartBarHorizontal.tsx

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, fontSizes } from '../../../../../constants/theme';

interface BarData {
  label: string;
  value: number;
  color?: string;
  porcentaje?: number;
}

interface ChartBarHorizontalProps {
  data: BarData[];
  height?: number;
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - spacing.xl * 2 - spacing.lg * 2 - 100;

export default function ChartBarHorizontal({
  data,
  height = 200,
}: ChartBarHorizontalProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No hay datos disponibles</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <View style={styles.container}>
      {data.map((item, idx) => {
        const barWidth = (item.value / maxValue) * CHART_WIDTH;
        const color = item.color || colors.primary;

        return (
          <View key={idx} style={styles.barRow}>
            <Text style={styles.barLabel}>{item.label}</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    width: barWidth,
                    backgroundColor: color,
                  },
                ]}
              >
                <Text style={styles.barValue}>{item.value}</Text>
              </View>
            </View>
            {item.porcentaje && (
              <Text style={styles.barPercentage}>{item.porcentaje}%</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  barLabel: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '600',
    width: 80,
  },
  barContainer: {
    flex: 1,
    height: 28,
    backgroundColor: colors.border,
    borderRadius: 4,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  barValue: {
    fontSize: fontSizes.xs,
    color: colors.white,
    fontWeight: '600',
  },
  barPercentage: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
    width: 35,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});