import React, { useState, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fontSizes, spacing } from '../../../../../constants/theme';
import { BreathingSound } from '../hooks/useBreathingSounds';

interface BreathingPlayerProps {
  sound: BreathingSound | null;
  isBreathingPlaying: boolean;
  countdown: number;
  phaseDuration: number;
  onToggleBreathing: () => void;
  onReset: () => void;
}

export const BreathingPlayer: React.FC<BreathingPlayerProps> = ({
  sound,
  isBreathingPlaying,
  countdown,
  phaseDuration,
  onToggleBreathing,
  onReset,
}) => {
  const [soundError, setSoundError] = useState<string | null>(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // ✅ SIEMPRE llamar el hook, nunca condicionalmente
  // Si no hay URL, pasamos un string vacío (no cauará error)
  const player = useAudioPlayer(sound?.preview_url || '');

  // Reproducir cuando cambia breathing o sonido
  React.useEffect(() => {
    if (!sound || !player) return;

    const playAudio = async () => {
      try {
        setSoundError(null);

        if (isBreathingPlaying) {
          await player.play();
          setIsSoundPlaying(true);
        } else {
          player.pause();
          setIsSoundPlaying(false);
        }
      } catch (error: any) {
        setSoundError('Error al reproducir audio');
        console.error('Error:', error.message);
        setIsSoundPlaying(false);
      }
    };

    playAudio();
  }, [sound, player, isBreathingPlaying]);

  // Barra de progreso
  React.useEffect(() => {
    const progress = (1 - countdown / phaseDuration) * 100;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [countdown, phaseDuration]);

  return (
    <View style={styles.playerContainer}>
      {/* Barra de progreso */}
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Tiempo */}
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>0:00</Text>
        <Text style={styles.timeText}>∞</Text>
      </View>

      {/* Error mensaje intuitivo */}
      {soundError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {soundError}</Text>
          <Text style={styles.errorHint}>Intenta seleccionar otro sonido</Text>
        </View>
      )}

      {/* Info del sonido */}
      {sound && !soundError && (
        <View style={styles.soundInfo}>
          <Text style={styles.soundName}>🔊 {sound.nombre}</Text>
          <Text style={styles.soundStatus}>
            {isSoundPlaying ? '▶️ Reproduciéndose' : '⏸️ Pausado'}
          </Text>
        </View>
      )}

      {/* Controles */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButtonSecondary} onPress={onReset}>
          <Icon name="rotate-ccw" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButtonPrimary}
          onPress={onToggleBreathing}
          activeOpacity={0.8}
        >
          <Icon
            name={isBreathingPlaying ? 'pause' : 'play'}
            size={24}
            color={colors.white}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButtonSecondary}>
          <Icon
            name={isSoundPlaying ? 'volume-2' : 'volume-x'}
            size={20}
            color={isSoundPlaying ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  playerContainer: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    padding: spacing.sm,
    borderRadius: 6,
    gap: spacing.xs,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  errorHint: {
    fontSize: fontSizes.xs,
    color: '#CC5555',
    fontStyle: 'italic',
  },
  soundInfo: {
    backgroundColor: '#F5F5F5',
    padding: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  soundName: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  soundStatus: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  controlButtonPrimary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  controlButtonSecondary: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});