import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAgenda } from '../../hooks/useAgenda';
import { useToast } from '../../../../feedback/ToastContext';
import { AgendaEventFrontend } from '../../services/agendaService';
import EventForm from './components/EventForm';
import { analytics, EVENT_TYPES } from '../../../../services/analytics';
import { scheduleAgendaReminder } from '../../../../services/notificationSync';

const COLORS = {
  primary: '#D38A58',
  white: '#FFFFFF',
  darkGray: '#404040',
  background: '#FAFAFA',
  red: '#FF6B6B',
};

type AgendaEvent = {
  id: string;
  title: string;
  date: Date | string;
  timeFrom: string;
  timeTo: string;
  category: string;
  reminder: boolean;
  reminderMinutes: number;
  repeat: string;
};

function timeToMinutes(timeStr: string): number {
  const [timePart, period] = timeStr.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/**
 * Combina una fecha (Date solo dia) con un string de hora "8:00 am"
 * en un Date completo con dia + hora.
 *
 * Necesario para agendar la notificacion local que requiere un Date
 * con fecha y hora exactas, no solo el dia.
 */
function combineDateAndTime(date: Date, timeStr: string): Date {
  const [timePart, period] = timeStr.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

export default function AddEventScreen({ navigation, route }: any) {
  const { createAgenda, updateAgenda } = useAgenda();
  const { showToast } = useToast();
  const refetch = route.params?.refetch;
  const [isSaving, setIsSaving] = useState(false);

  const existing = route.params?.event as AgendaEvent | undefined;
  const defaultDateStr = route.params?.defaultDate as string | undefined;
  const defaultDate: Date = defaultDateStr ? new Date(defaultDateStr) : new Date();
  const existingDate = existing?.date ? new Date(existing.date as string) : defaultDate;

  const [title, setTitle] = useState(existing?.title || '');
  const [selectedDate, setSelectedDate] = useState<Date>(existingDate);
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [timeFrom, setTimeFrom] = useState(existing?.timeFrom || '8:00 am');
  const [timeTo, setTimeTo] = useState(existing?.timeTo || '9:00 am');
  const [category, setCategory] = useState(existing?.category || 'Reunion');
  const [reminder, setReminder] = useState(existing?.reminder || false);
  const [reminderMinutes, setReminderMinutes] = useState(existing?.reminderMinutes || 30);
  // El usuario ya no puede configurar repetir desde la UI, pero el campo se
  // mantiene en el estado para mandar siempre 'none' (mapeado a UNA_VEZ en el service).
  // Si en el futuro se reactiva la funcionalidad, restaurar el control en EventForm.
  const repeat = 'none';

  const validateTimes = (): boolean => {
    const fromMinutes = timeToMinutes(timeFrom);
    const toMinutes = timeToMinutes(timeTo);
    if (fromMinutes >= toMinutes) {
      showToast('La hora de inicio debe ser menor que la hora de fin.', 'error');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('El título del evento es obligatorio.', 'error');
      return;
    }

    if (!validateTimes()) return;

    setIsSaving(true);

    try {
      const eventData: AgendaEventFrontend = {
        id: existing?.id || '',
        title,
        date: selectedDate,
        timeFrom,
        timeTo,
        category,
        reminder,
        reminderMinutes,
        repeat,
      };

      let savedEvent: AgendaEventFrontend;
      if (existing) {
        savedEvent = await updateAgenda(existing.id, eventData);
      } else {
        savedEvent = await createAgenda(eventData);

        analytics.track(EVENT_TYPES.AGENDA_EVENT_CREATED, {
          category: category,
          has_reminder: reminder,
        });
      }

      // 🔔 Agendar notificacion local si el usuario activo recordatorio.
      // Fire-and-forget: si falla la notif (Expo Go), no bloquea el flujo.
      if (reminder && savedEvent.id) {
        const eventDateTime = combineDateAndTime(selectedDate, timeFrom);
        scheduleAgendaReminder(
          savedEvent.id,
          title,
          eventDateTime,
          reminderMinutes,
        ).catch((err) => {
          console.log('No se pudo agendar recordatorio local:', err?.message ?? err);
        });
      }

      if (refetch) await refetch();

      showToast(existing ? 'Evento actualizado' : 'Evento creado', 'success');
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      console.log('Error al guardar evento:', error);
      showToast('No se pudo guardar el evento. Intenta de nuevo.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          disabled={isSaving}
        >
          <Feather name="x" size={20} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{existing ? 'Editar evento' : 'Nuevo evento'}</Text>
        {/* Espacio derecho vacio para mantener el header centrado */}
        <View style={styles.headerBtnPlaceholder} />
      </View>

      <EventForm
        title={title}
        onTitleChange={setTitle}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        currentMonth={currentMonth}
        currentYear={currentYear}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        timeFrom={timeFrom}
        onTimeFromChange={setTimeFrom}
        timeTo={timeTo}
        onTimeToChange={setTimeTo}
        category={category}
        onCategorySelect={setCategory}
        repeat={repeat}
        onRepeatSelect={() => { /* no-op: repetir oculto en UI */ }}
        reminder={reminder}
        onReminderToggle={setReminder}
        reminderMinutes={reminderMinutes}
        onReminderMinutesSelect={setReminderMinutes}
      />

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.saveButtonText}>Guardar evento</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnPlaceholder: {
    width: 40,
    height: 40,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkGray },
  saveButton: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});