import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

const RING_SIZE_NORMAL = 72;
const RING_SIZE_COMPACT = 54;

type RingProps = {
  value: number;
  label: string;
  max: number;
  compact?: boolean;
};

function Ring({ value, label, max, compact = false }: RingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const progress = value / max;
  const size = compact ? RING_SIZE_COMPACT : RING_SIZE_NORMAL;
  const strokeWidth = compact ? 4 : 5;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <View style={styles.ringWrapper}>
      <View style={{ width: size, height: size }}>
        <View style={[styles.ringTrack, { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth }]} />
        <Animated.View
          style={[
            styles.ringFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: '#00BCD4',
              transform: [
                {
                  rotate: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-90deg', '270deg'],
                  }),
                },
              ],
            },
          ]}
        />
        <View style={[styles.ringCenter, { width: size, height: size }]}>
          <Text style={[styles.ringValue, compact && styles.ringValueCompact]}>{value}</Text>
        </View>
      </View>
      <Text style={[styles.ringLabel, compact && styles.ringLabelCompact]}>{label}</Text>
    </View>
  );
}

type Props = {
  dias: number;
  horas: number;
  minutos: number;
  compact?: boolean;
};

export default function SobrietyCard({ dias, horas, minutos, compact = false }: Props) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <Text style={[styles.cardSubtitle, compact && styles.cardSubtitleCompact]}>
        Has estado sobrio:
      </Text>
      <View style={styles.ringsRow}>
        <Ring value={dias} label="Días" max={30} compact={compact} />
        <Ring value={horas} label="Horas" max={24} compact={compact} />
        <Ring value={minutos} label="Mins" max={60} compact={compact} />
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
  cardCompact: {
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  cardSubtitleCompact: {
    fontSize: fontSizes.xs,
    marginBottom: spacing.xs,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ringWrapper: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  ringTrack: {
    position: 'absolute',
    borderColor: '#E8F4F8',
  },
  ringFill: {
    position: 'absolute',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  ringValueCompact: {
    fontSize: fontSizes.md,
  },
  ringLabel: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  ringLabelCompact: {
    fontSize: fontSizes.xs,
  },
});