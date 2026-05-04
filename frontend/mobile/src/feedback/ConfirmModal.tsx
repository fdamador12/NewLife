import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { useConfirm } from './ConfirmContext';
import { colors, fontSizes, spacing, borderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function ConfirmModal() {
  const { visible, options, hideConfirm } = useConfirm();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.92, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!options && !visible) return null;

  const handleConfirm = () => {
    hideConfirm();
    setTimeout(() => options?.onConfirm(), 200);
  };

  const handleCancel = () => {
    hideConfirm();
    options?.onCancel?.();
  };

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Text style={styles.title}>{options?.title}</Text>
        <Text style={styles.message}>{options?.message}</Text>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelText}>
              {options?.cancelText ?? 'Cancelar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              options?.destructive && styles.confirmButtonDestructive,
            ]}
            onPress={handleConfirm}
          >
            <Text style={[
              styles.confirmText,
              options?.destructive && styles.confirmTextDestructive,
            ]}>
              {options?.confirmText ?? 'Confirmar'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    width: width - spacing.xl * 4,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmButtonDestructive: {
    backgroundColor: '#E24B4A',
  },
  confirmText: {
    fontSize: fontSizes.md,
    color: colors.white,
    fontWeight: '700',
  },
  confirmTextDestructive: {
    color: colors.white,
  },
});