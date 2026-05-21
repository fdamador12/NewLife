import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';

const DIFFICULTY_COLORS: Record<string, string> = {
  SUAVE: '#4CAF50',
  MODERADA: '#FFC107',
  INTENSA: '#FF6B6B',
};

type ChallengeCardProps = {
  titulo: string;
  descripcion: string;
  dificultad: string;
  progreso_actual?: number;
  target?: number;
  porcentaje?: number;
  texto_progreso?: string;
  onPress: () => void;
};

export function ChallengeCard({
  titulo,
  descripcion,
  dificultad,
  progreso_actual = 0,
  target = 0,
  porcentaje,
  texto_progreso,
  onPress,
}: ChallengeCardProps) {
  // ✅ Usar porcentaje del backend si existe, sino calcular
  const percent = porcentaje ?? (
    target > 0 ? Math.round((progreso_actual / target) * 100) : 0
  );

  const displayDifficulty = dificultad.charAt(0).toUpperCase()
    + dificultad.slice(1).toLowerCase();

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{titulo}</Text>
      <Text style={styles.cardDescription}>{descripcion}</Text>

      <View style={styles.difficultyRow}>
        <View
          style={[
            styles.difficultyDot,
            { backgroundColor: DIFFICULTY_COLORS[dificultad] || '#999' },
          ]}
        />
        <Text style={styles.difficultyText}>Dificultad: {displayDifficulty}</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>

      {/* ✅ Usar texto_progreso del backend si existe */}
      <Text style={styles.progressLabel}>
        {texto_progreso || `${percent}% completado — ${progreso_actual}/${target} cumplidos`}
      </Text>

      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>Ver más...</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    color: colors.text,
  },
  cardDescription: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  difficultyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  difficultyText: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
});