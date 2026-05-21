// frontend/mobile/src/modules/progress/screens/analysis/components/InsightCard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, borderRadius } from '../../../../../constants/theme';

interface InsightCardProps {
  emoji: string;
  text: string;
}

export default function InsightCard({ emoji, text }: InsightCardProps) {
  return (
    <View style={styles.insightRow}>
      <Text style={styles.insightEmoji}>{emoji}</Text>
      <Text style={styles.insightText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  insightEmoji: {
    fontSize: 18,
  },
  insightText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.text,
  },
});