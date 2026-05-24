import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import { useContent } from '../../hooks/useContent';
import ContentCard from './components/ContentCard';
import { analytics, EVENT_TYPES } from '../../../../services/analytics';

const normalizeText = (text: string) => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .toLowerCase();
};

const SEARCH_IDLE_MS = 2500;
const SEARCH_MIN_CHARS = 3;

export default function ContentScreen({ navigation }: any) {
  const {
    contenido,
    categorias,
    loading,
    error,
    toggleFavorito,
    getItemsByCategory,
  } = useContent();

  const [search, setSearch] = useState('');

  const lastTrackedQueryRef = useRef<string>('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    analytics.track(EVENT_TYPES.CONTENT_LIST_VIEWED);
  }, []);

  const normalizedSearch = normalizeText(search);

  const filtered = search.trim()
    ? contenido.filter((c) => {
        const title = normalizeText(c.title);
        const tags = c.tags.map((t) => normalizeText(t));
        return (
          title.includes(normalizedSearch) ||
          tags.some((t) => t.includes(normalizedSearch))
        );
      })
    : null;

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = search.trim();

    if (trimmed.length < SEARCH_MIN_CHARS) return;
    if (trimmed === lastTrackedQueryRef.current) return;

    debounceTimerRef.current = setTimeout(() => {
      analytics.track(EVENT_TYPES.CONTENT_SEARCHED, {
        query: trimmed,
        results_count: filtered?.length ?? 0,
      });
      lastTrackedQueryRef.current = trimmed;
    }, SEARCH_IDLE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error && contenido.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Feather name="alert-circle" size={48} color={colors.textMuted} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Contenido</Text>
            <Text style={styles.headerSubtitle}>Entiende tu proceso</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('FavoritesScreen')}>
            <Feather name="heart" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Busca temas o dudas..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {filtered ? (
          <ScrollView
            contentContainerStyle={styles.searchResults}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.searchResultsTitle}>{filtered.length} resultados</Text>

            {filtered.length === 0 ? (
              <View style={styles.emptySearch}>
                <Feather name="inbox" size={48} color={colors.textMuted} />
                <Text style={styles.emptySearchText}>No encontramos resultados</Text>
              </View>
            ) : (
              filtered.map((item) => (
                <ContentCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  type={item.type}
                  duration={item.duration}
                  image={item.image}
                  liked={item.liked}
                  wide
                  onPress={() => navigation.navigate('ArticleScreen', { item })}
                  onToggleLike={toggleFavorito}
                />
              ))
            )}

            <View style={{ height: spacing.xl }} />
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {categorias.map((categoria) => {
              const categoryName = categoria.nombre;
              const items = getItemsByCategory(categoryName, 3);

              if (items.length === 0) return null;

              return (
                <View key={categoria.categoria_id || 'otros'}>
                  <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>{categoryName}</Text>

                    <TouchableOpacity
                      style={styles.seeAllButton}
                      onPress={() => {
                        const allItems = getItemsByCategory(categoryName, 999);
                        navigation.navigate('CategoryScreen', {
                          category: categoryName,
                          items: allItems,
                        });
                      }}
                    >
                      <Text style={styles.seeAllText}>Ver todos</Text>
                      <Feather name="chevron-right" size={14} color={colors.accent} />
                    </TouchableOpacity>
                  </View>

                  <FlatList
                    data={items}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <ContentCard
                        id={item.id}
                        title={item.title}
                        type={item.type}
                        duration={item.duration}
                        image={item.image}
                        liked={item.liked}
                        onPress={() => navigation.navigate('ArticleScreen', { item })}
                        onToggleLike={toggleFavorito}
                      />
                    )}
                  />
                </View>
              );
            })}

            <View style={{ height: spacing.xl }} />
          </ScrollView>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
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
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  searchResults: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  searchResultsTitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptySearchText: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: fontSizes.sm,
    color: colors.accent,
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  errorText: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});