import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import { useMotivationalPhrases } from '../../hooks/useMotivationalPhrases';
import MotivationalCard from './components/MotivationalCard';
import { analytics, EVENT_TYPES } from '../../../../services/analytics';

type SortOption = 'recent' | 'oldest' | 'favorites' | 'non-favorites';

const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Más reciente',
  oldest: 'Más antiguo',
  favorites: 'Favoritas',
  'non-favorites': 'No favoritas',
};

export default function MotivationalScreen({ navigation }: any) {
  const { frases, loading, toggleFavorito, fetchFrasesPorFecha } = useMotivationalPhrases();
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const menuRef = React.useRef(null);

  // FIX: agregar tracking de MOTIVATIONAL_LIST_VIEWED al entrar.
  // Esta pantalla mostraba la lista historica de frases pero NO trackeaba
  // nada en analytics. Sin phrase_id porque es una lista (multiples frases
  // visibles, no sabemos cual esta leyendo el usuario).
  const trackedRef = useRef(false);
  useEffect(() => {
    if (!trackedRef.current) {
      trackedRef.current = true;
      analytics.track(EVENT_TYPES.MOTIVATIONAL_LIST_VIEWED);
    }
  }, []);

  // Cargar frases al montar
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetchFrasesPorFecha(today);
  }, [fetchFrasesPorFecha]);

  // Refetch al enfocar
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const today = new Date().toISOString().split('T')[0];
      fetchFrasesPorFecha(today);
      // Resetear tracking al volver a enfocar la pantalla
      trackedRef.current = false;
    });
    return unsubscribe;
  }, [navigation, fetchFrasesPorFecha]);

  // FIX bug analytics: trackear daily_phrase_favorited al marcar como favorita.
  // Aqui SI tiene sentido el phrase_id porque es una accion sobre UNA frase.
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

  // Logica de ordenamiento
  const sortedFrases = useMemo(() => {
    let sorted = [...frases];

    if (sortBy === 'recent') {
      sorted.sort((a, b) => new Date(b.dia).getTime() - new Date(a.dia).getTime());
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.dia).getTime() - new Date(b.dia).getTime());
    } else if (sortBy === 'favorites') {
      sorted = sorted.filter((f) => f.isFavorite);
      sorted.sort((a, b) => new Date(b.dia).getTime() - new Date(a.dia).getTime());
    } else if (sortBy === 'non-favorites') {
      sorted = sorted.filter((f) => !f.isFavorite);
      sorted.sort((a, b) => new Date(b.dia).getTime() - new Date(a.dia).getTime());
    }

    return sorted;
  }, [frases, sortBy]);

  // Formatear fecha para badge
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
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const handleSelectFilter = (option: SortOption) => {
    setSortBy(option);
    (menuRef.current as any)?.close?.();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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

      {/* Filtro activo con dropdown */}
      <View style={styles.filterRow}>
        <View style={styles.filterLabelContainer}>
          <Text style={styles.filterLabel}>Ordenado por:</Text>
          <Text style={styles.filterValue}>{SORT_LABELS[sortBy]}</Text>
        </View>
        <Menu ref={menuRef}>
          <MenuTrigger
            customStyles={{
              triggerWrapper: styles.menuTriggerWrapper,
              TriggerTouchableComponent: TouchableOpacity,
            }}
          >
            <Feather name="sliders" size={20} color={colors.primary} />
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsWrapper: styles.menuOptionsWrapper,
              optionWrapper: styles.menuOptionWrapper,
            }}
          >
            {(
              [
                'recent',
                'oldest',
                'favorites',
                'non-favorites',
              ] as SortOption[]
            ).map((option) => (
              <MenuOption
                key={option}
                onSelect={() => handleSelectFilter(option)}
                customStyles={{
                  optionWrapper: [
                    styles.menuOption,
                    sortBy === option && styles.menuOptionActive,
                  ],
                }}
              >
                <View style={styles.menuOptionContent}>
                  <Text
                    style={[
                      styles.menuOptionText,
                      sortBy === option && styles.menuOptionTextActive,
                    ]}
                  >
                    {SORT_LABELS[option]}
                  </Text>
                  {sortBy === option && (
                    <Feather name="check" size={16} color={colors.primary} />
                  )}
                </View>
              </MenuOption>
            ))}
          </MenuOptions>
        </Menu>
      </View>

      {/* Contenido */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando frases...</Text>
        </View>
      ) : sortedFrases.length === 0 ? (
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
          {sortedFrases.map((item, index) => (
            <View key={item.frase_id} style={styles.cardContainer}>
              {/* Indicador de timeline */}
              <View style={styles.timelineIndicator}>
                <View style={[
                  styles.timelineDot,
                  index === 0 && styles.timelineDotActive
                ]} />
                {index < sortedFrases.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              {/* Card content */}
              <View style={styles.cardContent}>
                {/* Badge de fecha */}
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

                {/* Motivational Card */}
                <MotivationalCard
                  id={item.frase_id}
                  text={item.frase}
                  image={require('../../../../assets/images/phrase.jpg')}
                  isFavorite={item.isFavorite || false}
                  onToggleFavorite={handleToggleFavorito}
                />
              </View>
            </View>
          ))}

        </ScrollView>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },

  badge: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },

  badgeText: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '600',
  },

  title: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: spacing.xl,
  },

  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },

  filterLabelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  filterLabel: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },

  filterValue: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '700',
  },

  menuTriggerWrapper: {
    padding: spacing.sm,
  },

  menuOptionsWrapper: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  menuOptionWrapper: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  menuOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  menuOptionActive: {
    backgroundColor: 'rgba(74, 123, 247, 0.1)',
  },

  menuOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  menuOptionText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
  },

  menuOptionTextActive: {
    color: colors.primary,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },

  cardContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },

  timelineIndicator: {
    width: 24,
    alignItems: 'center',
    paddingTop: 6,
    marginRight: spacing.sm,
  },

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
    marginTop: spacing.md,
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

  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },

  emptyText: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});