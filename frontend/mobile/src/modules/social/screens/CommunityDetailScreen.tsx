import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { getPosts, getDailyForum, deletePost, reactToPost } from '../../../services/communityService';
import { communityCache, CK, TTL } from '../../../services/communityCache';
import { apiError } from '../../../utils/apiError';
import ModerationActionsModal from '../components/ModerationActionsModal';

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
  overlay: 'rgba(64, 64, 64, 0.5)',
};

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

function CustomModal({
  visible, title, message, buttons, onClose,
}: {
  visible: boolean; title: string; message?: string;
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
                style={[styles.modalBtn, btn.style === 'destructive' && styles.modalBtnDestructive, btn.style === 'cancel' && styles.modalBtnCancel]}
                onPress={() => { onClose(); btn.onPress?.(); }}
              >
                <Text style={[styles.modalBtnText, btn.style === 'destructive' && styles.modalBtnTextDestructive, btn.style === 'cancel' && styles.modalBtnTextCancel]}>
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

function PostCard({ post, onPress, onPressAuthor, onShowMenu, onReact, esModerador }: {
  post: Post; onPress: () => void; onPressAuthor: () => void;
  onShowMenu: () => void; onReact: () => void; esModerador: boolean;
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
          <Text style={styles.timeText}>{timeAgo(post.created_at)}</Text>
        </View>
        {(post.es_mio || esModerador) && (
          <TouchableOpacity style={styles.menuBtn} onPress={onShowMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="more-horizontal" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>

      {post.titulo && <Text style={styles.postTitle}>{post.titulo}</Text>}
      {post.contenido && <Text style={styles.postContent}>{post.contenido}</Text>}

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, liked && styles.actionBtnLiked]} onPress={onReact}>
          <Feather name="heart" size={18} color={liked ? COLORS.red : COLORS.muted} />
          <Text style={[styles.actionCount, liked && styles.actionCountLiked]}>{post.total_reacciones ?? 0}</Text>
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

export default function CommunityDetailScreen({ navigation, route }: any) {
  const { community } = route.params;
  const communityName = community.nombre || community.name || '';

  const [posts, setPosts] = useState<Post[]>(() => communityCache.peek<Post[]>(CK.posts(community.id)) ?? []);
  const [dailyForum, setDailyForum] = useState<any>(() => communityCache.peek<any>(CK.dailyForum)?.foro ?? null);
  const [loading, setLoading] = useState(!communityCache.peek(CK.posts(community.id)));
  const [refreshing, setRefreshing] = useState(false);
  const [modTarget, setModTarget] = useState<{ id: string; nombre: string } | null>(null);
  const [modModalVisible, setModModalVisible] = useState(false);
  const [menuModal, setMenuModal] = useState<{ visible: boolean; postId: string }>({ visible: false, postId: '' });
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; postId: string }>({ visible: false, postId: '' });
  const [actionModal, setActionModal] = useState<{ visible: boolean; autor: any }>({ visible: false, autor: null });
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const fetchData = useCallback(async (force = false) => {
    if (!force) {
      const freshPosts = communityCache.get<Post[]>(CK.posts(community.id), TTL.posts);
      const freshForum = communityCache.get<any>(CK.dailyForum, TTL.dailyForum);
      if (freshPosts && freshForum) {
        setPosts(freshPosts);
        setDailyForum(freshForum.foro || null);
        setLoading(false);
        setRefreshing(false);
        return;
      }
    }
    try {
      const [postsData, forumsData] = await Promise.all([
        getPosts(community.id, force),
        getDailyForum(force).catch(() => null),
      ]);
      setPosts(postsData);
      setDailyForum(forumsData?.foro || null);
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'Error al cargar la comunidad.') });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [community.id]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleReact = async (postId: string) => {
    try {
      const result = await reactToPost(community.id, postId, 'LIKE');
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const liked = result.accion === 'added';
        return {
          ...p,
          total_reacciones: result.total ?? (liked ? p.total_reacciones + 1 : Math.max(0, p.total_reacciones - 1)),
          mis_reacciones: liked ? [...(p.mis_reacciones || []), 'LIKE'] : (p.mis_reacciones || []).filter((r: string) => r !== 'LIKE'),
        };
      }));
    } catch {}
  };

  const confirmDeletePost = async () => {
    const { postId } = deleteModal;
    const post = posts.find(p => p.id === postId);
    const isModerador = community.es_moderador === true;
    try {
      await deletePost(community.id, postId);
      await fetchData(true);
      if (post && !post.es_mio && isModerador) {
        setActionModal({ visible: true, autor: post.autor });
      }
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo eliminar.') });
    }
  };

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
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            {community.es_moderador === true && (
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('CommunityModeration', { community })}>
                <Feather name="settings" size={20} color={COLORS.text} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('CommunityChat', { community })}>
              <Feather name="message-circle" size={20} color={COLORS.text} />
            </TouchableOpacity>
            {community.tipo_acceso !== 'SOLO_VER' && (
              <TouchableOpacity style={styles.iconBtnAccent} onPress={() => navigation.navigate('CreatePostCommunity', { community })}>
                <Feather name="plus" size={20} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.headerTitle}>{communityName}</Text>
        {community.descripcion && (
          <Text style={styles.headerDescription} numberOfLines={2}>{community.descripcion}</Text>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(true); }} colors={[COLORS.accent]} tintColor={COLORS.accent} />}
      >
        <TouchableOpacity
          style={styles.forumCard}
          onPress={() => dailyForum && navigation.navigate('DailyForum', { communities: [community], fixedCommunity: community, initialForum: dailyForum })}
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
            <Text style={styles.forumQuestion} numberOfLines={1}>{dailyForum?.pregunta || 'No hay foro activo hoy'}</Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.accent} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Publicaciones</Text>
          {posts.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{posts.length}</Text>
            </View>
          )}
        </View>

        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Feather name="edit-3" size={32} color={COLORS.accent} />
            </View>
            <Text style={styles.emptyTitle}>Sin publicaciones</Text>
            <Text style={styles.emptyText}>Se el primero en compartir algo con la comunidad.</Text>
            {community.tipo_acceso !== 'SOLO_VER' && (
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('CreatePostCommunity', { community })}>
                <Text style={styles.emptyBtnText}>Crear publicacion</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              esModerador={community.es_moderador === true}
              onPress={() => navigation.navigate('PostDetail', { post, communityId: community.id, community })}
              onPressAuthor={() => navigation.navigate('UserProfile', { isOwn: false, robleId: post.autor.id, name: post.autor.nombre })}
              onShowMenu={() => setMenuModal({ visible: true, postId: post.id })}
              onReact={() => handleReact(post.id)}
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <CustomModal
        visible={menuModal.visible}
        title="Opciones"
        buttons={[
          { text: 'Eliminar', style: 'destructive', onPress: () => setDeleteModal({ visible: true, postId: menuModal.postId }) },
          { text: 'Cancelar', style: 'cancel' },
        ]}
        onClose={() => setMenuModal({ visible: false, postId: '' })}
      />

      <CustomModal
        visible={deleteModal.visible}
        title="Eliminar post"
        message="¿Estas seguro de que deseas eliminar este post?"
        buttons={[
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: confirmDeletePost },
        ]}
        onClose={() => setDeleteModal({ visible: false, postId: '' })}
      />

      <CustomModal
        visible={actionModal.visible}
        title="Tomar acciones"
        message={`¿Deseas tomar acciones sobre ${actionModal.autor?.nombre}?`}
        buttons={[
          { text: 'No', style: 'cancel' },
          { text: 'Si', onPress: () => { setModTarget(actionModal.autor); setModModalVisible(true); } },
        ]}
        onClose={() => setActionModal({ visible: false, autor: null })}
      />

      <CustomModal
        visible={errorModal.visible}
        title="Error"
        message={errorModal.message}
        buttons={[{ text: 'Aceptar', style: 'default' }]}
        onClose={() => setErrorModal({ visible: false, message: '' })}
      />

      <ModerationActionsModal visible={modModalVisible} communityId={community.id} targetUser={modTarget} onClose={() => { setModModalVisible(false); setModTarget(null); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: COLORS.white },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: COLORS.background },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  headerDescription: { fontSize: 14, color: COLORS.muted, lineHeight: 20 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: COLORS.background },
  iconBtnAccent: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: COLORS.accent },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  forumCard: { backgroundColor: COLORS.text, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
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