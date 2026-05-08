import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useToast, ToastType } from './ToastContext';
import { colors, fontSizes, borderRadius, spacing } from '../constants/theme';

const DOT_COLOR: Record<ToastType, string> = {
  error:   colors.accent,
  success: '#639922',
  info:    '#378ADD',
};

const LABEL: Record<ToastType, string> = {
  error:   'Error',
  success: 'Listo',
  info:    'Info',
};

export default function Toast() {
  const { toast, hideToast } = useToast();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (toast.visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [toast.visible]);

  if (!toast.message) return null;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.indicator, { backgroundColor: DOT_COLOR[toast.type] }]} />
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: DOT_COLOR[toast.type] }]}>
          {LABEL[toast.type]}
        </Text>
        <Text style={styles.message}>{toast.message}</Text>
      </View>
      <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: '#1E1E1E',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    zIndex: 9999,
    elevation: 10,
  },
  indicator: {
    width: 4,
    borderRadius: 2,
    alignSelf: 'stretch',
    minHeight: 36,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: fontSizes.sm,
    color: '#E0E0E0',
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: fontSizes.xs,
    color: '#888',
  },
});