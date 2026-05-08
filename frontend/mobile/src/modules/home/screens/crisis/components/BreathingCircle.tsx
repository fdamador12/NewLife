import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSizes, spacing } from '../../../../../constants/theme';

interface BreathingCircleProps {
  phaseLabel: string;
  countdown: number;
  scaleAnim: Animated.Value;
  glowAnim: Animated.Value;
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({
  phaseLabel,
  countdown,
  scaleAnim,
  glowAnim,
}) => {
  return (
    <>
      <View style={styles.circleWrapper}>
        <Animated.View style={[styles.glowRing, { opacity: glowAnim }]} />
        <Animated.View style={[styles.circleContainer, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={['#7986CB', '#3F51B5', '#1A237E']}
            style={styles.circle}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
          >
            <Text style={styles.circleLabel}>{phaseLabel}</Text>
          </LinearGradient>
        </Animated.View>
      </View>

      <Text style={styles.countdown}>{countdown}</Text>
      <Text style={styles.countdownLabel}>
        {phaseLabel} en {countdown}s
      </Text>
    </>
  );
};

const styles = StyleSheet.create({
  circleWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#5C6BC0',
    shadowColor: '#5C6BC0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 20,
  },
  circleContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  circle: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLabel: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.white,
  },
  countdown: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  countdownLabel: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
});