import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, fontSizes, borderRadius } from '../../../../../constants/theme';

export const EmptyStateEmotions = () => {
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.xl,
        marginHorizontal: spacing.xl,
        marginVertical: spacing.lg,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      }}
    >
      <Feather name="book-open" size={48} color={colors.textMuted} />
      <Text
        style={{
          fontSize: fontSizes.md,
          fontWeight: '600',
          color: colors.text,
          marginTop: spacing.md,
          textAlign: 'center',
        }}
      >
        No tienes registros de emociones aún
      </Text>
      <Text
        style={{
          fontSize: fontSizes.sm,
          color: colors.textMuted,
          marginTop: spacing.xs,
          textAlign: 'center',
        }}
      >
        Completa tu primer registro diario para comenzar
      </Text>
    </View>
  );
};