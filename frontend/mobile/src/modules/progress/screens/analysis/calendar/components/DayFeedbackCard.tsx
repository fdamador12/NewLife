import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../../../../constants/theme';
import { getDayFeedback } from '../../data/dayFeedback';

interface Props {
  tipo: 'limpio' | 'dificil';
  emocion: string;
}

export default function DayFeedbackCard({ tipo, emocion }: Props) {
  const feedback = getDayFeedback(tipo, emocion);

  const isClean = tipo === 'limpio';
  const cardColor = isClean ? '#F0F7FF' : '#FFF5F5';
  const borderColor = isClean ? '#4A7BF7' : '#FF6B6B';
  const titleColor = isClean ? '#4A7BF7' : '#FF6B6B';

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderLeftColor: borderColor }]}>
      <Text style={[styles.title, { color: titleColor }]}>
        {feedback.emoji} {feedback.title}
      </Text>
      <Text style={styles.message}>
        {feedback.message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  message: {
    fontSize: fontSizes.xs,
    color: colors.text,
    lineHeight: 18,
  },
});