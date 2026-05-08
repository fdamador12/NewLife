import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

type MedalCardProps = {
  titulo: string;
  isCompleted: boolean;
  isFailed: boolean;
  progreso_actual: number;
  target: number;
  onRetry: () => void;
};

export function MedalCard({
  titulo,
  isCompleted,
  isFailed,
  progreso_actual,
  target,
  onRetry,
}: MedalCardProps) {
  return (
    <>
      <View style={[
        styles.medalCard,
        isCompleted && styles.medalCardCompleted,
        isFailed && styles.medalCardFailed,
      ]}>
        <Text style={[styles.medalEmoji, !isCompleted && styles.medalEmojiGray]}>
          {isFailed ? '💔' : '🏅'}
        </Text>
        <Text style={[styles.medalTitle, !isCompleted && styles.medalTitleGray]}>
          {isFailed ? 'Reto interrumpido' : titulo}
        </Text>
        {isFailed && (
          <Text style={styles.medalFailedSubtext}>
            Llegaste a {progreso_actual}/{target} — ¡puedes volver a intentarlo!
          </Text>
        )}
      </View>

      {isFailed && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.85}
        >
          <Feather name="refresh-cw" size={18} color={colors.white} />
          <Text style={styles.retryButtonText}>Volver a intentarlo</Text>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  medalCard: {
    backgroundColor: '#F0F0F0',
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  medalCardCompleted: {
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  medalCardFailed: {
    backgroundColor: '#FFF5F5',
  },
  medalEmoji: {
    fontSize: 56,
  },
  medalEmojiGray: {
    opacity: 0.3,
  },
  medalTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  medalTitleGray: {
    color: colors.textMuted,
  },
  medalFailedSubtext: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
});