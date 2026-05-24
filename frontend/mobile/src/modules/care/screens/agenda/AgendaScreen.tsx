import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing } from '../../../../constants/theme';
import { useAgenda } from '../../hooks/useAgenda';
import { useToast } from '../../../../feedback/ToastContext';
import { useConfirm } from '../../../../feedback/ConfirmContext';
import AgendaCalendar from './components/AgendaCalendar';
import EventCard from './components/EventCard';
import { analytics, EVENT_TYPES } from '../../../../services/analytics';
import { useBottomInset } from '../../../../hooks/useBottomInset';

const COLORS = {
  primary: '#D38A58',
  white: '#FFFFFF',
  gray: '#969696',
  darkGray: '#404040',
  background: '#FAFAFA',
};

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

function timeToMinutes(timeStr: string): number {
  const [timePart, period] = timeStr.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export default function AgendaScreen({ navigation }: any) {
  const { eventos, loading, error, deleteAgenda, refetch } = useAgenda();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const bottomInset = useBottomInset(32);

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useEffect(() => {
    analytics.track(EVENT_TYPES.AGENDA_VIEWED);
  }, []);

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const hasEvent = (day: number) => eventos.some((e) =>
    e.date.getDate() === day &&
    e.date.getMonth() === currentMonth &&
    e.date.getFullYear() === currentYear
  );

  let todayEvents = eventos.filter((e) => isSameDay(e.date, selectedDate));
  todayEvents = todayEvents.sort((a, b) => timeToMinutes(a.timeFrom) - timeToMinutes(b.timeFrom));

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Eliminar evento',
      message: '¿Seguro que quieres eliminar este evento? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteAgenda(id);
          await refetch();
          showToast('Evento eliminado', 'success');
        } catch (err) {
          console.log('Error eliminando evento:', err);
          showToast('No se pudo eliminar el evento. Intenta de nuevo.', 'error');
        }
      },
    });
  };

  const formatSelectedDate = () => {
    const dayName = WEEK_DAYS[selectedDate.getDay()];
    const day = selectedDate.getDate();
    const month = MONTHS[selectedDate.getMonth()];
    return `${dayName}, ${day} de ${month}`;
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
      {loading ? (
        <View style={[styles.centerContainer, { flex: 1 }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={[styles.centerContainer, { flex: 1 }]}>
          <Feather name="alert-circle" size={48} color={COLORS.gray} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
              <Feather name="chevron-left" size={24} color={COLORS.darkGray} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mi Agenda</Text>
          </View>

          <AgendaCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            currentMonth={currentMonth}
            currentYear={currentYear}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            hasEvent={hasEvent}
          />

          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>{formatSelectedDate()}</Text>
            <Text style={styles.eventCount}>{todayEvents.length} eventos</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {todayEvents.length > 0 && (
              <View style={styles.eventsSection}>
                {todayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    category={event.category}
                    timeFrom={event.timeFrom}
                    timeTo={event.timeTo}
                    reminder={event.reminder}
                    onEdit={() => navigation.navigate('AddEventScreen', {
                      event: { ...event, date: event.date.toISOString() },
                      refetch,
                    })}
                    onDelete={() => handleDelete(event.id)}
                  />
                ))}
              </View>
            )}

            {todayEvents.length === 0 && (
              <View style={styles.emptyState}>
                <Feather name="calendar" size={48} color={COLORS.gray} />
                <Text style={styles.emptyTitle}>Sin eventos</Text>
                <Text style={styles.emptyText}>No tienes eventos para este día</Text>
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>

          <TouchableOpacity
            style={[styles.addButton, { bottom: bottomInset }]}
            onPress={() => navigation.navigate('AddEventScreen', {
              defaultDate: selectedDate.toISOString(),
              refetch,
            })}
          >
            <Feather name="plus" size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>Nuevo evento</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dateHeaderText: { fontSize: 15, fontWeight: '600', color: COLORS.darkGray },
  eventCount: { fontSize: 13, color: COLORS.gray },
  scroll: { paddingHorizontal: 20 },
  eventsSection: { gap: 12 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.darkGray, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.gray, marginTop: 4 },
  errorText: { fontSize: 14, color: COLORS.gray, marginTop: 16 },
  addButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});