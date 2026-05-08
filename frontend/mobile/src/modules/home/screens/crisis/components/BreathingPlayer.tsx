import React, { useState, useRef } from 'react';
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
  const [isMuted, setIsMuted] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const animLoopRef = useRef<any>(null);

  // ✅ Siempre llamar hook
  const player = useAudioPlayer(sound?.preview_url || '');

  // ✅ PLAY/PAUSE - Controla reproducción Y animación
  React.useEffect(() => {
    if (!sound || !player) return;

    const playAudio = async () => {
      try {
        setSoundError(null);

        if (isBreathingPlaying) {
          // REPRODUCIR - Solo si NO está muteado
          if (!isMuted) {
            await player.play();
          }

          // Iniciar animación de barra en LOOP (SIEMPRE, esté muteado o no)
          if (animLoopRef.current) {
            animLoopRef.current.stop();
          }
          animLoopRef.current = Animated.loop(
            Animated.sequence([
              Animated.timing(progressAnim, {
                toValue: 100,
                duration: phaseDuration * 1000,
                useNativeDriver: false,
              }),
              Animated.timing(progressAnim, {
                toValue: 0,
                duration: 0,
                useNativeDriver: false,
              }),
            ]),
            { iterations: -1 }
          );
          animLoopRef.current.start();
        } else {
          // PAUSA - Detener SOLO audio, animación se detiene
          player.pause();
          if (animLoopRef.current) {
            animLoopRef.current.stop();
          }
          progressAnim.setValue(0);
        }
      } catch (error: any) {
        setSoundError('Error al reproducir audio');
        console.error('Error:', error.message);
      }
    };

    playAudio();
  }, [sound, player, isBreathingPlaying, phaseDuration]);

  // ✅ MUTE/UNMUTE - SOLO controla sonido, NO afecta animación ni estado de play
  const handleMuteToggle = async () => {
    if (!player || !sound || !isBreathingPlaying) return;

    try {
      setSoundError(null);

      if (!isMuted) {
        // MUTEAR - Pausar audio SIN afectar animación
        player.pause();
        setIsMuted(true);
      } else {
        // DESMUETEAR - Reanudar audio SIN reiniciar (continúa donde estaba)
        await player.play();
        setIsMuted(false);
      }
    } catch (error: any) {
      setSoundError('Error al controlar volumen');
      console.error('Error:', error.message);
    }
  };

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (animLoopRef.current) {
        animLoopRef.current.stop();
      }
    };
  }, []);

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
        <Text style={styles.timeText}>∞</Text>
        <Text style={styles.timeText}>∞</Text>
      </View>

      {/* Error mensaje */}
      {soundError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {soundError}</Text>
          <Text style={styles.errorHint}>Intenta seleccionar otro sonido</Text>
        </View>
      )}

      {/* Controles */}
      <View style={styles.controls}>
        {/* Botón Reset */}
        <TouchableOpacity style={styles.controlButtonSecondary} onPress={onReset}>
          <Icon name="rotate-ccw" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Botón Play/Pause - Controla reproducción Y animación */}
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

        {/* Botón Mute/Unmute - SOLO silencia audio, nada más */}
        <TouchableOpacity
          style={styles.controlButtonSecondary}
          onPress={handleMuteToggle}
          disabled={!isBreathingPlaying}
        >
          <Icon
            name={isMuted ? 'volume-x' : 'volume-2'}
            size={20}
            color={isMuted ? colors.textMuted : colors.primary}
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
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
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