import React, { useEffect, useRef } from 'react';
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

  // Ref para trackear solo UNA vez por sesion de pantalla (no por re-render).
  // Se resetea cuando el componente se desmonta.
  const trackedRef = useRef(false);

  useEffect(() => {
    fetchFraseDia();
    fetchFrasesGuardadas();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchFraseDia();
      fetchFrasesGuardadas();
      // Resetear tracking al volver a enfocar la pantalla.
      // Asi si el usuario navega afuera y vuelve, se trackea de nuevo.
      trackedRef.current = false;
    });

    return unsubscribe;
  }, [navigation, fetchFraseDia, fetchFrasesGuardadas]);

  // Analytics: trackear DAILY_PHRASE_VIEWED al montar la pantalla.
  // NO incluimos phrase_id porque la pantalla muestra la frase del dia +
  // lista de frases guardadas. Atribuir a un solo phrase_id seria enganoso
  // porque el usuario puede estar leyendo cualquiera de las visibles.
  useEffect(() => {
    if (!trackedRef.current && !loading) {
      trackedRef.current = true;
      analytics.track(EVENT_TYPES.DAILY_PHRASE_VIEWED);
    }
  }, [loading]);

  // FIX bug analytics: trackear daily_phrase_favorited cuando el usuario marca
  // como favorita una frase desde esta pantalla.
  // El callback recibe el ID de la frase y si quedo favorita o no, para que
  // solo trackeemos al AGREGAR a favoritos, no al quitar.
  // Aqui SI tiene sentido el phrase_id porque es una accion sobre UNA frase
  // especifica (no una vista de lista).
  const handleFavoriteChange = (fraseId?: string, isFavoriteNow?: boolean) => {
    // Refetch inmediato cuando cambia favorita
    fetchFraseDia();
    fetchFrasesGuardadas();

    if (fraseId && isFavoriteNow === true) {
      analytics.track(EVENT_TYPES.DAILY_PHRASE_FAVORITED, {
        phrase_id: fraseId,
      });
    }
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
          // Filtrar: solo frases guardadas que NO sean la del dia
          const otherSavedPhrases = Array.isArray(frasesGuardadas)
            ? frasesGuardadas.filter((frase) => frase.frase_id !== fraseDia?.frase_id)
            : [];

          // CASO 1: Hay frases guardadas (que no son la del dia)
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

          // CASO 2: Solo la frase del dia esta guardada (no mostrar nada)
          if (frasesGuardadas.length === 1 && frasesGuardadas[0]?.frase_id === fraseDia?.frase_id) {
            return null;
          }

          // CASO 3: No hay nada guardado (mostrar mensaje)
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