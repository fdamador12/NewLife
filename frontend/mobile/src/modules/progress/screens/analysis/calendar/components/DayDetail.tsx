import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../../../../../constants/theme';
import { CalendarEvent } from '../../data/colombianEvents';
import UserDayInfo from './UserDayInfo';
import EventDayInfo from './EventDayInfo';

export type TimeContext = 'past' | 'present' | 'future';
export type UserStatus = 'noRecord' | 'clean' | 'difficult';

interface Props {
  dayInfo: {
    tipo: 'limpio' | 'dificil';
    resumen: {
      emocion: string;
      ubicacion?: string;
      social?: string;
    };
  } | null;
  events: CalendarEvent[];
  selectedDay: number;
  currentMonth: number;
  currentYear: number;
  onSOSPress?: () => void;
}

function getTimeContext(day: number, month: number, year: number): TimeContext {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  if (year < todayYear) return 'past';
  if (year > todayYear) return 'future';
  if (month < todayMonth) return 'past';
  if (month > todayMonth) return 'future';
  if (day < todayDay) return 'past';
  if (day > todayDay) return 'future';
  return 'present';
}

function getUserStatus(
  dayInfo: Props['dayInfo'],
  timeContext: TimeContext,
): UserStatus {
  if (timeContext === 'future') return 'noRecord';
  if (!dayInfo) return 'noRecord';
  return dayInfo.tipo === 'limpio' ? 'clean' : 'difficult';
}

function shouldShowSOS(
  userStatus: UserStatus,
  timeContext: TimeContext,
  events: CalendarEvent[],
): boolean {
  if (timeContext === 'past') return false;
  if (userStatus === 'difficult' && timeContext === 'present') return true;
  if (timeContext === 'present' && userStatus === 'noRecord' && events.some(e => e.isHighRisk)) return true;
  if (timeContext === 'future' && events.some(e => e.isHighRisk)) return true;
  return false;
}

export default function DayDetail({
  dayInfo,
  events,
  selectedDay,
  currentMonth,
  currentYear,
  onSOSPress,
}: Props) {
  const timeContext = getTimeContext(selectedDay, currentMonth, currentYear);
  const userStatus = getUserStatus(dayInfo, timeContext);
  const showSOS = shouldShowSOS(userStatus, timeContext, events);

  console.log('🗓️ DayDetail:', {
    selectedDay,
    currentMonth,
    currentYear,
    dayInfo,
    eventsCount: events.length,
    timeContext,
    userStatus,
    showSOS,
  });

  return (
    <View style={styles.container}>
      {timeContext !== 'future' && (
        <UserDayInfo dayInfo={dayInfo} />
      )}
      <EventDayInfo
        events={events}
        userStatus={userStatus}
        timeContext={timeContext}
        showSOS={showSOS}
        onSOSPress={onSOSPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
});