import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, Pressable, Dimensions,
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

const COLORS = {
  background: '#F7F7F7',
  text: '#404040',
  accent: '#D38A58',
  white: '#FFFFFF',
  muted: '#A0A0A0',
  lightMuted: '#E8E8E8',
  cream: '#FDF8F5',
  red: '#E25C5C',
  redLight: '#FDF0F0',
  accentLight: '#FCF3ED',
  overlay: 'rgba(64, 64, 64, 0.5)',
};

const { width } = Dimensions.get('window');

type Props = {
  navigation?: any;
};

function CustomModal({
  visible,
  title,
  message,
  buttons,
  onClose,
}: {
  visible: boolean;
  title: string;
  message?: string;
  buttons: { text: string; style?: 'default' | 'destructive' | 'cancel'; onPress?: () => void }[];
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>{title}</Text>
          {message && <Text style={styles.modalMessage}>{message}</Text>}
          <View style={styles.modalButtons}>
            {buttons.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalBtn,
                  btn.style === 'destructive' && styles.modalBtnDestructive,
                  btn.style === 'cancel' && styles.modalBtnCancel,
                ]}
                onPress={() => {
                  onClose();
                  btn.onPress?.();
                }}
              >
                <Text
                  style={[
                    styles.modalBtnText,
                    btn.style === 'destructive' && styles.modalBtnTextDestructive,
                    btn.style === 'cancel' && styles.modalBtnTextCancel,
                  ]}
                >
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

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
  post, onPress, onPressAuthor, onReact, isModerador, onShowMenu,
}: {
  post: Post; onPress: () => void; onPressAuthor: () => void;
  onReact: () => void; isModerador: boolean; onShowMenu: () => void;
}) {
  const liked = post.mis_reacciones?.includes('LIKE') ?? false;

  return (
    <TouchableOpacity style={styles.postCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={onPressAuthor} activeOpacity={0.7}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{post.autor.nombre.charAt(0).toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.authorInfo}>
          <TouchableOpacity onPress={onPressAuthor} activeOpacity={0.7}>
            <Text style={styles.authorName}>{post.autor.nombre}</Text>
          </TouchableOpacity>
          <View style={styles.metaRow}>
            {post.comunidad_nombre && (
              <>
                <Text style={styles.communityName}>{post.comunidad_nombre}</Text>
                <View style={styles.dot} />
              </>
            )}
            <Text style={styles.timeText}>{timeAgo(post.created_at)}</Text>
          </View>
        </View>
        {(post.es_mio || isModerador) && (
          <TouchableOpacity 
            style={styles.menuBtn}
            onPress={onShowMenu} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="more-horizontal" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>
      
      {post.titulo && <Text style={styles.postTitle}>{post.titulo}</Text>}
      <Text style={styles.postContent}>{post.contenido}</Text>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionBtn, liked && styles.actionBtnLiked]} 
          onPress={onReact}
        >
          <Feather name="heart" size={18} color={liked ? COLORS.red : COLORS.muted} />
          <Text style={[styles.actionCount, liked && styles.actionCountLiked]}>
            {post.total_reacciones ?? 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
          <Feather name="message-circle" size={18} color={COLORS.muted} />
          <Text style={styles.actionCount}>{post.total_comentarios ?? 0}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.actionBtnShare}>
          <Feather name="share" size={18} color={COLORS.muted} />
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
  const [menuModal, setMenuModal] = useState<{ visible: boolean; postId: string; comunidadId: string }>({ visible: false, postId: '', comunidadId: '' });
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; postId: string; comunidadId: string }>({ visible: false, postId: '', comunidadId: '' });
  const [actionModal, setActionModal] = useState<{ visible: boolean; autor: any; comunidadId: string }>({ visible: false, autor: null, comunidadId: '' });
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

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

  const confirmDeletePost = async () => {
    const { postId, comunidadId } = deleteModal;
    const post = allPosts.find(p => p.id === postId);
    const isModerador = communities.find((c: any) => c.id === comunidadId)?.es_moderador === true;

    try {
      await deletePost(comunidadId, postId);
      setAllPosts(prev => prev.filter(p => p.id !== postId));
      if (post && !post.es_mio && isModerador) {
        setActionModal({ visible: true, autor: post.autor, comunidadId });
      }
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo eliminar el post.') });
    }
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
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconBtn, !hasCommunities && styles.iconBtnDisabled]}
            onPress={() => hasCommunities && navigation.navigate('CreatePost', { communities })}
            disabled={!hasCommunities}
          >
            <Feather name="plus" size={22} color={hasCommunities ? COLORS.text : COLORS.lightMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('MyCommunities', { communities })}
          >
            <Feather name="users" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('SocialProfile', { isOwn: true })}
          >
            <Feather name="user" size={18} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Feather name="settings" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(true); }}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
          />
        }
      >
        <TouchableOpacity
          style={styles.forumCard}
          onPress={() => navigation.navigate('DailyForum', { communities: forumCommunities })}
          activeOpacity={0.8}
        >
          <View style={styles.forumIcon}>
            <Feather name="message-square" size={20} color={COLORS.white} />
          </View>
          <View style={styles.forumTextContent}>
            <View style={styles.forumLabelRow}>
              <Text style={styles.forumLabel}>Foro del dia</Text>
              <View style={styles.forumBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.forumBadgeText}>Activo</Text>
              </View>
            </View>
            <Text style={styles.forumQuestion} numberOfLines={1}>
              {dailyForum?.pregunta || 'No hay foro activo hoy'}
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.accent} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Publicaciones</Text>
          {allPosts.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{allPosts.length}</Text>
            </View>
          )}
        </View>

        {!hasCommunities ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Feather name="users" size={32} color={COLORS.accent} />
            </View>
            <Text style={styles.emptyTitle}>Sin comunidades</Text>
            <Text style={styles.emptyText}>
              Unete a una comunidad para ver publicaciones de otros miembros.
            </Text>
            <TouchableOpacity 
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('MyCommunities', { communities })}
            >
              <Text style={styles.emptyBtnText}>Explorar comunidades</Text>
            </TouchableOpacity>
          </View>
        ) : allPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Feather name="edit-3" size={32} color={COLORS.accent} />
            </View>
            <Text style={styles.emptyTitle}>Sin publicaciones</Text>
            <Text style={styles.emptyText}>
              Se el primero en compartir algo con tu comunidad.
            </Text>
            <TouchableOpacity 
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('CreatePost', { communities })}
            >
              <Text style={styles.emptyBtnText}>Crear publicacion</Text>
            </TouchableOpacity>
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
              onShowMenu={() => setMenuModal({ visible: true, postId: post.id, comunidadId: post.comunidad_id })}
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <CustomModal
        visible={menuModal.visible}
        title="Opciones"
        buttons={[
          { text: 'Eliminar', style: 'destructive', onPress: () => setDeleteModal({ visible: true, postId: menuModal.postId, comunidadId: menuModal.comunidadId }) },
          { text: 'Cancelar', style: 'cancel' },
        ]}
        onClose={() => setMenuModal({ visible: false, postId: '', comunidadId: '' })}
      />

      <CustomModal
        visible={deleteModal.visible}
        title="Eliminar post"
        message="¿Estas seguro de que deseas eliminar este post?"
        buttons={[
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: confirmDeletePost },
        ]}
        onClose={() => setDeleteModal({ visible: false, postId: '', comunidadId: '' })}
      />

      <CustomModal
        visible={actionModal.visible}
        title="Tomar acciones"
        message={`¿Deseas tomar acciones sobre ${actionModal.autor?.nombre}?`}
        buttons={[
          { text: 'No', style: 'cancel' },
          {
            text: 'Si',
            onPress: () => {
              setModTarget(actionModal.autor);
              setModCommunityId(actionModal.comunidadId);
              setModModalVisible(true);
            },
          },
        ]}
        onClose={() => setActionModal({ visible: false, autor: null, comunidadId: '' })}
      />

      <CustomModal
        visible={errorModal.visible}
        title="Error"
        message={errorModal.message}
        buttons={[{ text: 'Aceptar', style: 'default' }]}
        onClose={() => setErrorModal({ visible: false, message: '' })}
      />

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
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: COLORS.white,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: COLORS.text },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: COLORS.background },
  iconBtnDisabled: { opacity: 0.5 },
  profileBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  forumCard: {
    backgroundColor: COLORS.text, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24,
  },
  forumIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  forumTextContent: { flex: 1, gap: 4 },
  forumLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  forumLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  forumBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50' },
  forumBadgeText: { fontSize: 11, fontWeight: '600', color: COLORS.white },
  forumQuestion: { fontSize: 15, color: COLORS.white, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  badge: { backgroundColor: COLORS.lightMuted, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  postCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 18, marginBottom: 14 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  communityName: { fontSize: 13, color: COLORS.muted },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.muted, marginHorizontal: 6 },
  timeText: { fontSize: 13, color: COLORS.muted },
  menuBtn: { padding: 4 },
  postTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 8, lineHeight: 22 },
  postContent: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: 16 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  actionBtnLiked: { backgroundColor: COLORS.redLight },
  actionCount: { fontSize: 14, color: COLORS.muted, fontWeight: '500' },
  actionCountLiked: { color: COLORS.red },
  actionBtnShare: { padding: 8 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 25 },
  emptyBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center', padding: 32 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 24, padding: 24, width: '100%', maxWidth: 320 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  modalMessage: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalButtons: { gap: 10 },
  modalBtn: { backgroundColor: COLORS.accent, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  modalBtnDestructive: { backgroundColor: COLORS.red },
  modalBtnCancel: { backgroundColor: COLORS.background },
  modalBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
  modalBtnTextDestructive: { color: COLORS.white },
  modalBtnTextCancel: { color: COLORS.text },
});