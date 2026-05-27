import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSizes, spacing } from '../../../../../../constants/theme';
import { CalendarEvent } from '../../data/colombianEvents';
import { getEventDotColors } from '../../data/eventColors';

interface Props {
  day: number;
  isSelected: boolean;
  isClean: boolean;
  isDifficult: boolean;
  events: CalendarEvent[];
  onPress: (day: number) => void;
}

export default function CalendarDayCell({
  day,
  isSelected,
  isClean,
  isDifficult,
  events,
  onPress,
}: Props) {
  const dotColors = getEventDotColors(events.map(e => e.type));

  return (
    <TouchableOpacity style={styles.dayCell} onPress={() => onPress(day)}>
      <View
        style={[
          styles.dayCircle,
          isClean && styles.dayCircleClean,
          isDifficult && styles.dayCircleDifficult,
          isSelected && styles.dayCircleSelected,
        ]}
      >
        <Text
          style={[
            styles.dayText,
            isClean && styles.dayTextClean,
            isDifficult && styles.dayTextDifficult,
            isSelected && styles.dayTextSelected,
          ]}
        >
          {day}
        </Text>
      </View>
      {dotColors.length > 0 && (
        <View style={styles.dotsRow}>
          {dotColors.map((color, i) => (
            <View key={i} style={[styles.eventDot, { backgroundColor: color }]} />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleClean: { backgroundColor: '#4A7BF7' },
  dayCircleDifficult: { backgroundColor: colors.accent },
  dayCircleSelected: {
    borderWidth: 2,
    borderColor: colors.text,
    borderRadius: 16, // ✅ fix círculo seleccionado
  },
  dayText: {
    fontSize: fontSizes.xs,
    color: colors.text,
    fontWeight: '500',
  },
  dayTextClean: { color: colors.white, fontWeight: '700' },
  dayTextDifficult: { color: colors.white, fontWeight: '700' },
  dayTextSelected: { fontWeight: '700' },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
    height: 6,
    alignItems: 'center',
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});