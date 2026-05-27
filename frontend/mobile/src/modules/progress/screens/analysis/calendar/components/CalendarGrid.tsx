import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CalendarEvent } from '../../data/colombianEvents';
import CalendarDayCell from './CalendarDayCell';

interface Props {
  calendarGrid: (number | null)[];
  dayMap: Map<number, any>;
  selectedDay: number | null;
  getEventsForDay: (day: number) => CalendarEvent[];
  onDayPress: (day: number) => void;
}

export default function CalendarGrid({
  calendarGrid,
  dayMap,
  selectedDay,
  getEventsForDay,
  onDayPress,
}: Props) {
  return (
    <View style={styles.daysGrid}>
      {calendarGrid.map((day, i) => {
        if (day === null) {
          return <View key={`empty-${i}`} style={styles.emptyCell} />;
        }

        const dayData = dayMap.get(day);
        const isSelected = selectedDay === day;
        const isClean = dayData?.tipo === 'limpio';
        const isDifficult = dayData?.tipo === 'dificil';
        const events = getEventsForDay(day);

        return (
          <View key={`day-${i}`} style={styles.dayCellWrapper}>
            <CalendarDayCell
              day={day}
              isSelected={isSelected}
              isClean={isClean}
              isDifficult={isDifficult}
              events={events}
              onPress={onDayPress}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyCell: {
    width: '14.28%',
  },
  dayCellWrapper: {
    width: '14.28%',
  },
});