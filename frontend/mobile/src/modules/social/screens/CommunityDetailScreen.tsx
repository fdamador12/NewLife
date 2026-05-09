import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { getPosts, getDailyForum, deletePost, reactToPost } from '../../../services/communityService';

type Post = {
  id: string;
  titulo?: string;
  autor: { id: string; nombre: string };
  comunidad_id: string;
  created_at: string;
  contenido: string;
  total_comentarios: number;
  total_reacciones: number;
  mis_reacciones: string[];
  es_mio: boolean;
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return 'Ahora';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
function PostCard({ post, onPress, onPressAuthor, onDelete, onReact, esModerador }: {
  post: Post;
  onPress: () => void;
  onPressAuthor: () => void;
  onDelete: () => void;
  onReact: () => void;
  esModerador: boolean;
}) {
  const liked = post.mis_reacciones?.includes('LIKE') ?? false;
  return (
    <TouchableOpacity style={styles.postCard} onPress={onPress} activeOpacity={0.9}>
      <TouchableOpacity style={styles.postHeader} onPress={onPressAuthor} activeOpacity={0.7}>
        <View style={styles.postAvatar}>
          <Feather name="user" size={18} color={colors.textMuted} />
        </View>
        <Text style={styles.postAuthor}>{post.autor.nombre}</Text>
        <Text style={styles.postTime}>{timeAgo(post.created_at)}</Text>
        {(post.es_mio || esModerador) && (
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="trash-2" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {post.titulo ? <Text style={styles.postTitle}>{post.titulo}</Text> : null}
      {post.contenido ? <Text style={styles.postBody}>{post.contenido}</Text> : null}

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postAction} onPress={onReact}>
          <Feather name="heart" size={18} color={liked ? '#FF6B6B' : colors.textMuted} />
          <Text style={[styles.postActionText, liked && { color: '#FF6B6B' }]}>
            {post.total_reacciones ?? 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postAction} onPress={onPress}>
          <Feather name="message-circle" size={18} color={colors.textMuted} />
          <Text style={styles.postActionText}>{post.total_comentarios ?? 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.postAction, { marginLeft: 'auto' }]}>
          <Feather name="share" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function CommunityDetailScreen({ navigation, route }: any) {
  const { community } = route.params;
  const communityName = community.nombre || community.name || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [dailyForum, setDailyForum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [postsData, forumsData] = await Promise.all([
        getPosts(community.id),
        getDailyForum().catch(() => null),
      ]);
      setPosts(postsData);
      setDailyForum(forumsData?.foro || null);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Error al cargar la comunidad.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [community.id]);

  useFocusEffect(
    useCallback(() => { fetchData(); }, [fetchData])
  );

  const handleReact = async (postId: string) => {
    try {
      const result = await reactToPost(community.id, postId, 'LIKE');
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const liked = result.accion === 'added';
        return {
          ...p,
          total_reacciones: result.total ?? (liked ? p.total_reacciones + 1 : Math.max(0, p.total_reacciones - 1)),
          mis_reacciones: liked
            ? [...(p.mis_reacciones || []), 'LIKE']
            : (p.mis_reacciones || []).filter((r: string) => r !== 'LIKE'),
        };
      }));
    } catch {}
  };

  const handleDelete = (postId: string) => {
    Alert.alert('Eliminar post', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(community.id, postId);
            await fetchData();
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'No se pudo eliminar.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{communityName}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('CommunityChat', { community })}
          >
            <Feather name="more-horizontal" size={22} color={colors.text} />
          </TouchableOpacity>
          {community.tipo_acceso !== 'SOLO_VER' && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('CreatePostCommunity', { community })}
            >
              <Feather name="plus" size={22} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            colors={[colors.primary]}
          />
        }
      >
        {/* Foro del día */}
        <TouchableOpacity
          style={styles.forumCard}
          onPress={() => dailyForum && navigation.navigate('DailyForum', {
            communities: [community],
            initialForum: dailyForum,
          })}
          activeOpacity={0.9}
        >
          <Text style={styles.forumEmoji}>✏️</Text>
          <View style={styles.forumContent}>
            <Text style={styles.forumTitle}>Foro del día</Text>
            <Text style={styles.forumQuestion}>
              {dailyForum?.pregunta || 'No hay foro activo hoy'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Posts */}
        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="edit-3" size={40} color={colors.border} />
            <Text style={styles.emptyTitle}>Sin posts aún</Text>
            <Text style={styles.emptySubtitle}>Sé el primero en publicar algo.</Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              esModerador={community.es_moderador === true}
              onPress={() => navigation.navigate('PostDetail', {
                post,
                communityId: community.id,
                community,
              })}
              onPressAuthor={() => navigation.navigate('UserProfile', {
                isOwn: false,
                robleId: post.autor.id,
                name: post.autor.nombre,
              })}
              onDelete={() => handleDelete(post.id)}
              onReact={() => handleReact(post.id)}
            />
          ))
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },

  header: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingTop: 60, 
    paddingHorizontal: spacing.xl, 
    paddingBottom: spacing.lg,
  },

  headerTitle: { 
    fontSize: fontSizes.xxl, 
    fontWeight: '800', 
    color: colors.text 
  },

  headerActions: { 
    flexDirection: 'row', 
    gap: spacing.sm 
  },

  headerButton: { 
    width: 36, 
    height: 36, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },

  scroll: { 
    paddingHorizontal: spacing.xl, 
    gap: spacing.md, 
    paddingBottom: spacing.xl 
  },

  forumCard: {
    backgroundColor: colors.white, 
    borderRadius: borderRadius.md, 
    padding: spacing.lg,
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.md, 
    elevation: 2,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 4,
  },

  forumEmoji: { 
    fontSize: 32 
  },

  forumContent: { 
    flex: 1 
  },

  forumTitle: { 
    fontSize: fontSizes.md, 
    fontWeight: '700', 
    color: colors.text, 
    marginBottom: 4 
  },

  forumQuestion: { 
    fontSize: fontSizes.sm, 
    color: colors.textMuted, 
    lineHeight: 18 
  },

  postCard: {
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

  postHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.sm 
  },

  postAvatar: {
    width: 40, 
    height: 40, 
    borderRadius: 20,
    backgroundColor: '#F0F0F0', 
    alignItems: 'center', 
    justifyContent: 'center',
  },

  postAuthor: { 
    flex: 1, 
    fontSize: fontSizes.sm, 
    fontWeight: '700', 
    color: colors.text 
  },

  postTime: { 
    fontSize: fontSizes.xs, 
    color: colors.textMuted 
  },

  postTitle: { 
    fontSize: fontSizes.md, 
    fontWeight: '700', 
    color: colors.text, 
    lineHeight: 22 
  },

  postBody: { 
    fontSize: fontSizes.sm, 
    color: colors.textLight, 
    lineHeight: 20 
  },

  postActions: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.lg, 
    marginTop: spacing.xs,
  },

  postAction: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.xs 
  },

  postActionText: { 
    fontSize: fontSizes.sm, 
    color: colors.textMuted 
  },

  emptyState: {
    alignItems: 'center', 
    paddingTop: spacing.xl * 2, 
    gap: spacing.md, 
    paddingHorizontal: spacing.xl,
  },

  emptyTitle: { 
    fontSize: fontSizes.lg, 
    fontWeight: '700', 
    color: colors.text 
  },

  emptySubtitle: { 
    fontSize: fontSizes.md, 
    color: colors.textMuted, 
    textAlign: 'center' 
  },
});