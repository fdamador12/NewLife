import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const CheckIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path
      d="M5 12L10 17L19 7"
      stroke="#FFF"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

type ProgressDotProps = {
  isActive: boolean;
  isCompleted: boolean;
  index: number;
};

export function ProgressDot({ isActive, isCompleted, index }: ProgressDotProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 80),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const dotStyle = isActive || isCompleted ? styles.dotFilled : styles.dotEmpty;

  return (
    <Animated.View
      style={[
        styles.dotWrapper,
        { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={[styles.dot, dotStyle]}>
        {(isActive || isCompleted) && <CheckIcon />}
      </View>
      {(isActive || isCompleted) && <View style={styles.dotGlow} />}
    </Animated.View>
  );
}

type ProgressDotsProps = {
  target: number;
  progreso: number;
  isCompleted: boolean;
};

export function ProgressDots({ target, progreso, isCompleted }: ProgressDotsProps) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: target }).map((_, i) => (
        <ProgressDot
          key={i}
          index={i}
          isActive={i < progreso}
          isCompleted={isCompleted && i < progreso}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dotWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dotFilled: {
    backgroundColor: '#406ADF',
    shadowColor: '#406ADF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dotEmpty: {
    backgroundColor: '#cbe2fc',
    borderWidth: 2,
    borderColor: 'rgba(90, 116, 230, 0.39)',
    borderStyle: 'dashed',
  },
  dotGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(90, 116, 230, 0.39)',
    zIndex: 1,
  },
});