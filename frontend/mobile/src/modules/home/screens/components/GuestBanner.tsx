import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

type Props = {
  onCreateAccount: () => void;
  onLogout: () => void;
};

export default function GuestBanner({ onCreateAccount, onLogout }: Props) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.createButton} onPress={onCreateAccount}>
        <Text style={styles.createText}>Crear cuenta y guardar progreso</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Salir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  createButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  createText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSizes.md,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSizes.md,
  },
});