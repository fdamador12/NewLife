import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSizes, borderRadius } from '../../../../constants/theme';
import { useBreathingSounds } from './hooks/useBreathingSounds';
import { useBreathingTimer } from './hooks/useBreathingTimer';
import { Feather } from '@expo/vector-icons';
import { analytics, EVENT_TYPES } from '../../../../services/analytics';

import { BreathingCircle } from './components/BreathingCircle';
import { SoundSelector } from './components/SoundSelector';
import { BreathingPlayer } from './components/BreathingPlayer';

interface BreathingScreenProps {
  navigation: any;
}

const PHASES = [
  { label: 'Inhala', duration: 4 },
  { label: 'Sostén', duration: 4 },
  { label: 'Exhala', duration: 5 },
];

// 1 ciclo completo = inhala + sostén + exhala = 13 segundos
const CYCLE_DURATION_SECONDS = PHASES.reduce((sum, p) => sum + p.duration, 0);

export default function BreathingScreen({ navigation }: BreathingScreenProps) {
  const { sounds, loading: soundsLoading, error: soundsError } = useBreathingSounds();
  const {
    phaseIndex,
    countdown,
    isPlaying,
    scaleAnim,
    glowAnim,
    toggleBreathing,
    resetBreathing,
  } = useBreathingTimer();

  const [selectedSoundId, setSelectedSoundId] = useState<string>('');

  // 📊 Analytics: refs para medir duración del ejercicio sin causar re-renders
  const startedAtRef = useRef<number | null>(null);
  const wasPlayingRef = useRef<boolean>(false);

  // 📊 Analytics: trackear que el usuario entró al "modo zen" al montar la pantalla.
  // BreathingScreen ES el modo zen (lo dice el badge en el header).
  useEffect(() => {
    analytics.track(EVENT_TYPES.ZEN_MODE_ENTERED);
  }, []);

  React.useEffect(() => {
    if (sounds.length > 0 && !selectedSoundId) {
      setSelectedSoundId(sounds[0]._id);
    }
  }, [sounds, selectedSoundId]);

  // 📊 Analytics: detectar transiciones play → pause/stop para medir el ejercicio
  useEffect(() => {
    if (isPlaying && !wasPlayingRef.current) {
      // Empezó el ejercicio
      startedAtRef.current = Date.now();
      analytics.track(EVENT_TYPES.BREATHING_EXERCISE_STARTED, {
        sound_id: selectedSoundId || null,
      });
    } else if (!isPlaying && wasPlayingRef.current && startedAtRef.current) {
      // Pausó/detuvo el ejercicio → considerarlo "completado" si duró al menos 1 ciclo
      const durationSeconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const cyclesCompleted = Math.floor(durationSeconds / CYCLE_DURATION_SECONDS);

      if (cyclesCompleted >= 1) {
        analytics.track(EVENT_TYPES.BREATHING_EXERCISE_COMPLETED, {
          duration_seconds: durationSeconds,
          cycles_completed: cyclesCompleted,
        });
      }

      startedAtRef.current = null;
    }
    wasPlayingRef.current = isPlaying;
  }, [isPlaying, selectedSoundId]);

  const selectedSound = sounds.find((s) => s._id === selectedSoundId) || null;
  const currentPhase = PHASES[phaseIndex];

  return (
    <View style={styles.container}>
      
      {/* 🔥 HEADER CORREGIDO (igual que frases) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Modo Zen</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Respira</Text>
        <Text style={styles.subtitle}>Encuentra la calma</Text>

        <BreathingCircle
          phaseLabel={currentPhase.label}
          countdown={countdown}
          scaleAnim={scaleAnim}
          glowAnim={glowAnim}
        />

        {soundsError && (
          <Text style={styles.errorText}>⚠️ Error: {soundsError}</Text>
        )}

        <SoundSelector
          sounds={sounds}
          selectedSoundId={selectedSoundId}
          onSelectSound={setSelectedSoundId}
          loading={soundsLoading}
        />

        <BreathingPlayer
          sound={selectedSound}
          isBreathingPlaying={isPlaying}
          countdown={countdown}
          phaseDuration={currentPhase.duration}
          onToggleBreathing={toggleBreathing}
          onReset={resetBreathing}
        />

        {/* BOTÓN NARANJA */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('MotivationalPhrasesScreen')}
        >
          <Text style={styles.link}>Ir a frases motivacionales</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },

  // 🔥 HEADER IGUAL AL DE FRASES
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  badge: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '600',
  },

  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  // BOTÓN NARANJA
  linkButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
    width: '100%',
  },
  link: {
    fontSize: fontSizes.sm,
    color: colors.accent,
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});