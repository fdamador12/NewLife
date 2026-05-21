import React, { useState, useEffect, useCallback } from 'react';
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

const WEEK_DAYS = ['Lun', 'Mar', 'Mier', 'Jue', 'Vier', 'Sab', 'Dom'];

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month, 0).getDate();
};

const getFirstDayOfMonth = (month: number, year: number): number => {
  const firstDay = new Date(year, month - 1, 1).getDay();
  return firstDay === 0 ? 6 : firstDay - 1;
};

export default function CalendarScreen() {
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

  const generateCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const grid = [];

    for (let i = 0; i < firstDay; i++) {
      grid.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      grid.push(day);
    }

    return grid;
  };

  const getSelectedDayInfo = () => {
    if (!selectedDay) return null;
    return processedDays.find((d: any) => d.day === selectedDay) || null;
  };

  const dayMap = new Map(processedDays.map((d: any) => [d.day, d]));
  const today = new Date();
  const isCurrentMonth = today.getMonth() + 1 === currentMonth && today.getFullYear() === currentYear;
  const todayDate = today.getDate();
  const calendarGrid = generateCalendarGrid();
  const selectedDayInfo = getSelectedDayInfo();

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity
          style={[styles.calendarNavButton, isPrevDisabled() && styles.buttonDisabled]}
          onPress={goToPreviousMonth}
          disabled={isPrevDisabled()}
        >
          <Feather
            name="chevron-left"
            size={18}
            color={isPrevDisabled() ? colors.border : colors.text}
          />
        </TouchableOpacity>
        <View style={styles.calendarTitleWrapper}>
          <Text style={styles.calendarMonth}>{MONTH_NAMES[currentMonth - 1]}</Text>
          <Text style={styles.calendarYear}>{currentYear}</Text>
        </View>
        <TouchableOpacity
          style={[styles.calendarNavButton, isNextDisabled() && styles.buttonDisabled]}
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

      <View style={styles.weekRow}>
        {WEEK_DAYS.map((d) => (
          <Text key={d} style={styles.weekDay}>
            {d}
          </Text>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando calendario...</Text>
        </View>
      ) : (
        <>
          <View style={styles.daysGrid}>
            {calendarGrid.map((day, i) => {
              if (day === null) {
                return <View key={`empty-${i}`} style={styles.dayCell} />;
              }

              const dayData = dayMap.get(day);
              const isSelected = selectedDay === day;
              const isClean = dayData?.tipo === 'limpio';
              const isDifficult = dayData?.tipo === 'dificil';

              return (
                <TouchableOpacity
                  key={i}
                  style={styles.dayCell}
                  onPress={() => setSelectedDay(day)}
                >
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
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.calendarLegend}>
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
          </View>

          {selectedDay && (
            <View style={styles.dayInfo}>
              {selectedDayInfo ? (
                <>
                  {selectedDayInfo.tipo === 'dificil' ? (
                    <>
                      <Text style={styles.dayInfoRow}>
                        <Text style={styles.dayInfoLabel}>Donde estaba: </Text>
                        <Text style={styles.dayInfoValue}>{selectedDayInfo.resumen.ubicacion}</Text>
                      </Text>
                      <Text style={styles.dayInfoRow}>
                        <Text style={styles.dayInfoLabel}>Con quién estaba: </Text>
                        <Text style={styles.dayInfoValue}>{selectedDayInfo.resumen.social}</Text>
                      </Text>
                      <Text style={styles.dayInfoRow}>
                        <Text style={styles.dayInfoLabel}>Cómo me sentía: </Text>
                        <Text style={styles.dayInfoValue}>{selectedDayInfo.resumen.emocion}</Text>
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.dayInfoRow}>
                      <Text style={styles.dayInfoLabel}>Cómo me sentía: </Text>
                      <Text style={styles.dayInfoValue}>{selectedDayInfo.resumen.emocion}</Text>
                    </Text>
                  )}
                </>
              ) : (
                <Text style={styles.dayInfoEmpty}>
                  Sin registro este día
                </Text>
              )}
            </View>
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
  calendarNavButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  calendarTitleWrapper: {
    alignItems: 'center',
  },
  calendarMonth: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  calendarYear: {
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
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
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
  dayCircleClean: {
    backgroundColor: '#4A7BF7',
  },
  dayCircleDifficult: {
    backgroundColor: colors.accent,
  },
  dayCircleSelected: {
  borderWidth: 2,
  borderColor: colors.text,
  borderRadius: 16,
  },
  dayText: {
    fontSize: fontSizes.xs,
    color: colors.text,
    fontWeight: '500',
  },
  dayTextClean: {
    color: colors.white,
    fontWeight: '700',
  },
  dayTextDifficult: {
    color: colors.white,
    fontWeight: '700',
  },
  dayTextSelected: {
    fontWeight: '700',
  },
  calendarLegend: {
    flexDirection: 'row',
    gap: spacing.md,
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
  dayInfo: {
    marginTop: spacing.sm,
    gap: 4,
  },
  dayInfoRow: {
    fontSize: fontSizes.sm,
  },
  dayInfoLabel: {
    fontWeight: '700',
    color: colors.text,
  },
  dayInfoValue: {
    color: colors.textMuted,
  },
  dayInfoEmpty: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
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