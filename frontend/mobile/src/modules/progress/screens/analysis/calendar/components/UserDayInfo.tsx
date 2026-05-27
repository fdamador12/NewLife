import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSizes, spacing } from '../../../../../../constants/theme';
import DayFeedbackCard from './DayFeedbackCard';

interface Props {
  dayInfo: {
    tipo: 'limpio' | 'dificil';
    resumen: {
      emocion: string;
      ubicacion?: string;
      social?: string;
    };
  } | null;
}

export default function UserDayInfo({ dayInfo }: Props) {
  if (!dayInfo) {
    return (
      <Text style={styles.empty}>Sin registro este día</Text>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Info del registro */}
      {dayInfo.resumen.emocion && (
        <Text style={styles.row}>
          <Text style={styles.label}>Cómo me sentía: </Text>
          <Text style={styles.value}>{dayInfo.resumen.emocion}</Text>
        </Text>
      )}
      {dayInfo.tipo === 'dificil' && dayInfo.resumen.ubicacion && (
        <Text style={styles.row}>
          <Text style={styles.label}>Donde estaba: </Text>
          <Text style={styles.value}>{dayInfo.resumen.ubicacion}</Text>
        </Text>
      )}
      {dayInfo.tipo === 'dificil' && dayInfo.resumen.social && (
        <Text style={styles.row}>
          <Text style={styles.label}>Con quién estaba: </Text>
          <Text style={styles.value}>{dayInfo.resumen.social}</Text>
        </Text>
      )}

      {/* ✅ Tarjeta de feedback personalizada */}
      <DayFeedbackCard
        tipo={dayInfo.tipo}
        emocion={dayInfo.resumen.emocion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  row: { fontSize: fontSizes.sm },
  label: { fontWeight: '700', color: colors.text },
  value: { color: colors.textMuted },
  empty: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});