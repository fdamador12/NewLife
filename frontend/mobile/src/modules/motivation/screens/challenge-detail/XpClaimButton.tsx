import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

type XpClaimButtonProps = {
  xp_reclamado: boolean;
  dificultad: string;
  onClaim: () => void;
};

const XP_POR_DIFICULTAD: Record<string, number> = {
  SUAVE: 50,
  MODERADA: 100,
  INTENSA: 200,
};

export function XpClaimButton({ xp_reclamado, dificultad, onClaim }: XpClaimButtonProps) {
  const xp = XP_POR_DIFICULTAD[dificultad] ?? 50;

  if (xp_reclamado) {
    return (
      <View style={styles.claimedContainer}>
        <Feather name="check-circle" size={18} color="#2ECC71" />
        <Text style={styles.claimedText}>XP reclamada ✓</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.claimButton} onPress={onClaim} activeOpacity={0.85}>
      <Text style={styles.claimEmoji}>🎁</Text>
      <Text style={styles.claimText}>Reclamar +{xp} XP</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#2ECC71',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  claimEmoji: {
    fontSize: 20,
  },
  claimText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  claimedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  claimedText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#2ECC71',
  },
});