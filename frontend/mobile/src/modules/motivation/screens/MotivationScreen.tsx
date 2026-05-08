import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { useMotivation } from '../hooks/useMotivation';
import { PhraseCard } from '../components/PhraseCard';
import { ChallengeCard } from '../components/ChallengeCard';

export default function MotivationScreen({ navigation }: any) {
  const {
    fraseDia,
    misChallenges,
    loading,
    fetchFraseDia,
    fetchMisChallenges,
  } = useMotivation();

  useEffect(() => {
    fetchFraseDia();
    fetchMisChallenges();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchFraseDia();
      fetchMisChallenges();
    });

    return unsubscribe;
  }, [navigation, fetchFraseDia, fetchMisChallenges]);

  const handleFavoriteChange = () => {
    fetchFraseDia();
  };

  // ✅ Mostrar el reto activo con más progreso porcentual en lugar del último
  const retoMasAvanzado = misChallenges.activos && misChallenges.activos.length > 0
    ? misChallenges.activos.reduce((prev, curr) => {
        const prevPercent = prev.porcentaje ?? (prev.target > 0 ? Math.round(((prev.progreso_actual || 0) / prev.target) * 100) : 0);
        const currPercent = curr.porcentaje ?? (curr.target > 0 ? Math.round(((curr.progreso_actual || 0) / curr.target) * 100) : 0);
        return currPercent > prevPercent ? curr : prev;
      })
    : null;

  const tieneRetosActivos = misChallenges.activos && misChallenges.activos.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Motivación</Text>
            <Text style={styles.subtitle}>Tu impulso diario para seguir adelante.</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Medals')}>
            <Text style={styles.medalIcon}>🏅</Text>
          </TouchableOpacity>
        </View>

        {/* Frase del Día */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => navigation.navigate('DailyPhrase')}
        >
          <Text style={styles.sectionTitle}>Frase del Día</Text>
          <Feather name="chevron-right" size={18} color={colors.text} />
        </TouchableOpacity>

        {loading ? (
          <View style={styles.phraseCardLoading}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : fraseDia ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('DailyPhrase')}
            activeOpacity={0.9}
          >
            <PhraseCard
              fraseId={fraseDia.frase_id}
              texto={fraseDia.frase}
              isFavorite={fraseDia.isFavorite || false}
              onFavoriteChange={handleFavoriteChange}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyPhraseContainer}>
            <Feather name="inbox" size={48} color={colors.textMuted} />
            <Text style={styles.emptyPhraseTitle}>No hay frase del día</Text>
            <Text style={styles.emptyPhraseSubtext}>
              Aún no se ha publicado una frase inspiradora para hoy. ¡Intenta más tarde!
            </Text>
            <TouchableOpacity
              style={styles.emptyPhraseButton}
              onPress={() => navigation.navigate('DailyPhrase')}
            >
              <Text style={styles.emptyPhraseButtonText}>Ver frases guardadas</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Retos */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => navigation.navigate('Challenges')}
        >
          <Text style={styles.sectionTitle}>Retos</Text>
          <Feather name="chevron-right" size={18} color={colors.text} />
        </TouchableOpacity>

        {loading ? (
          <View style={styles.challengeCardLoading}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : tieneRetosActivos && retoMasAvanzado ? (
          <ChallengeCard
            titulo={retoMasAvanzado.titulo}
            descripcion={retoMasAvanzado.descripcion}
            dificultad={retoMasAvanzado.dificultad}
            progreso_actual={retoMasAvanzado.progreso_actual || 0}
            target={retoMasAvanzado.target}
            porcentaje={retoMasAvanzado.porcentaje}
            texto_progreso={retoMasAvanzado.texto_progreso}
            onPress={() =>
              navigation.navigate('ChallengeDetail', { challenge: retoMasAvanzado })
            }
          />
        ) : (
          <View style={styles.emptyChallenge}>
            <Feather name="award" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>Aún no estás en ningún reto</Text>
            <Text style={styles.emptySubtext}>¡Únete a uno y comienza tu desafío!</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Challenges')}
            >
              <Text style={styles.emptyButtonText}>Ver retos disponibles</Text>
            </TouchableOpacity>
          </View>
        )}

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
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  medalIcon: {
    fontSize: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  phraseCardLoading: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  emptyPhraseContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  emptyPhraseTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textMuted,
  },
  emptyPhraseSubtext: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyPhraseButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  emptyPhraseButtonText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  challengeCardLoading: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  emptyChallenge: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  emptySubtext: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
});