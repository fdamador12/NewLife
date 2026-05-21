import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Switch,
} from 'react-native';

const COLORS = {
  primary: '#D38A58',
  white: '#FFFFFF',
  gray: '#969696',
  darkGray: '#404040',
  background: '#FAFAFA',
};

const REPEAT_OPTIONS = [
  { label: 'Una vez', value: 'none' },
  { label: 'Diario', value: 'daily' },
  { label: 'Semanal', value: 'weekly' },
  { label: 'Mensual', value: 'monthly' },
];

const REMINDER_OPTIONS = [
  { label: '5 min', value: 5 },
  { label: '30 min', value: 30 },
  { label: '1 hora', value: 60 },
];

interface RepeatSelectorProps {
  repeat: string;
  onRepeatSelect: (repeat: string) => void;
  reminder: boolean;
  onReminderToggle: (value: boolean) => void;
  reminderMinutes: number;
  onReminderMinutesSelect: (minutes: number) => void;
}

export default function RepeatSelector({
  repeat,
  onRepeatSelect,
  reminder,
  onReminderToggle,
  reminderMinutes,
  onReminderMinutesSelect,
}: RepeatSelectorProps) {
  return (
    <View style={styles.container}>
      {/* Repetición */}
      <View style={styles.section}>
        <Text style={styles.label}>Repetir</Text>
        <View style={styles.repeatRow}>
          {REPEAT_OPTIONS.map((opt) => {
            const isActive = repeat === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.repeatChip, isActive && styles.repeatChipActive]}
                onPress={() => onRepeatSelect(opt.value)}
              >
                <Text style={[styles.repeatLabel, isActive && styles.repeatLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Recordatorio */}
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Recordatorio</Text>
          <Switch
            value={reminder}
            onValueChange={onReminderToggle}
            trackColor={{ false: '#E5E5E5', true: `${COLORS.primary}50` }}
            thumbColor={reminder ? COLORS.primary : COLORS.white}
          />
        </View>
        {reminder && (
          <View style={styles.reminderRow}>
            {REMINDER_OPTIONS.map((opt) => {
              const isActive = reminderMinutes === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.reminderChip, isActive && styles.reminderChipActive]}
                  onPress={() => onReminderMinutesSelect(opt.value)}
                >
                  <Text style={[styles.reminderLabel, isActive && styles.reminderLabelActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
  },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.darkGray, marginBottom: 12 },
  repeatRow: { flexDirection: 'row', gap: 8 },
  repeatChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  repeatChipActive: { backgroundColor: `${COLORS.primary}15` },
  repeatLabel: { fontSize: 12, color: COLORS.gray, fontWeight: '500' },
  repeatLabelActive: { color: COLORS.primary, fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  reminderChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  reminderChipActive: { backgroundColor: COLORS.primary },
  reminderLabel: { fontSize: 13, color: COLORS.gray },
  reminderLabelActive: { color: COLORS.white, fontWeight: '600' },
});