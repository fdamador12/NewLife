import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

type Props = {
  ahorroTotal: number;
  diasLimpios: number;
  onPress?: () => void;
};

export default function SavingsCard({ ahorroTotal, diasLimpios, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.moneyRow}>
        <View style={styles.moneyIcon}>
          <Icon name="dollar-sign" size={22} color="#F5A623" />
        </View>
        <View style={styles.moneyInfo}>
          <Text style={styles.moneyAmount}>${ahorroTotal.toLocaleString()}</Text>
          <Text style={styles.moneySub}>ahorrado hasta ahora</Text>
        </View>
        <View style={styles.diasBadge}>
          <Text style={styles.diasNumber}>{diasLimpios}</Text>
          <Text style={styles.diasLabel}>días{'\n'}limpios</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  moneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  moneyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moneyInfo: {
    flex: 1,
  },
  moneyAmount: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  moneySub: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  diasBadge: {
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    minWidth: 56,
  },
  diasNumber: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
    color: '#2ECC71',
  },
  diasLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
});