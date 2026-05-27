import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSizes } from '../../../../../constants/theme';
import { useCalendarData } from '../hooks/useCalendarData';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { CalendarEvent } from '../data/colombianEvents';
import CalendarGrid from './components/CalendarGrid';
import CalendarLegend from './components/CalendarLegend';
import DayDetail from './components/DayDetail';

const WEEK_DAYS = ['Lun', 'Mar', 'Mier', 'Jue', 'Vier', 'Sab', 'Dom'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const getDaysInMonth = (month: number, year: number): number =>
  new Date(year, month, 0).getDate();

const getFirstDayOfMonth = (month: number, year: number): number => {
  const firstDay = new Date(year, month - 1, 1).getDay();
  return firstDay === 0 ? 6 : firstDay - 1;
};

const toLocalDateString = (year: number, month: number, day: number): string =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export default function CalendarScreen({ navigation }: any) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const {
    currentMonth,
    currentYear,
    processedDays,
    loading,
    error,
    goToPreviousMonth,
    goToNextMonth,
    loadInitial,
    isPrevDisabled,
    isNextDisabled,
  } = useCalendarData();

  const calendarEvents = useCalendarEvents(currentYear);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    const today = new Date();
    if (today.getMonth() + 1 === currentMonth && today.getFullYear() === currentYear) {
      setSelectedDay(today.getDate());
    } else {
      setSelectedDay(null);
    }
  }, [currentMonth, currentYear]);

  const generateCalendarGrid = (): (number | null)[] => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const grid: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) grid.push(null);
    for (let day = 1; day <= daysInMonth; day++) grid.push(day);
    return grid;
  };

  const getEventsForDay = (day: number): CalendarEvent[] => {
    const key = toLocalDateString(currentYear, currentMonth, day);
    return calendarEvents[key] || [];
  };

  // ✅ Todos los eventos del mes actual — para la leyenda dinámica
  const monthEvents = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const allEvents: CalendarEvent[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      allEvents.push(...getEventsForDay(day));
    }
    return allEvents;
  }, [currentMonth, currentYear, calendarEvents]);

  const dayMap = new Map(processedDays.map((d: any) => [d.day, d]));
  const calendarGrid = generateCalendarGrid();
  const selectedDayInfo = selectedDay
    ? processedDays.find((d: any) => d.day === selectedDay) || null
    : null;
  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity
          style={[styles.navButton, isPrevDisabled() && styles.buttonDisabled]}
          onPress={goToPreviousMonth}
          disabled={isPrevDisabled()}
        >
          <Feather
            name="chevron-left"
            size={18}
            color={isPrevDisabled() ? colors.border : colors.text}
          />
        </TouchableOpacity>
        <View style={styles.titleWrapper}>
          <Text style={styles.monthText}>{MONTH_NAMES[currentMonth - 1]}</Text>
          <Text style={styles.yearText}>{currentYear}</Text>
        </View>
        <TouchableOpacity
          style={[styles.navButton, isNextDisabled() && styles.buttonDisabled]}
          onPress={goToNextMonth}
          disabled={isNextDisabled()}
        >
          <Feather
            name="chevron-right"
            size={18}
            color={isNextDisabled() ? colors.border : colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* ── Días de la semana ────────────────────────────────────────────── */}
      <View style={styles.weekRow}>
        {WEEK_DAYS.map((d) => (
          <Text key={d} style={styles.weekDay}>{d}</Text>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando calendario...</Text>
        </View>
      ) : (
        <>
          <CalendarGrid
            calendarGrid={calendarGrid}
            dayMap={dayMap}
            selectedDay={selectedDay}
            getEventsForDay={getEventsForDay}
            onDayPress={setSelectedDay}
          />

          {/* ✅ Leyenda dinámica según eventos del mes */}
          <CalendarLegend monthEvents={monthEvents} />

          {selectedDay && (
            <DayDetail
              dayInfo={selectedDayInfo}
              events={selectedDayEvents}
              selectedDay={selectedDay}
              currentMonth={currentMonth}
              currentYear={currentYear}
              onSOSPress={() => navigation?.navigate('SOS')}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  titleWrapper: { alignItems: 'center' },
  monthText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  yearText: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.accent,
    textAlign: 'center',
  },
});