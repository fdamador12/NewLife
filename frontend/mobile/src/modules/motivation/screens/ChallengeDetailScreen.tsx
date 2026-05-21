import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { useMotivation } from '../hooks/useMotivation';
import { useToast } from '../../../feedback/ToastContext';
import { reclamarXp } from '../../../services/motivationService';
import { ProgressDots } from './challenge-detail/ProgressDots';
import { MedalCard } from './challenge-detail/MedalCard';
import { XpClaimButton } from './challenge-detail/XpClaimButton';
import { analytics, EVENT_TYPES } from '../../../services/analytics';

const DIFFICULTY_COLORS: Record<string, string> = {
  SUAVE: '#4CAF50',
  MODERADA: '#FFC107',
  INTENSA: '#FF6B6B',
};

export default function ChallengeDetailScreen({ navigation, route }: any) {
  const { fetchMisChallenges, misChallenges, handleJoinChallenge } = useMotivation();
  const { showToast } = useToast();

  // Analytics: refs para evitar trackear varias veces el mismo evento dentro
  // de la misma instancia de pantalla.
  const viewedTrackedRef = useRef(false);
  const completedTrackedRef = useRef(false);

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

  // Analytics: trackear vista del reto (1 vez por instancia de esta pantalla).
  useEffect(() => {
    if (!viewedTrackedRef.current && challengeParam?.reto_id) {
      viewedTrackedRef.current = true;
      analytics.track(EVENT_TYPES.CHALLENGE_VIEWED, {
        challenge_id: challengeParam.reto_id,
        difficulty: challengeParam.dificultad,
      });
    }
  }, [challengeParam]);

  // Analytics: detectar cuando el usuario VE que su reto se completo.
  // El backend marca el reto como COMPLETED automaticamente cuando llega al
  // target, asi que el "momento de completar" desde la perspectiva del usuario
  // es cuando abre la pantalla y descubre que ya esta hecho.
  useEffect(() => {
    if (!completedTrackedRef.current && challengeFresco?.estado === 'COMPLETED') {
      completedTrackedRef.current = true;
      analytics.track(EVENT_TYPES.CHALLENGE_COMPLETED, {
        challenge_id: challengeFresco.reto_id,
        difficulty: challengeFresco.dificultad,
      });
    }
  }, [challengeFresco]);

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

  const handleClaim = async () => {
    if (!challenge.user_reto_id) return;
    try {
      const result = await reclamarXp(challenge.user_reto_id);
      await fetchMisChallenges();

      if (result.evolved) {
        navigation.navigate('PetEvolution', {
          newForm: result.new_form,
          xpGained: result.xp_gained,
          destination: 'Home',
          destinationParams: { initialTab: 'Motivation' },
        });
      } else {
        showToast(`+${result.xp_gained} XP para tu mascota 🌱`, 'success');
      }
    } catch (err: any) {
      showToast(err?.message || 'No se pudo reclamar la XP', 'error');
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
            <ProgressDots
              target={challenge.target}
              progreso={challenge.progreso_actual || 0}
              isCompleted={isCompleted}
            />
          )}
        </View>

        <MedalCard
          titulo={challenge.titulo}
          isCompleted={isCompleted}
          isFailed={isFailed}
          progreso_actual={challenge.progreso_actual || 0}
          target={challenge.target}
          onRetry={handleRetry}
        />

        {isCompleted && (
          <XpClaimButton
            xp_reclamado={challenge.xp_reclamado ?? false}
            dificultad={challenge.dificultad}
            onClaim={handleClaim}
          />
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