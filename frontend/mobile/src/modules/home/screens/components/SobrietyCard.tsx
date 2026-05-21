import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

const RING_SIZE = 72;

type RingProps = {
  value: number;
  label: string;
  max: number;
};

function Ring({ value, label, max }: RingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const progress = value / max;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const size = RING_SIZE;
  const strokeWidth = 5;

  return (
    <View style={styles.ringWrapper}>
      <View style={{ width: size, height: size }}>
        <View style={[styles.ringTrack, { width: size, height: size, borderRadius: size / 2 }]} />
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
        <View style={styles.ringCenter}>
          <Text style={styles.ringValue}>{value}</Text>
        </View>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
}

type Props = {
  dias: number;
  horas: number;
  minutos: number;
};

export default function SobrietyCard({ dias, horas, minutos }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardSubtitle}>Has estado sobrio:</Text>
      <View style={styles.ringsRow}>
        <Ring value={dias} label="Días" max={30} />
        <Ring value={horas} label="Horas" max={24} />
        <Ring value={minutos} label="Mins" max={60} />
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
  cardSubtitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
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
    borderWidth: 5,
    borderColor: '#E8F4F8',
  },
  ringFill: {
    position: 'absolute',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ringCenter: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  ringLabel: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
});