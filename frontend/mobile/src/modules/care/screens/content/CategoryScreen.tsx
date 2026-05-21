import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import ContentCard from './components/ContentCard';
import { useContent } from '../../hooks/useContent';

interface ContentItem {
  id: string;
  title: string;
  type: 'article' | 'video';
  category: string;
  duration: string;
  image: string;
  liked: boolean;
  tags: string[];
  author?: string;
  authorRole?: string;
  body?: string;
}

export default function CategoryScreen({ navigation, route }: any) {
  const { category, items } = route.params;
  const { toggleFavorito } = useContent();
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? items.filter(
        (c: ContentItem) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : items;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{category}</Text>
          <Text style={styles.headerSubtitle}>
            {category === 'Relaciones'
              ? 'Para parejas y vínculos'
              : category === 'Apoyo'
              ? 'Herramientas para ti'
              : category === 'Motivación'
              ? 'Sigue adelante'
              : category === 'Más leído'
              ? 'Lo más popular'
              : 'Contenido relacionado'}
          </Text>
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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No hay contenido disponible</Text>
          </View>
        ) : (
          filtered.map((item: ContentItem) => (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
});