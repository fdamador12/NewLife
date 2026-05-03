import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { colors, spacing } from '../../../../constants/theme';

import { useBreathingSounds } from './hooks/useBreathingSounds';
import { useBreathingTimer } from './hooks/useBreathingTimer';

import { BreathingHeader } from './components/BreathingHeader';
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

  React.useEffect(() => {
    if (sounds.length > 0 && !selectedSoundId) {
      setSelectedSoundId(sounds[0]._id);
    }
  }, [sounds, selectedSoundId]);

  const selectedSound = sounds.find((s) => s._id === selectedSoundId) || null;
  const currentPhase = PHASES[phaseIndex];

  return (
    <View style={styles.container}>
      <BreathingHeader onBack={() => navigation.goBack()} />

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

        <View style={styles.linksContainer}>
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('MotivationalPhrasesScreen')}
          >
            📝 Frases motivacionales
          </Text>
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('GuidedMeditationScreen')}
          >
            🎧 Meditación guiada
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
  },
  scrollContent: {
    alignItems: 'center',
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
  linksContainer: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  link: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: spacing.sm,
    textDecorationLine: 'underline',
  },
});