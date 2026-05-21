import { useState, useEffect, useRef, useCallback } from 'react';
import { Animated } from 'react-native';

export interface BreathingPhase {
  label: string;
  duration: number;
}

interface UseBreathingTimerReturn {
  phaseIndex: number;
  countdown: number;
  isPlaying: boolean;
  scaleAnim: Animated.Value;
  glowAnim: Animated.Value;
  startBreathing: () => void;
  stopBreathing: () => void;
  toggleBreathing: () => void;
  resetBreathing: () => void;
}

const PHASES: BreathingPhase[] = [
  { label: 'Inhala', duration: 4 },
  { label: 'Sostén', duration: 4 },
  { label: 'Exhala', duration: 5 },
];

export const useBreathingTimer = (): UseBreathingTimerReturn => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(PHASES[0].duration);
  const [isPlaying, setIsPlaying] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;
  
  const intervalRef = useRef<any>(null);
  const animRef = useRef<any>(null);
  const phaseRef = useRef(0);

  const runPhase = useCallback((index: number) => {
    phaseRef.current = index;
    const phase = PHASES[index];
    setPhaseIndex(index);
    setCountdown(phase.duration);

    const toScale = index === 0 ? 1.5 : index === 1 ? 1.5 : 1;
    const toGlow = index === 0 ? 1 : index === 1 ? 1 : 0.6;

    animRef.current = Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: toScale,
        duration: phase.duration * 1000,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: toGlow,
        duration: phase.duration * 1000,
        useNativeDriver: true,
      }),
    ]);
    animRef.current.start();

    let remaining = phase.duration;
    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const next = (index + 1) % PHASES.length;
        runPhase(next);
      }
    }, 1000);
  }, [scaleAnim, glowAnim]);

  const startBreathing = useCallback(() => {
    setIsPlaying(true);
    runPhase(0);
  }, [runPhase]);

  const stopBreathing = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animRef.current) animRef.current.stop();
  }, []);

  const toggleBreathing = useCallback(() => {
    if (isPlaying) {
      stopBreathing();
    } else {
      startBreathing();
    }
  }, [isPlaying, startBreathing, stopBreathing]);

  const resetBreathing = useCallback(() => {
    stopBreathing();
    setPhaseIndex(0);
    setCountdown(PHASES[0].duration);
    scaleAnim.setValue(1);
    glowAnim.setValue(0.6);
  }, [stopBreathing, scaleAnim, glowAnim]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animRef.current) animRef.current.stop();
    };
  }, []);

  return {
    phaseIndex,
    countdown,
    isPlaying,
    scaleAnim,
    glowAnim,
    startBreathing,
    stopBreathing,
    toggleBreathing,
    resetBreathing,
  };
};