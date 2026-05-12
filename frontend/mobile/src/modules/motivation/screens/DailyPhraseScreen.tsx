import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { useMotivation } from '../hooks/useMotivation';
import { PhraseCard } from '../components/PhraseCard';
import { analytics, EVENT_TYPES } from '../../../services/analytics';

export default function DailyPhraseScreen({ navigation }: any) {
  const {
    fraseDia,
    frasesGuardadas,
    loading,
    fetchFraseDia,
    fetchFrasesGuardadas,
  } = useMotivation();

  useEffect(() => {
    // ✅ Cargar inmediatamente al montar
    fetchFraseDia();
    fetchFrasesGuardadas();

    // ✅ Refetch cuando vuelves a la pantalla (desde otra pantalla)
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFraseDia();
      fetchFrasesGuardadas();
    });

    return unsubscribe;
  }, [navigation, fetchFraseDia, fetchFrasesGuardadas]);

  // Analytics: trackear daily_phrase_viewed cada vez que se carga la frase.
  // Sin dedup: si el usuario vuelve a esta pantalla, se trackea de nuevo.
  // Eso refleja el engagement real con esta frase especifica.
  useEffect(() => {
    if (fraseDia?.frase_id) {
      analytics.track(EVENT_TYPES.DAILY_PHRASE_VIEWED, {
        phrase_id: fraseDia.frase_id,
        source: 'daily_phrase_screen',
      });
    }
  }, [fraseDia?.frase_id]);

  const handleFavoriteChange = () => {
    // ✅ Refetch inmediato cuando cambia favorita
    fetchFraseDia();
    fetchFrasesGuardadas();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Tu frase del día</Text>
          <Text style={styles.headerSubtitle}>Lee, respira y reflexiona.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : fraseDia ? (
          <PhraseCard
            fraseId={fraseDia.frase_id}
            texto={fraseDia.frase}
            isFavorite={fraseDia.isFavorite || false}
            onFavoriteChange={handleFavoriteChange}
          />
        ) : null}

        {/* Frases Guardadas - Excluir la frase del día */}
        {(() => {
          // ✅ Filtrar: solo frases guardadas que NO sean la del día
          const otherSavedPhrases = Array.isArray(frasesGuardadas)
            ? frasesGuardadas.filter((frase) => frase.frase_id !== fraseDia?.frase_id)
            : [];

          console.log('🔍 otherSavedPhrases:', otherSavedPhrases);
          console.log('🔍 otherSavedPhrases.length:', otherSavedPhrases.length);
          console.log('🔍 frasesGuardadas.length:', frasesGuardadas.length);

          // ✅ CASO 1: Hay frases guardadas (que no son la del día)
          if (otherSavedPhrases.length > 0) {
            return (
              <>
                <Text style={styles.savedTitle}>Frases guardadas</Text>
                {otherSavedPhrases.map((frase) => (
                  <PhraseCard
                    key={frase.frase_id}
                    fraseId={frase.frase_id}
                    texto={frase.frase}
                    isFavorite={true}
                    onFavoriteChange={handleFavoriteChange}
                  />
                ))}
              </>
            );
          }

          // ✅ CASO 2: Solo la frase del día está guardada (no mostrar nada)
          if (frasesGuardadas.length === 1 && frasesGuardadas[0]?.frase_id === fraseDia?.frase_id) {
            return null;
          }

          // ✅ CASO 3: No hay nada guardado (mostrar mensaje)
          return (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Aún no tienes frases guardadas</Text>
              <Text style={styles.emptySubtext}>Guarda tus frases favoritas dándole corazón</Text>
            </View>
          );
        })()}

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
    gap: spacing.md,
  },
  savedTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  loadingContainer: {
    height: 220,
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
  emptySubtext: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
});