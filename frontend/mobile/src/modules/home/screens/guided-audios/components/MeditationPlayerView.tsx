import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing } from '../../../../../constants/theme';
import PlayerControls from './PlayerControls';

const { width } = Dimensions.get('window');
const PROGRESS_WIDTH = width - spacing.xl * 2;

export default function MeditationPlayerView({
  meditation,
  isPlaying,
  currentTime,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  onSeek,
  onBack,
  onNavigateToBreathing,
}: any) {

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const totalSeconds = meditation.duracion * 60;

  const progress =
    totalSeconds > 0 ? currentTime / totalSeconds : 0;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e) => {
        const x = e.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, x / PROGRESS_WIDTH));
        onSeek(Math.floor(ratio * totalSeconds));
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* HEADER (IGUAL) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="heart" size={20} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Feather name="download" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT (IGUAL) */}
      <View style={styles.playerContent}>
        <Text style={styles.playerTitle}>Escucha...</Text>
        <Text style={styles.playerSubtitle}>
          {meditation.nombre}
        </Text>

        <PlayerControls
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onSkipBack={onSkipBack}       // 🔥 -10s
          onSkipForward={onSkipForward} // 🔥 +10s
        />

        {/* PROGRESS (MISMA ESTÉTICA) */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar} {...panResponder.panHandlers}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%` },
              ]}
            />

            <View
              style={[
                styles.progressThumb,
                { left: `${progress * 100}%` },
              ]}
            />
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>
              {formatTime(currentTime)}
            </Text>

            <Text style={styles.timeText}>
              {formatTime(totalSeconds)}
            </Text>
          </View>
        </View>
      </View>

      {/* BOTÓN ORIGINAL (NO TOCADO VISUALMENTE) */}
      <TouchableOpacity
        style={styles.exitButton}
        onPress={onNavigateToBreathing}
      >
        <Text style={styles.exitText}>Ir al modo zen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // 👈 intacto
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },

  playerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },

  playerTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.text,
  },

  playerSubtitle: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },

  progressContainer: {
    width: '100%',
  },

  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#406ADF',
  },

  progressThumb: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#406ADF',
    marginLeft: -8,
  },

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  timeText: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },

  exitButton: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },

  exitText: {
    fontSize: fontSizes.sm,
    color: colors.accent, // 👈 botón naranja intacto
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});