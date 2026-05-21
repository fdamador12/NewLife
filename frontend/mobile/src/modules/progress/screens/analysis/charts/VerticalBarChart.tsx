import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { AnimatedBar } from './AnimatedComponents';
import { styles } from '../styles/analysisStyles';

export const VerticalBarChart = ({
  data,
  barColor = '#6B21A8',
  inactiveColor = '#E5E7EB',
  maxHeight = 140,
}: {
  data: Array<{ day: string; value: number; active: boolean; highlighted?: boolean }>;
  barColor?: string;
  inactiveColor?: string;
  maxHeight?: number;
}) => {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  return (
    <View style={styles.verticalBarContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.verticalBarWrapper}>
          <View style={[styles.verticalBarBackground, { height: maxHeight }]}>
            <AnimatedBar
              progress={animationProgress}
              height={(item.value / 100) * maxHeight}
              color={item.active ? barColor : inactiveColor}
              inactive={!item.active}
              maxHeight={maxHeight}
            />
          </View>
          <Text
            style={[
              styles.barLabel,
              item.highlighted && styles.barLabelHighlighted,
            ]}
          >
            {item.day}
          </Text>
        </View>
      ))}
    </View>
  );
};