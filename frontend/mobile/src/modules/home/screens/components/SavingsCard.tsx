import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

type Props = {
  gastoSemanal: number;
};

export default function SavingsCard({ gastoSemanal }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.moneyRow}>
        <View style={styles.moneyIcon}>
          <Icon name="dollar-sign" size={22} color="#F5A623" />
        </View>
        <View>
          <Text style={styles.moneyAmount}>${gastoSemanal.toLocaleString()}</Text>
          <Text style={styles.moneySub}>Ahorro semanal promedio</Text>
        </View>
      </View>
    </View>
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
  moneyAmount: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  moneySub: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
});