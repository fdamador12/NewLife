import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { spacing, fontSizes } from '../../../../../constants/theme';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
}

export default function PlayerControls({
  isPlaying,
  onPlayPause,
  onSkipBack,
  onSkipForward,
}: PlayerControlsProps) {
  return (
    <View style={styles.controls}>
      <TouchableOpacity onPress={onSkipBack}>
        <View style={styles.skipButton}>
          <Feather name="rotate-ccw" size={20} color="#406ADF" />
          <Text style={styles.skipText}>10</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.playButton} onPress={onPlayPause}>
        <Feather
          name={isPlaying ? 'pause' : 'play'}
          size={24}
          style={!isPlaying ? { marginLeft: 5 } : undefined}
          color="white"
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onSkipForward}>
        <View style={styles.skipButton}>
          <Feather name="rotate-cw" size={20} color="#406ADF" />
          <Text style={styles.skipText}>10</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#406ADF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#5C6BC0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: fontSizes.xs,
    color: '#406ADF',
    marginTop: 2,
  },
});