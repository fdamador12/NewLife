import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import { useToast } from '../../../../feedback/ToastContext';

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
  videoUrl?: string;
  autorFoto?: string;
}

export default function ArticleScreen({ navigation, route }: any) {
  const item: ContentItem = route.params?.item;
  const { showToast } = useToast();

  if (!item) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Contenido no disponible</Text>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mira este contenido: ${item.title}`,
      });
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };

  const handleOpenVideo = () => {
    if (!item.videoUrl) {
      showToast('No hay video disponible', 'info');
      return;
    }

    Linking.openURL(item.videoUrl).catch((err) => {
      showToast('No se pudo abrir el video', 'error');
      console.log('Error abriendo video:', err);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {item.type === 'article' ? 'Artículo' : 'Video'}
          </Text>
          <Text style={styles.headerSubtitle}>{item.duration}</Text>
        </View>
        <TouchableOpacity onPress={handleShare} style={styles.headerAction}>
          <Feather name="share" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: item.image }} style={styles.heroImage} resizeMode="cover" />

        {item.type === 'video' && item.videoUrl && (
          <View style={styles.videoContainer}>
            <TouchableOpacity style={styles.openVideoButton} onPress={handleOpenVideo}>
              <Feather name="play" size={20} color={colors.white} />
              <Text style={styles.openVideoText}>Ver video completo</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.category}</Text>
          </View>
          <View style={styles.metaStats}>
            <Feather name="heart" size={14} color={colors.textMuted} />
            <Text style={styles.metaStat}>—</Text>
            <Feather name="share" size={14} color={colors.textMuted} />
            <Text style={styles.metaStat}>—</Text>
          </View>
        </View>

        {item.author && (
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              {item.autorFoto ? (
                <Image source={{ uri: item.autorFoto }} style={styles.authorImage} />
              ) : (
                <Feather name="user" size={20} color={colors.textMuted} />
              )}
            </View>
            <View>
              <Text style={styles.authorName}>{item.author}</Text>
              <Text style={styles.authorRole}>{item.authorRole}</Text>
            </View>
          </View>
        )}

        {item.body ? (
          item.body.split('\n\n').map((paragraph: string, i: number) => (
            <Text key={i} style={styles.body}>{paragraph}</Text>
          ))
        ) : (
          <Text style={styles.body}>
            {item.type === 'video'
              ? 'Este video explora el tema de ' + item.title.toLowerCase() + '.'
              : 'Contenido no disponible'}
          </Text>
        )}

        {item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.map((tag: string) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  headerSubtitle: { fontSize: fontSizes.sm, color: colors.textMuted },
  headerAction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingBottom: spacing.xl },
  heroImage: { width: '100%', height: 220 },
  videoContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  openVideoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
  },
  openVideoText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.white,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 28,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  tagText: { fontSize: fontSizes.xs, color: colors.text, fontWeight: '600' },
  metaStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaStat: { fontSize: fontSizes.sm, color: colors.textMuted },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  authorImage: { width: 44, height: 44 },
  authorName: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text },
  authorRole: { fontSize: fontSizes.sm, color: colors.textMuted },
  body: {
    fontSize: fontSizes.md,
    color: colors.textLight,
    lineHeight: 26,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  tagChip: {
    backgroundColor: '#F0F0F0',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  tagChipText: { fontSize: fontSizes.xs, color: colors.textMuted },
  errorText: { fontSize: fontSizes.md, color: colors.textMuted },
});