import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import ContentCard from './components/ContentCard';
import { useContent } from '../../hooks/useContent';
import { analytics, EVENT_TYPES } from '../../../../services/analytics';

export default function FavoritesScreen({ navigation }: any) {
  const { favoritos, loading, error, toggleFavorito } = useContent();
  const [search, setSearch] = useState('');

  // Analytics: trackear vista de la lista de favoritos.
  // Esta pantalla solo se accede desde ContentScreen (icono de corazon en el header).
  useEffect(() => {
    analytics.track(EVENT_TYPES.FAVORITES_LIST_VIEWED);
  }, []);

  const filtered = search.trim()
    ? favoritos.filter(
        (f) =>
          f.title.toLowerCase().includes(search.toLowerCase()) ||
          f.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : favoritos;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Favoritos</Text>
          <Text style={styles.headerSubtitle}>Contenido que te gustó</Text>
        </View>
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

      {/* Content */}
      {loading ? (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="heart" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                {favoritos.length === 0
                  ? 'Aún no tienes favoritos'
                  : 'No hay resultados'}
              </Text>
              <Text style={styles.emptySubtext}>
                {favoritos.length === 0
                  ? 'Guarda contenido que te interese'
                  : 'Intenta con otra búsqueda'}
              </Text>
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
      )}
    </View>
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
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  headerSubtitle: { fontSize: fontSizes.sm, color: colors.textMuted },
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
  searchInput: { flex: 1, fontSize: fontSizes.md, color: colors.text },
  scroll: { paddingHorizontal: spacing.xl, gap: spacing.md },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: { fontSize: fontSizes.md, color: colors.textMuted, marginTop: spacing.md },
  emptySubtext: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});