import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../../../constants/theme';
import { CalendarEvent } from '../../data/colombianEvents';
import { EVENT_TYPE_COLORS } from '../../data/eventColors';
import { EVENT_PHRASES } from '../../data/eventPhrases';
import { UserStatus, TimeContext } from './DayDetail';

interface Props {
  events: CalendarEvent[];
  userStatus: UserStatus;
  timeContext: TimeContext;
  showSOS: boolean;
  onSOSPress?: () => void;
}

export default function EventDayInfo({
  events,
  userStatus,
  timeContext,
  showSOS,
  onSOSPress,
}: Props) {
  if (events.length === 0) return null;

  return (
    <View style={styles.container}>
      {events.map((event) => {
        const phrases = EVENT_PHRASES[event.id];

        // ✅ Elegir frase según tiempo
        let phrase: string | null = null;
        if (phrases) {
          if (timeContext === 'future') {
            phrase = phrases.future;
          } else {
            phrase = phrases[userStatus];
          }
        }

        const borderColor = EVENT_TYPE_COLORS[event.type] || colors.primary;

        return (
          <View
            key={event.id}
            style={[styles.eventCard, { borderLeftColor: borderColor }]}
          >
            <Text style={styles.eventName}>
              {event.emoji} {event.name}
            </Text>
            <Text style={styles.eventDescription}>
              {event.fullDescription}
            </Text>

            {phrase && (
              <Text style={styles.eventPhrase}>💬 {phrase}</Text>
            )}

            {/* ✅ Badge alto riesgo — pasado sin SOS, presente/futuro con SOS */}
            {event.isHighRisk && (
              <View style={styles.highRiskRow}>
                <View style={styles.highRiskBadge}>
                  <Feather name="alert-circle" size={12} color="#FF6B6B" />
                  <Text style={styles.highRiskText}>
                    {timeContext === 'past'
                      ? 'Este fue un día de alta actividad social'
                      : 'Día de alta actividad social — ten un plan'}
                  </Text>
                </View>
                {showSOS && onSOSPress && (
                  <TouchableOpacity style={styles.sosButton} onPress={onSOSPress}>
                    <Text style={styles.sosButtonText}>Ir al SOS</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  eventCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    gap: spacing.xs,
  },
  eventName: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.text,
  },
  eventDescription: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  eventPhrase: {
    fontSize: fontSizes.xs,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  highRiskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  highRiskBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF5F5',
    padding: spacing.xs,
    borderRadius: 6,
  },
  highRiskText: {
    flex: 1,
    fontSize: fontSizes.xs,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  sosButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: borderRadius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  sosButtonText: {
    fontSize: fontSizes.xs,
    color: colors.white,
    fontWeight: '700',
  },
});