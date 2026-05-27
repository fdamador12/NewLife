import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSizes, spacing } from '../../../../../../constants/theme';
import { CalendarEvent } from '../../data/colombianEvents';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '../../data/eventColors';

interface Props {
  monthEvents: CalendarEvent[];
}

export default function CalendarLegend({ monthEvents }: Props) {
  // ✅ Calcular tipos únicos presentes en el mes
  const uniqueTypes = Array.from(new Set(monthEvents.map(e => e.type)));

  return (
    <View style={styles.legend}>
      {/* ✅ Leyenda fija — siempre visible */}
      <View style={styles.legendItem}>
        <View style={styles.legendDotOutline} />
        <Text style={styles.legendText}>Hoy</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: '#4A7BF7' }]} />
        <Text style={styles.legendText}>Día limpio</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
        <Text style={styles.legendText}>Día difícil</Text>
      </View>

      {/* ✅ Leyenda dinámica — solo tipos presentes en el mes */}
      {uniqueTypes.map(type => (
        <View key={type} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: EVENT_TYPE_COLORS[type] }]} />
          <Text style={styles.legendText}>{EVENT_TYPE_LABELS[type]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendDotOutline: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.text,
  },
  legendText: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
});