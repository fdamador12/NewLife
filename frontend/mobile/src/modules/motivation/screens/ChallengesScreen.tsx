import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { useMotivation } from '../hooks/useMotivation';
import { useToast } from '../../../feedback/ToastContext';
import { analytics, EVENT_TYPES } from '../../../services/analytics';

type ChallengeTab = 'activos' | 'disponibles' | 'terminados';

const DIFFICULTY_COLORS: Record<string, string> = {
  SUAVE: '#4CAF50',
  MODERADA: '#FFC107',
  INTENSA: '#FF6B6B',
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const displayDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
  return (
    <View style={styles.difficultyRow}>
      <View
        style={[
          styles.difficultyDot,
          { backgroundColor: DIFFICULTY_COLORS[difficulty] || '#999' },
        ]}
      />
      <Text style={styles.difficultyText}>Dificultad: {displayDifficulty}</Text>
    </View>
  );
}

function ChallengeCard({
  challenge,
  onPress,
  onJoin,
  isAvailable,
}: {
  challenge: any;
  onPress: () => void;
  onJoin?: () => void;
  isAvailable: boolean;
}) {
  // ✅ Usar porcentaje del backend
  const percent = challenge.porcentaje ?? (
    challenge.target > 0
      ? Math.round(((challenge.progreso_actual || 0) / challenge.target) * 100)
      : 0
  );

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{challenge.titulo}</Text>
      <Text style={styles.cardDescription}>{challenge.descripcion}</Text>
      <DifficultyBadge difficulty={challenge.dificultad} />

      {!isAvailable && (
        <>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
          {/* ✅ Usar texto_progreso del backend */}
          <Text style={styles.progressLabel}>
            {challenge.texto_progreso || `${percent}% completado — ${challenge.progreso_actual || 0}/${challenge.target} cumplidos`}
          </Text>
        </>
      )}

      {isAvailable ? (
        <TouchableOpacity style={styles.button} onPress={onJoin}>
          <Text style={styles.buttonText}>Únete</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Ver más...</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ChallengesScreen({ navigation }: any) {
  const { misChallenges, loading, fetchMisChallenges, handleJoinChallenge } =
    useMotivation();
  const { showToast } = useToast();

  const [tab, setTab] = useState<ChallengeTab>('disponibles');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // FIX bug analytics: distinguir cambios manuales vs programaticos.
  // Cuando handleJoin cambia el tab a 'activos' automaticamente, eso NO
  // es una vista manual del usuario, asi que no debe disparar el track.
  const isProgrammaticChangeRef = useRef(false);

  useEffect(() => {
    fetchMisChallenges();
  }, [fetchMisChallenges]);

  // Analytics: trackear vista de la lista de retos.
  // Se dispara al montar y cada vez que el usuario cambia de tab manualmente.
  // Si el cambio fue programatico (por handleJoin), NO trackea — eso evita
  // que el evento se infle cuando solo el sistema cambio el tab.
  useEffect(() => {
    if (isProgrammaticChangeRef.current) {
      isProgrammaticChangeRef.current = false;
      return;
    }
    analytics.track(EVENT_TYPES.CHALLENGE_LIST_VIEWED, {
      tab,
    });
  }, [tab]);

  const handleJoin = async (retoId: string, dificultad: string) => {
    setJoiningId(retoId);
    try {
      await handleJoinChallenge(retoId);
      await fetchMisChallenges();

      analytics.track(EVENT_TYPES.CHALLENGE_JOINED, {
        challenge_id: retoId,
        difficulty: dificultad,
      });

      showToast('¡Te uniste al reto exitosamente!', 'success');

      // FIX: marcar como cambio programatico ANTES del setTab para que
      // el useEffect de tracking NO dispare challenge_list_viewed.
      isProgrammaticChangeRef.current = true;
      setTab('activos');
    } catch (err: any) {
      showToast(err?.message || 'No se pudo unir al reto', 'error');
    } finally {
      setJoiningId(null);
    }
  };

  // Handler para cambios manuales de tab desde la UI
  const handleTabChange = (newTab: ChallengeTab) => {
    // isProgrammaticChangeRef se queda en false, asi que el useEffect SI trackea
    setTab(newTab);
  };

  const getChallenges = () => {
    switch (tab) {
      case 'activos':
        return misChallenges.activos || [];
      case 'terminados':
        return misChallenges.terminados || [];
      case 'disponibles':
      default:
        return misChallenges.disponibles || [];
    }
  };

  const challenges = getChallenges();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Retos</Text>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'disponibles' && styles.tabButtonActive]}
          onPress={() => handleTabChange('disponibles')}
        >
          <Text style={[styles.tabText, tab === 'disponibles' && styles.tabTextActive]}>
            Disponibles
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'activos' && styles.tabButtonActive]}
          onPress={() => handleTabChange('activos')}
        >
          <Text style={[styles.tabText, tab === 'activos' && styles.tabTextActive]}>
            Activos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'terminados' && styles.tabButtonActive]}
          onPress={() => handleTabChange('terminados')}
        >
          <Text style={[styles.tabText, tab === 'terminados' && styles.tabTextActive]}>
            Terminados
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {challenges.length > 0 ? (
            challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.reto_id}
                challenge={challenge}
                isAvailable={tab === 'disponibles'}
                onPress={() =>
                  navigation.navigate('ChallengeDetail', { challenge })
                }
                onJoin={() => handleJoin(challenge.reto_id, challenge.dificultad)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No hay retos en esta categoría</Text>
            </View>
          )}
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  tabButton: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border || '#E0E0E0',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.white,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    color: colors.text,
  },
  cardDescription: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
});