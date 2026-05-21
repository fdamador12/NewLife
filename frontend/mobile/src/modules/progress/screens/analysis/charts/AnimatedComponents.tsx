import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { styles } from '../styles/analysisStyles';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// ==================== ANIMATED BAR ====================
export const AnimatedBar = ({
  progress,
  height,
  color,
  inactive,
  maxHeight,
}: {
  progress: SharedValue<number>;
  height: number;
  color: string;
  inactive: boolean;
  maxHeight: number;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: inactive ? maxHeight : height * progress.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.verticalBar,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
};

// ==================== ANIMATED EMOTION BAR ====================
export const AnimatedEmotionBar = ({
  progress,
  height,
  color,
  inactive,
  maxHeight,
}: {
  progress: SharedValue<number>;
  height: number;
  color: string;
  inactive: boolean;
  maxHeight: number;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: inactive ? maxHeight : height * progress.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.emotionBar,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
};

// ==================== ANIMATED HORIZONTAL BAR ====================
export const AnimatedHorizontalBar = ({
  item,
  index,
  maxWidth,
}: {
  item: { label: string; value: number; color: string };
  index: number;
  maxWidth: number;
}) => {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withDelay(
      index * 80,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: (item.value / 100) * maxWidth * animationProgress.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.horizontalBar,
        { backgroundColor: item.color },
        animatedStyle,
      ]}
    >
      <Animated.Text style={styles.horizontalBarLabel}>
        {item.label}
      </Animated.Text>
    </Animated.View>
  );
};

// ==================== ANIMATED PIE SLICE ====================
export const AnimatedPieSlice = ({
  slice,
  radius,
  center,
  progress,
}: {
  slice: {
    startAngle: number;
    angle: number;
    color: string;
    index: number;
  };
  radius: number;
  center: number;
  progress: SharedValue<number>;
}) => {
  const animatedProps = useAnimatedProps(() => {
    const animatedAngle = slice.angle * progress.value;
    const startRad = (slice.startAngle * Math.PI) / 180;
    const endRad = ((slice.startAngle + animatedAngle) * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArcFlag = animatedAngle > 180 ? 1 : 0;

    const d =
      animatedAngle > 0
        ? `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
        : '';

    return { d };
  });

  return <AnimatedPath animatedProps={animatedProps} fill={slice.color} />;
};