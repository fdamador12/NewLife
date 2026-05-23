import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import { useMotivationalPhrases } from '../../../care/hooks/useMotivationalPhrases';
import MotivationalCard from '../../../care/screens/motivational/components/MotivationalCard';
import { analytics, EVENT_TYPES } from '../../../../services/analytics';
import { isGuestMode } from '../../../../services/guestService';

export default function MotivationalPhrasesScreen({ navigation }: any) {
  const { frases, loading, toggleFavorito, fetchFrasesPorFecha } = useMotivationalPhrases();
  const hasFetched = useRef(false);
  const lastTrackedPhraseRef = useRef<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const checkGuest = async () => {
      const guest = await isGuestMode();
      setIsGuest(guest);
    };
    checkGuest();
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const today = new Date().toISOString().split('T')[0];
      fetchFrasesPorFecha(today);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const today = new Date().toISOString().split('T')[0];
      fetchFrasesPorFecha(today);
    });
    return unsubscribe;
  }, [navigation, fetchFrasesPorFecha]);

  useEffect(() => {
    if (frases.length > 0) {
      const fraseHoy = frases[0];
      if (fraseHoy?.frase_id && fraseHoy.frase_id !== lastTrackedPhraseRef.current) {
        lastTrackedPhraseRef.current = fraseHoy.frase_id;
        analytics.track(EVENT_TYPES.DAILY_PHRASE_VIEWED, {
          phrase_id: fraseHoy.frase_id,
          source: 'motivational_phrases_screen',
        });
      }
    }
  }, [frases]);

  const handleToggleFavorito = (fraseId: string) => {
    const frase = frases.find((f) => f.frase_id === fraseId);
    const wasFavorite = frase?.isFavorite ?? false;

    toggleFavorito(fraseId);

    if (!wasFavorite) {
      analytics.track(EVENT_TYPES.DAILY_PHRASE_FAVORITED, {
        phrase_id: fraseId,
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Hoy';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Frases motivacionales</Text>
        </View>
      </View>

      <Text style={styles.title}>Motívate</Text>
      <Text style={styles.subtitle}>Sigue adelante</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando frases...</Text>
        </View>
      ) : frases.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Feather name="inbox" size={32} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>Sin frases disponibles</Text>
          <Text style={styles.emptyText}>
            Vuelve mas tarde para encontrar nuevas frases de inspiracion
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {frases.map((item, index) => (
            <View key={item.frase_id} style={styles.cardContainer}>
              <View style={styles.timelineIndicator}>
                <View style={[
                  styles.timelineDot,
                  index === 0 && styles.timelineDotActive
                ]} />
                {index < frases.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              <View style={styles.cardContent}>
                <View style={styles.dateBadgeContainer}>
                  <View style={[
                    styles.dateBadge,
                    index === 0 && styles.dateBadgeToday
                  ]}>
                    <Feather
                      name="calendar"
                      size={12}
                      color={index === 0 ? colors.white : colors.primary}
                    />
                    <Text style={[
                      styles.dateBadgeText,
                      index === 0 && styles.dateBadgeTextToday
                    ]}>
                      {formatDate(item.dia)}
                    </Text>
                  </View>
                </View>

                {/* ✅ isGuest oculta el corazón */}
                <MotivationalCard
                  id={item.frase_id}
                  text={item.frase}
                  image={require('../../../../assets/images/phrase.jpg')}
                  isFavorite={item.isFavorite || false}
                  onToggleFavorite={handleToggleFavorito}
                  isGuest={isGuest}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('GuidedMeditationScreen')}
          >
            <Text style={styles.link}>Ir a práctica guiada</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  badge: {
    backgroundColor: colors.white, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderWidth: 1, borderColor: colors.border,
  },
  badgeText: { fontSize: fontSizes.sm, color: colors.text, fontWeight: '600' },
  title: { fontSize: fontSizes.xxl, fontWeight: '800', color: colors.text, paddingHorizontal: spacing.xl },
  subtitle: { fontSize: fontSizes.md, color: colors.textMuted, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  cardContainer: { flexDirection: 'row', marginBottom: spacing.lg },
  timelineIndicator: { width: 24, alignItems: 'center', paddingTop: 6 },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: colors.background,
  },
  timelineDotActive: {
    backgroundColor: colors.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginTop: spacing.xs,
  },
  cardContent: {
    flex: 1,
    gap: spacing.sm,
  },
  dateBadgeContainer: {
    flexDirection: 'row',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateBadgeToday: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  dateBadgeTextToday: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: fontSizes.md, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  linkButton: { alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.xl },
  link: { fontSize: fontSizes.sm, color: colors.accent, fontWeight: '600', textDecorationLine: 'underline' },
});