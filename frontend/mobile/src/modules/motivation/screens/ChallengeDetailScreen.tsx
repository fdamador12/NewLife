import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { useMotivation } from '../hooks/useMotivation';
import { useToast } from '../../../feedback/ToastContext';

const DIFFICULTY_COLORS: Record<string, string> = {
  SUAVE: '#4CAF50',
  MODERADA: '#FFC107',
  INTENSA: '#FF6B6B',
};

const CheckIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path
      d="M5 12L10 17L19 7"
      stroke="#FFF"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const ProgressDot = ({
  isActive,
  isCompleted,
  index,
}: {
  isActive: boolean;
  isCompleted: boolean;
  index: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 80),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const dotStyle = isActive || isCompleted ? styles.dotFilled : styles.dotEmpty;

  return (
    <Animated.View
      style={[
        styles.dotWrapper,
        { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={[styles.dot, dotStyle]}>
        {(isActive || isCompleted) && <CheckIcon />}
      </View>
      {(isActive || isCompleted) && <View style={styles.dotGlow} />}
    </Animated.View>
  );
};

export default function ChallengeDetailScreen({ navigation, route }: any) {
  const { fetchMisChallenges, misChallenges, handleJoinChallenge } = useMotivation();
  const { showToast } = useToast();

  useEffect(() => {
    fetchMisChallenges();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchMisChallenges();
    });
    return unsubscribe;
  }, [navigation, fetchMisChallenges]);

  const { challenge: challengeParam } = route.params;

  const challengeFresco =
    [...(misChallenges.activos || []), ...(misChallenges.terminados || [])]
      .find(c => c.reto_id === challengeParam.reto_id);

  if (!challengeFresco) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const challenge = challengeFresco;
  const isCompleted = challenge.estado === 'COMPLETED';
  const isFailed = challenge.estado === 'FAILED';

  const percent = challenge.porcentaje ?? (
    challenge.target > 0
      ? Math.round(((challenge.progreso_actual || 0) / challenge.target) * 100)
      : 0
  );

  const displayDifficulty = challenge.dificultad.charAt(0).toUpperCase()
    + challenge.dificultad.slice(1).toLowerCase();

  const getHeaderSubtitle = () => {
    if (isCompleted) return 'Reto completado';
    if (isFailed) return 'Reto interrumpido';
    return 'Reto activo';
  };

  const handleRetry = async () => {
    try {
      await handleJoinChallenge(challenge.reto_id);
      showToast('¡Reto reiniciado! Sigue adelante 💪', 'success');
      navigation.navigate('Home', { initialTab: 'Motivation' });
    } catch (err: any) {
      showToast(err?.message || 'No se pudo reiniciar el reto', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{challenge.titulo}</Text>
          <Text style={styles.headerSubtitle}>{getHeaderSubtitle()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>{challenge.descripcion}</Text>

        {challenge.texto_progreso && !isCompleted && (
          <Text style={styles.textoProgreso}>{challenge.texto_progreso}</Text>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressNumber}>{challenge.progreso_actual || 0}</Text>
            <Text style={styles.progressText}> de </Text>
            <Text style={styles.progressNumber}>{challenge.target}</Text>
            <Text style={styles.progressText}> cumplidos</Text>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${percent}%` },
                isFailed && styles.progressBarFailed,
              ]}
            />
          </View>

          {challenge.target <= 30 && (
            <View style={styles.dotsRow}>
              {Array.from({ length: challenge.target }).map((_, i) => (
                <ProgressDot
                  key={i}
                  index={i}
                  isActive={i < (challenge.progreso_actual || 0)}
                  isCompleted={isCompleted && i < (challenge.progreso_actual || 0)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={[
          styles.medalCard,
          isCompleted && styles.medalCardCompleted,
          isFailed && styles.medalCardFailed,
        ]}>
          <Text style={[styles.medalEmoji, !isCompleted && styles.medalEmojiGray]}>
            {isFailed ? '💔' : '🏅'}
          </Text>
          <Text style={[styles.medalTitle, !isCompleted && styles.medalTitleGray]}>
            {isFailed ? 'Reto interrumpido' : challenge.titulo}
          </Text>
          {isFailed && (
            <Text style={styles.medalFailedSubtext}>
              Llegaste a {challenge.progreso_actual}/{challenge.target} — ¡puedes volver a intentarlo!
            </Text>
          )}
        </View>

        {isFailed && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.85}
          >
            <Feather name="refresh-cw" size={18} color={colors.white} />
            <Text style={styles.retryButtonText}>Volver a intentarlo</Text>
          </TouchableOpacity>
        )}

        <View style={styles.difficultyRow}>
          <View
            style={[
              styles.difficultyDot,
              { backgroundColor: DIFFICULTY_COLORS[challenge.dificultad] || '#999' },
            ]}
          />
          <Text style={styles.difficultyText}>Dificultad: {displayDifficulty}</Text>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  description: {
    fontSize: fontSizes.md,
    color: colors.textLight || colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  textoProgreso: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  progressNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#406ADF',
  },
  progressText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(173, 206, 245, 0.52)',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#406ADF',
    borderRadius: 3,
  },
  progressBarFailed: {
    backgroundColor: '#FF6B6B',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dotWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dotFilled: {
    backgroundColor: '#406ADF',
    shadowColor: '#406ADF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dotEmpty: {
    backgroundColor: '#cbe2fc',
    borderWidth: 2,
    borderColor: 'rgba(90, 116, 230, 0.39)',
    borderStyle: 'dashed',
  },
  dotGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(90, 116, 230, 0.39)',
    zIndex: 1,
  },
  medalCard: {
    backgroundColor: '#F0F0F0',
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  medalCardCompleted: {
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  medalCardFailed: {
    backgroundColor: '#FFF5F5',
  },
  medalEmoji: {
    fontSize: 56,
  },
  medalEmojiGray: {
    opacity: 0.3,
  },
  medalTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  medalTitleGray: {
    color: colors.textMuted,
  },
  medalFailedSubtext: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  difficultyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  difficultyText: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '600',
  },
});