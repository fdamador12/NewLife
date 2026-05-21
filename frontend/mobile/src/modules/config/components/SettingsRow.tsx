import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';

type Props = {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
};

export default function SettingsRow({ icon, label, onPress, danger = false }: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.rowLeft}>
        <Feather name={icon as any} size={20} color={danger ? '#FF6B6B' : colors.text} />
        <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, padding: spacing.lg, borderRadius: borderRadius.md,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  label: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
  labelDanger: { color: '#FF6B6B' },
});