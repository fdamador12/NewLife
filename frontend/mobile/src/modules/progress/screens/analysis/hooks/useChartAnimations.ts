// analysis/hooks/useChartAnimations.ts

import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { chartConfig } from '../utils/chartConfig';

export function useChartAnimations(triggerAnimation: boolean = true) {
  const barAnimations = useRef<Animated.Value[]>([]);
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  /**
   * Anima las barras de una gráfica
   */
  const animateBars = (count: number) => {
    if (barAnimations.current.length !== count) {
      barAnimations.current = Array(count)
        .fill(0)
        .map(() => new Animated.Value(0));
    }

    Animated.stagger(chartConfig.animation.delay, [
      ...barAnimations.current.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: chartConfig.animation.duration,
          useNativeDriver: false,
        })
      ),
    ]).start();
  };

  /**
   * Anima entrada de gráfica con escala
   */
  const animateScaleEntry = () => {
    scaleAnimation.setValue(0);
    Animated.spring(scaleAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  };

  /**
   * Anima entrada con opacidad
   */
  const animateFadeIn = () => {
    opacityAnimation.setValue(0);
    Animated.timing(opacityAnimation, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Anima las dos (escala + opacidad)
   */
  const animateBothEntry = () => {
    scaleAnimation.setValue(0);
    opacityAnimation.setValue(0);
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (triggerAnimation) {
      animateBothEntry();
    }
  }, [triggerAnimation]);

  return {
    barAnimations: barAnimations.current,
    scaleAnimation,
    opacityAnimation,
    animateBars,
    animateScaleEntry,
    animateFadeIn,
    animateBothEntry,
  };
}