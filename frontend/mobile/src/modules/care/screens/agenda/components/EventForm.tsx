import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import CategorySelector from './CategorySelector';
import RepeatSelector from './RepeatSelector';
import TimeInputField from './TimeInputField';

const COLORS = {
  primary: '#D38A58',
  white: '#FFFFFF',
  gray: '#969696',
  darkGray: '#404040',
  background: '#FAFAFA',
  red: '#FF6B6B',
};

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

const DAY_ITEM_WIDTH = 44;
const DAY_ITEM_GAP = 8;

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Función para convertir tiempo a minutos
function timeToMinutes(timeStr: string): number {
  const [timePart, period] = timeStr.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

interface EventFormProps {
  title: string;
  onTitleChange: (title: string) => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  currentMonth: number;
  currentYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  timeFrom: string;
  onTimeFromChange: (time: string) => void;
  timeTo: string;
  onTimeToChange: (time: string) => void;
  category: string;
  onCategorySelect: (category: string) => void;
  repeat: string;
  onRepeatSelect: (repeat: string) => void;
  reminder: boolean;
  onReminderToggle: (value: boolean) => void;
  reminderMinutes: number;
  onReminderMinutesSelect: (minutes: number) => void;
}

export default function EventForm({
  title,
  onTitleChange,
  selectedDate,
  onDateSelect,
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth,
  timeFrom,
  onTimeFromChange,
  timeTo,
  onTimeToChange,
  category,
  onCategorySelect,
  repeat,
  onRepeatSelect,
  reminder,
  onReminderToggle,
  reminderMinutes,
  onReminderMinutesSelect,
}: EventFormProps) {
  const calendarScrollRef = useRef<ScrollView>(null);
  const [timeError, setTimeError] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  useEffect(() => {
    const targetDay = currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear()
      ? selectedDate.getDate()
      : 1;

    const scrollX = (targetDay - 1) * (DAY_ITEM_WIDTH + DAY_ITEM_GAP) - 100;

    setTimeout(() => {
      calendarScrollRef.current?.scrollTo({ x: Math.max(0, scrollX), animated: true });
    }, 100);
  }, [currentMonth, currentYear]);

  // Validar horas cuando cambien
  const validateTimes = (from: string, to: string) => {
    const fromMinutes = timeToMinutes(from);
    const toMinutes = timeToMinutes(to);

    if (fromMinutes >= toMinutes) {
      setTimeError('La hora de inicio debe ser menor que la hora de fin');
      return false;
    } else {
      setTimeError(null);
      return true;
    }
  };

  const handleTimeFromChange = (time: string) => {
    onTimeFromChange(time);
    validateTimes(time, timeTo);
  };

  const handleTimeToChange = (time: string) => {
    onTimeToChange(time);
    validateTimes(timeFrom, time);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Titulo */}
      <View style={styles.section}>
        <Text style={styles.label}>Titulo</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Nombre del evento"
            placeholderTextColor={COLORS.gray}
            value={title}
            onChangeText={onTitleChange}
          />
        </View>
      </View>

      {/* Fecha */}
      <View style={styles.section}>
        <Text style={styles.label}>Fecha</Text>
        <View style={styles.monthPicker}>
          <TouchableOpacity onPress={onPrevMonth} style={styles.monthArrow}>
            <Feather name="chevron-left" size={18} color={COLORS.darkGray} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTHS[currentMonth]} {currentYear}</Text>
          <TouchableOpacity onPress={onNextMonth} style={styles.monthArrow}>
            <Feather name="chevron-right" size={18} color={COLORS.darkGray} />
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
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayItem, isSelected && styles.dayItemSelected]}
                onPress={() => onDateSelect(date)}
              >
                <Text style={[styles.dayName, isSelected && styles.dayTextSelected]}>
                  {WEEK_DAYS[date.getDay()]}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.dayTextSelected]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Hora - CON TIME PICKER Y VALIDACIÓN */}
      <View style={[styles.section, timeError && styles.sectionError]}>
        <Text style={styles.label}>Hora</Text>
        <View style={styles.timeRow}>
          <TimeInputField
            label="Desde"
            value={timeFrom}
            onChange={handleTimeFromChange}
          />
          <View style={styles.timeArrowContainer}>
            <Feather name="arrow-right" size={16} color={COLORS.gray} />
          </View>
          <TimeInputField
            label="Hasta"
            value={timeTo}
            onChange={handleTimeToChange}
          />
        </View>

        {/* Mensaje de error */}
        {timeError && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={14} color={COLORS.red} />
            <Text style={styles.errorText}>{timeError}</Text>
          </View>
        )}
      </View>

      {/* Categoria */}
      <View style={styles.section}>
        <Text style={styles.label}>Categoria</Text>
        <CategorySelector selected={category} onSelect={onCategorySelect} />
      </View>

      {/* Repetición y Recordatorio */}
      <RepeatSelector
        repeat={repeat}
        onRepeatSelect={onRepeatSelect}
        reminder={reminder}
        onReminderToggle={onReminderToggle}
        reminderMinutes={reminderMinutes}
        onReminderMinutesSelect={onReminderMinutesSelect}
      />

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 16 },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
  },
  sectionError: {
    borderWidth: 1.5,
    borderColor: COLORS.red,
  },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.darkGray, marginBottom: 12 },
  inputBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: { fontSize: 16, color: COLORS.darkGray, paddingVertical: 14 },
  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  monthArrow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: { fontSize: 15, fontWeight: '600', color: COLORS.darkGray },
  daysScroll: { gap: DAY_ITEM_GAP },
  dayItem: {
    width: 44,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.background,
    gap: 4,
  },
  dayItemSelected: { backgroundColor: COLORS.primary },
  dayName: { fontSize: 10, fontWeight: '500', color: COLORS.gray },
  dayNumber: { fontSize: 16, fontWeight: '700', color: COLORS.darkGray },
  dayTextSelected: { color: COLORS.white },

  // Time Inputs
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  timeArrowContainer: {
    marginBottom: 12,
    paddingBottom: 2,
  },

  // Error Container
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: `${COLORS.red}10`,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.red,
  },
});