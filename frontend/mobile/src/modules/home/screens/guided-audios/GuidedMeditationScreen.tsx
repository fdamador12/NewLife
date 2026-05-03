import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing } from '../../../../constants/theme';
import { useGuidedMeditations } from './hooks/useGuidedMeditations';
import { useMeditationPlayer } from './hooks/useMeditationPlayer';
import MeditationHeader from './components/MeditationHeader';
import MeditationList from './components/MeditationList';
import MeditationPlayerView from './components/MeditationPlayerView';

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

  // 🔥 PAUSA + RESET AL SALIR DE LA SCREEN
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        stopAudio(); // ya incluye seekTo(0)
      };
    }, [])
  );

  // ============================
  // 🎯 SELECT
  // ============================
  const handleSelectMeditation = (meditation: any) => {
    stopAudio();
    setSelectedMeditation(meditation);

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