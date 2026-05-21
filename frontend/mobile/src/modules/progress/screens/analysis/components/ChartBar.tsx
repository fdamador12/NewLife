// frontend/mobile/src/modules/progress/screens/analysis/components/ChartBar.tsx

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, fontSizes } from '../../../../../constants/theme';

interface BarData {
  label: string;
  value: number;
  color?: string;
  porcentaje?: number;
}

interface ChartBarProps {
  data: BarData[];
  height?: number;
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - spacing.xl * 2 - spacing.lg * 2;

export default function ChartBar({ data, height = 250 }: ChartBarProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No hay datos disponibles</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = CHART_WIDTH / data.length - spacing.xs;

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.barsContainer}>
        {data.map((item, idx) => {
          const barHeight = (item.value / maxValue) * (height - 80);
          const color = item.color || colors.primary;

          return (
            <View key={idx} style={styles.barWrapper}>
              <View style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      width: barWidth,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel} numberOfLines={2}>{item.label}</Text>
              <Text style={styles.barValue}>{item.value}</Text>
              {item.porcentaje && (
                <Text style={styles.barPercentage}>{item.porcentaje}%</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'flex-end',
    paddingBottom: spacing.md,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  barColumn: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    borderRadius: 4,
    minHeight: 8,
  },
  barLabel: {
    fontSize: fontSizes.xs,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  barValue: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: '500',
  },
  barPercentage: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});