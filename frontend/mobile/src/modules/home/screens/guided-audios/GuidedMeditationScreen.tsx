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

  useFocusEffect(
    React.useCallback(() => {
      return () => stopAudio();
    }, [])
  );

  const handleSelectMeditation = (meditation: any) => {
    stopAudio();
    setSelectedMeditation(meditation);

    setTimeout(() => {
      playAudio();
    }, 120);
  };

  const handleBack = () => {
    stopAudio();
    setSelectedMeditation(null);
  };

  const handlePlayPause = () => {
    isPlaying ? pauseAudio() : playAudio();
  };

  const handleSeek = (time: number) => {
    seek(time);
  };

  const handleSkipBack = () => {
    skipBack10();
  };

  const handleSkipForward = () => {
    skipForward10();
  };

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
        onNavigateToBreathing={() =>
          navigation.navigate('BreathingScreen')
        }
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
    backgroundColor: colors.background, // 👈 NO CAMBIADO
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
  },
});