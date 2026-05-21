import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing } from '../../../../constants/theme';
import { useGuidedMeditations } from './hooks/useGuidedMeditations';
import { useMeditationPlayer } from './hooks/useMeditationPlayer';
import MeditationHeader from './components/MeditationHeader';
import MeditationList from './components/MeditationList';
import MeditationPlayerView from './components/MeditationPlayerView';
import { analytics, EVENT_TYPES } from '../../../../services/analytics';

export default function GuidedMeditationScreen({ navigation }: any) {
  const { meditations, loading, error } = useGuidedMeditations();
  const [selectedMeditation, setSelectedMeditation] = useState<any>(null);

  const {
    isPlaying,
    currentTime,
    playAudio,
    pauseAudio,
    stopAudio,
    seek,
    skipBack10,
    skipForward10,
  } = useMeditationPlayer(selectedMeditation?.url || '');

  // 📊 Analytics: refs para evitar trackear multiples veces el mismo evento
  const startedTrackedRef = useRef(false);
  const completedTrackedRef = useRef(false);

  // 🔥 PAUSA + RESET AL SALIR DE LA SCREEN
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        stopAudio(); // ya incluye seekTo(0)
      };
    }, [])
  );

  // 📊 Analytics: detectar inicio del audio (play tras estar pausado/parado)
  useEffect(() => {
    if (isPlaying && selectedMeditation && !startedTrackedRef.current) {
      startedTrackedRef.current = true;
      analytics.track(EVENT_TYPES.GUIDED_MEDITATION_STARTED, {
        meditation_id: selectedMeditation._id || selectedMeditation.id,
        meditation_name: selectedMeditation.nombre,
      });
    }
  }, [isPlaying, selectedMeditation]);

  // 📊 Analytics: detectar completación (cuando llega al final del audio).
  // useMeditationPlayer no expone un callback "ended", así que detectamos cuando
  // currentTime está cerca del total (>=95%) y el reproductor se detuvo.
  useEffect(() => {
    if (!selectedMeditation || completedTrackedRef.current) return;

    const totalSeconds = (selectedMeditation.duracion ?? 0) * 60;
    if (totalSeconds <= 0) return;

    const progress = currentTime / totalSeconds;

    // Si completó al menos el 95% del audio → consideramos completado
    if (progress >= 0.95) {
      completedTrackedRef.current = true;
      analytics.track(EVENT_TYPES.GUIDED_MEDITATION_COMPLETED, {
        meditation_id: selectedMeditation._id || selectedMeditation.id,
        duration_seconds: Math.floor(currentTime),
      });
    }
  }, [currentTime, selectedMeditation]);

  // ============================
  // 🎯 SELECT
  // ============================
  const handleSelectMeditation = (meditation: any) => {
    stopAudio();
    setSelectedMeditation(meditation);

    // 📊 Reset refs para la nueva meditación
    startedTrackedRef.current = false;
    completedTrackedRef.current = false;

    // autoplay desde inicio
    setTimeout(() => {
      playAudio();
    }, 150);
  };

  // ============================
  // 🔙 BACK
  // ============================
  const handleBack = () => {
    stopAudio();
    setSelectedMeditation(null);
    // 📊 Reset refs al salir del player
    startedTrackedRef.current = false;
    completedTrackedRef.current = false;
  };

  const handlePlayPause = () => {
    if (isPlaying) pauseAudio();
    else playAudio();
  };

  const handleSeek = (time: number) => seek(time);
  const handleSkipBack = () => skipBack10();
  const handleSkipForward = () => skipForward10();

  if (selectedMeditation) {
    return (
      <MeditationPlayerView
        meditation={selectedMeditation}
        isPlaying={isPlaying}
        currentTime={currentTime}
        onPlayPause={handlePlayPause}
        onSkipBack={handleSkipBack}
        onSkipForward={handleSkipForward}
        onSeek={handleSeek}
        onBack={handleBack}
        onNavigateToBreathing={() => {
          stopAudio(); // 🔥 RESET TOTAL
          navigation.navigate('BreathingScreen');
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <MeditationHeader onBack={() => navigation.goBack()} />

      <MeditationList
        meditations={meditations}
        loading={loading}
        error={error}
        onSelectMeditation={handleSelectMeditation}
      />
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
});