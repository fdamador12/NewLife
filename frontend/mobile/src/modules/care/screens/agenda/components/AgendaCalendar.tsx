import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const COLORS = {
  primary: '#D38A58',
  white: '#FFFFFF',
  gray: '#969696',
  darkGray: '#404040',
  background: '#FAFAFA',
};

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

const DAY_ITEM_WIDTH = 48;
const DAY_ITEM_GAP = 8;

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

interface AgendaCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  currentMonth: number;
  currentYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  hasEvent: (day: number) => boolean;
}

export default function AgendaCalendar({
  selectedDate,
  onDateSelect,
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth,
  hasEvent,
}: AgendaCalendarProps) {
  const calendarScrollRef = useRef<ScrollView>(null);

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  useEffect(() => {
    const targetDay = currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear()
      ? selectedDate.getDate()
      : currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()
        ? new Date().getDate()
        : 1;

    const scrollX = (targetDay - 1) * (DAY_ITEM_WIDTH + DAY_ITEM_GAP) - 120;

    setTimeout(() => {
      calendarScrollRef.current?.scrollTo({ x: Math.max(0, scrollX), animated: true });
    }, 100);
  }, [currentMonth, currentYear, selectedDate]);

  return (
    <View style={styles.calendarCard}>
      <View style={styles.monthPicker}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.monthArrow}>
          <Feather name="chevron-left" size={20} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[currentMonth]} {currentYear}</Text>
        <TouchableOpacity onPress={onNextMonth} style={styles.monthArrow}>
          <Feather name="chevron-right" size={20} color={COLORS.darkGray} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={calendarScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysScroll}
      >
        {days.map((day) => {
          const date = new Date(currentYear, currentMonth, day);
          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);
          const hasEv = hasEvent(day);

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayItem,
                isSelected && styles.dayItemSelected,
                isTodayDate && !isSelected && styles.dayItemToday,
              ]}
              onPress={() => onDateSelect(date)}
            >
              <Text style={[styles.dayName, isSelected && styles.dayTextSelected]}>
                {WEEK_DAYS[date.getDay()]}
              </Text>
              <Text style={[styles.dayNumber, isSelected && styles.dayTextSelected]}>
                {day}
              </Text>
              {hasEv && <View style={[styles.eventDot, isSelected && styles.eventDotSelected]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
  },
  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: { fontSize: 16, fontWeight: '600', color: COLORS.darkGray },
  daysScroll: { gap: DAY_ITEM_GAP, paddingHorizontal: 4 },
  dayItem: {
    width: DAY_ITEM_WIDTH,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.background,
    gap: 4,
  },
  dayItemSelected: { backgroundColor: COLORS.primary },
  dayItemToday: { borderWidth: 1.5, borderColor: COLORS.primary },
  dayName: { fontSize: 11, fontWeight: '500', color: COLORS.gray },
  dayNumber: { fontSize: 18, fontWeight: '700', color: COLORS.darkGray },
  dayTextSelected: { color: COLORS.white },
  eventDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary },
  eventDotSelected: { backgroundColor: COLORS.white },
});