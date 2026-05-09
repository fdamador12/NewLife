import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { getMyCommunities, getPosts, getDailyForum, reactToPost, deletePost } from '../../../services/communityService';
import { communityCache, CK, TTL } from '../../../services/communityCache';
import { apiError } from '../../../utils/apiError';
import ModerationActionsModal from '../components/ModerationActionsModal';

type Post = {
  id: string;
  titulo?: string;
  autor: { id: string; nombre: string };
  comunidad_id: string;
  comunidad_nombre?: string;
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

function PostCard({
  post, onPress, onPressAuthor, onReact, isModerador, onDelete,
}: {
  post: Post; onPress: () => void; onPressAuthor: () => void;
  onReact: () => void; isModerador: boolean; onDelete: () => void;
}) {
  const liked = post.mis_reacciones?.includes('LIKE') ?? false;

  const showMenu = () => {
    Alert.alert('Opciones', undefined, [
      { text: 'Eliminar', style: 'destructive', onPress: onDelete },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <TouchableOpacity style={styles.postCard} onPress={onPress} activeOpacity={0.9}>
      <TouchableOpacity style={styles.postHeader} onPress={onPressAuthor} activeOpacity={0.7}>
        <View style={styles.postAvatar}>
          <Feather name="user" size={18} color={colors.textMuted} />
        </View>
        <View style={styles.postAuthorInfo}>
          <Text style={styles.postAuthor}>{post.autor.nombre}</Text>
          {post.comunidad_nombre && (
            <Text style={styles.postCommunity}>Comunidad: {post.comunidad_nombre}</Text>
          )}
        </View>
        <Text style={styles.postTime}>{timeAgo(post.created_at)}</Text>
        {(post.es_mio || isModerador) && (
          <TouchableOpacity onPress={showMenu} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="more-horizontal" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {post.titulo ? <Text style={styles.postTitle}>{post.titulo}</Text> : null}
      <Text style={styles.postBody}>{post.contenido}</Text>
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

type SocialFeedCache = {
  communities: any[];
  allPosts: Post[];
  dailyForum: any;
  forumCommunities: any[];
};

export default function SocialScreen({ navigation }: any) {
  const cachedFeed = communityCache.peek<SocialFeedCache>(CK.socialFeed);
  const [communities, setCommunities] = useState<any[]>(cachedFeed?.communities ?? []);
  const [allPosts, setAllPosts] = useState<Post[]>(cachedFeed?.allPosts ?? []);
  const [dailyForum, setDailyForum] = useState<any>(cachedFeed?.dailyForum ?? null);
  const [forumCommunities, setForumCommunities] = useState<any[]>(cachedFeed?.forumCommunities ?? []);
  const [loading, setLoading] = useState(!cachedFeed);
  const [refreshing, setRefreshing] = useState(false);
  const [modTarget, setModTarget] = useState<{ id: string; nombre: string } | null>(null);
  const [modCommunityId, setModCommunityId] = useState('');
  const [modModalVisible, setModModalVisible] = useState(false);

  const fetchData = useCallback(async (force = false) => {
    if (!force) {
      const fresh = communityCache.get<SocialFeedCache>(CK.socialFeed, TTL.socialFeed);
      if (fresh) {
        setCommunities(fresh.communities);
        setAllPosts(fresh.allPosts);
        setDailyForum(fresh.dailyForum);
        setForumCommunities(fresh.forumCommunities);
        setLoading(false);
        setRefreshing(false);
        return;
      }
    }

    try {
      const comms = await getMyCommunities(force);
      setCommunities(comms);

      if (comms.length === 0) {
        setAllPosts([]);
        communityCache.set(CK.socialFeed, { communities: comms, allPosts: [], dailyForum: null, forumCommunities: [] });
        return;
      }

      const [postsResults, dailyForumData] = await Promise.all([
        Promise.all(
          comms.map((c: any) =>
            getPosts(c.id, force)
              .then((posts: Post[]) => posts.map(p => ({ ...p, comunidad_nombre: c.nombre, comunidad_id: p.comunidad_id ?? c.id })))
              .catch(() => [])
          )
        ),
        getDailyForum(force).catch(() => ({ foro: null, comunidades: [] })),
      ]);

      const flatPosts = postsResults
        .flat()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAllPosts(flatPosts);
      setDailyForum(dailyForumData.foro || null);
      setForumCommunities(dailyForumData.comunidades || []);

      communityCache.set(CK.socialFeed, {
        communities: comms,
        allPosts: flatPosts,
        dailyForum: dailyForumData.foro || null,
        forumCommunities: dailyForumData.comunidades || [],
      });
    } catch (err) {
      console.log('Error cargando feed social:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleDeletePost = async (postId: string, comunidadId: string) => {
    const post = allPosts.find(p => p.id === postId);
    const isModerador = communities.find((c: any) => c.id === comunidadId)?.es_moderador === true;
    Alert.alert('Eliminar post', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(comunidadId, postId);
            setAllPosts(prev => prev.filter(p => p.id !== postId));
            if (post && !post.es_mio && isModerador) {
              Alert.alert(
                '¿Tomar acciones?',
                `¿Deseas tomar acciones sobre ${post.autor.nombre}?`,
                [
                  { text: 'No', style: 'cancel' },
                  {
                    text: 'Sí',
                    onPress: () => {
                      setModTarget(post.autor);
                      setModCommunityId(comunidadId);
                      setModModalVisible(true);
                    },
                  },
                ],
              );
            }
          } catch (err: any) {
            Alert.alert('Error', apiError(err, 'No se pudo eliminar el post.'));
          }
        },
      },
    ]);
  };

  const handleReact = async (postId: string, comunidadId: string) => {
    try {
      const result = await reactToPost(comunidadId, postId, 'LIKE');
      setAllPosts(prev => prev.map(p => {
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

  const hasCommunities = communities.length > 0;

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
        <Text style={styles.title}>Social</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, !hasCommunities && styles.headerButtonDisabled]}
            onPress={() => hasCommunities && navigation.navigate('CreatePost', { communities })}
            disabled={!hasCommunities}
          >
            <Feather name="plus" size={22} color={hasCommunities ? colors.text : colors.border} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('MyCommunities', { communities })}
          >
            <Feather name="users" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('SocialProfile', { isOwn: true })}
          >
            <View style={styles.profileAvatar}>
              <Feather name="user" size={18} color={colors.white} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Feather name="more-horizontal" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(true); }}
            colors={[colors.primary]}
          />
        }
      >
        {/* Foro del día — siempre lleva a la lista de foros */}
        <TouchableOpacity
          style={styles.forumCard}
          onPress={() => navigation.navigate('DailyForum', { communities: forumCommunities })}
          activeOpacity={0.9}
        >
          <Text style={styles.forumEmoji}>✏️</Text>
          <View style={styles.forumContent}>
            <Text style={styles.forumTitle}>Foro del día</Text>
            <Text style={styles.forumQuestion} numberOfLines={2}>
              {dailyForum?.pregunta || 'No hay foro activo hoy'}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Posts */}
        {!hasCommunities ? (
          <View style={styles.emptyState}>
            <Feather name="users" size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>Sin publicaciones</Text>
            <Text style={styles.emptySubtitle}>
              No perteneces a ninguna comunidad todavía.
            </Text>
          </View>
        ) : allPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="edit-3" size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>Sin posts aún</Text>
            <Text style={styles.emptySubtitle}>
              Sé el primero en publicar algo en tu comunidad.
            </Text>
          </View>
        ) : (
          allPosts.map((post) => (
            <PostCard
              key={`${post.comunidad_id}-${post.id}`}
              post={post}
              isModerador={communities.find((c: any) => c.id === post.comunidad_id)?.es_moderador === true}
              onPress={() => navigation.navigate('PostDetail', {
                post,
                communityId: post.comunidad_id,
                community: communities.find((c: any) => c.id === post.comunidad_id),
              })}
              onPressAuthor={() => navigation.navigate('UserProfile', {
                isOwn: false,
                robleId: post.autor.id,
                name: post.autor.nombre,
              })}
              onReact={() => handleReact(post.id, post.comunidad_id)}
              onDelete={() => handleDeletePost(post.id, post.comunidad_id)}
            />
          ))
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <ModerationActionsModal
        visible={modModalVisible}
        communityId={modCommunityId}
        targetUser={modTarget}
        onClose={() => { setModModalVisible(false); setModTarget(null); setModCommunityId(''); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg,
  },
  title: { fontSize: fontSizes.xxl, fontWeight: '800', color: colors.text },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerButtonDisabled: { opacity: 0.4 },
  profileButton: { marginLeft: spacing.xs },
  profileAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.md },
  forumCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  forumEmoji: { fontSize: 32 },
  forumContent: { flex: 1 },
  forumTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, marginBottom: 4 },
  forumQuestion: { fontSize: fontSizes.sm, color: colors.textMuted, lineHeight: 18 },
  postCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.lg,
    gap: spacing.sm, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  postAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center',
  },
  postAuthorInfo: { flex: 1 },
  postAuthor: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text },
  postCommunity: { fontSize: fontSizes.xs, color: colors.textMuted },
  postTime: { fontSize: fontSizes.xs, color: colors.textMuted },
  postTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, lineHeight: 22 },
  postBody: { fontSize: fontSizes.sm, color: colors.textLight, lineHeight: 20 },
  postActions: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.xs,
  },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  postActionText: { fontSize: fontSizes.sm, color: colors.textMuted },
  emptyState: {
    alignItems: 'center', paddingTop: spacing.xl * 2,
    gap: spacing.md, paddingHorizontal: spacing.xl,
  },
  emptyTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  emptySubtitle: { fontSize: fontSizes.md, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
});