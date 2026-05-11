import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Modal, Pressable,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { apiError } from '../../../utils/apiError';
import {
  getComments,
  createComment,
  deletePost,
  deleteComment,
  deleteReply,
  reactToPost,
  likeComment,
  replyToComment,
  likeCommentReply,
} from '../../../services/communityService';
import { communityCache, CK, TTL } from '../../../services/communityCache';
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

type ReplyData = {
  id: string;
  contenido: string;
  created_at: string;
  es_mio: boolean;
  autor: { id: string; nombre: string };
  total_likes: number;
  yo_di_like: boolean;
};

type CommentData = {
  id: string;
  contenido: string;
  created_at: string;
  es_mio: boolean;
  autor: { id: string; nombre: string };
  total_likes: number;
  yo_di_like: boolean;
  respuestas: ReplyData[];
};

function ReplyItem({
  reply, communityId, postId, commentId, esModerador, onRefresh, onDelete,
}: {
  reply: ReplyData; communityId: string; postId: string; commentId: string;
  esModerador: boolean; onRefresh: () => void; onDelete: () => void;
}) {
  const [liking, setLiking] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      await likeCommentReply(communityId, postId, commentId, reply.id);
      onRefresh();
    } catch {} finally {
      setLiking(false);
    }
  };

  return (
    <>
      <View style={styles.replyItem}>
        <View style={styles.replyHeader}>
          <View style={styles.replyAvatar}>
            <Text style={styles.replyAvatarText}>{reply.autor.nombre.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.replyAuthorInfo}>
            <Text style={styles.replyAuthor}>{reply.autor.nombre}</Text>
            <Text style={styles.replyTime}>{timeAgo(reply.created_at)}</Text>
          </View>
          {(reply.es_mio || esModerador) && (
            <TouchableOpacity onPress={() => setMenuVisible(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="more-horizontal" size={16} color={COLORS.muted} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.replyContent}>{reply.contenido}</Text>
        <TouchableOpacity style={[styles.replyLikeBtn, reply.yo_di_like && styles.replyLikeBtnLiked]} onPress={handleLike} disabled={liking}>
          <Feather name="heart" size={14} color={reply.yo_di_like ? COLORS.red : COLORS.muted} />
          {reply.total_likes > 0 && (
            <Text style={[styles.replyLikeCount, reply.yo_di_like && styles.replyLikeCountLiked]}>{reply.total_likes}</Text>
          )}
        </TouchableOpacity>
      </View>
      <CustomModal
        visible={menuVisible}
        title="Opciones"
        buttons={[
          { text: 'Eliminar', style: 'destructive', onPress: onDelete },
          { text: 'Cancelar', style: 'cancel' },
        ]}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
}

function CommentCard({
  comment, communityId, postId, canComment, esModerador, onRefresh, onDelete, onModerationNeeded,
}: {
  comment: CommentData; communityId: string; postId: string; canComment: boolean;
  esModerador: boolean; onRefresh: () => void; onDelete: () => void;
  onModerationNeeded: (user: { id: string; nombre: string }) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [liking, setLiking] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteReplyModal, setDeleteReplyModal] = useState<{ visible: boolean; reply: ReplyData | null }>({ visible: false, reply: null });

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      await likeComment(communityId, postId, comment.id);
      onRefresh();
    } catch {} finally {
      setLiking(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await replyToComment(communityId, postId, comment.id, replyText.trim());
      setReplyText('');
      setShowReplyInput(false);
      setShowReplies(true);
      onRefresh();
    } catch {} finally {
      setSending(false);
    }
  };

  const confirmDeleteReply = async () => {
    const reply = deleteReplyModal.reply;
    if (!reply) return;
    try {
      await deleteReply(communityId, postId, comment.id, reply.id);
      onRefresh();
      if (!reply.es_mio && esModerador) {
        onModerationNeeded(reply.autor);
      }
    } catch {}
  };

  return (
    <>
      <View style={styles.commentCard}>
        <View style={styles.commentHeader}>
          <View style={styles.commentAvatar}>
            <Text style={styles.commentAvatarText}>{comment.autor.nombre.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.commentAuthorInfo}>
            <Text style={styles.commentAuthor}>{comment.autor.nombre}</Text>
            <Text style={styles.commentTime}>{timeAgo(comment.created_at)}</Text>
          </View>
          {(comment.es_mio || esModerador) && (
            <TouchableOpacity onPress={() => setMenuVisible(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="more-horizontal" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.commentContent}>{comment.contenido}</Text>

        <View style={styles.commentActions}>
          <TouchableOpacity style={[styles.actionBtn, comment.yo_di_like && styles.actionBtnLiked]} onPress={handleLike} disabled={liking}>
            <Feather name="heart" size={16} color={comment.yo_di_like ? COLORS.red : COLORS.muted} />
            {comment.total_likes > 0 && (
              <Text style={[styles.actionCount, comment.yo_di_like && styles.actionCountLiked]}>{comment.total_likes}</Text>
            )}
          </TouchableOpacity>

          {canComment && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowReplyInput(!showReplyInput)}>
              <Feather name="corner-down-right" size={16} color={COLORS.muted} />
              <Text style={styles.actionCount}>Responder</Text>
            </TouchableOpacity>
          )}

          {comment.respuestas.length > 0 && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowReplies(!showReplies)}>
              <Feather name={showReplies ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.muted} />
              <Text style={styles.actionCount}>
                {showReplies ? 'Ocultar' : `${comment.respuestas.length} respuesta${comment.respuestas.length !== 1 ? 's' : ''}`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showReplyInput && (
          <View style={styles.replyInputRow}>
            <TextInput
              style={styles.replyInput}
              placeholder="Escribe una respuesta..."
              placeholderTextColor={COLORS.muted}
              value={replyText}
              onChangeText={setReplyText}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.replySendBtn, (!replyText.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleReply}
              disabled={!replyText.trim() || sending}
            >
              {sending ? <ActivityIndicator size="small" color={COLORS.white} /> : <Feather name="send" size={14} color={COLORS.white} />}
            </TouchableOpacity>
          </View>
        )}

        {showReplies && comment.respuestas.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.respuestas.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                communityId={communityId}
                postId={postId}
                commentId={comment.id}
                esModerador={esModerador}
                onRefresh={onRefresh}
                onDelete={() => setDeleteReplyModal({ visible: true, reply })}
              />
            ))}
          </View>
        )}
      </View>

      <CustomModal
        visible={menuVisible}
        title="Opciones"
        buttons={[
          { text: 'Eliminar', style: 'destructive', onPress: onDelete },
          { text: 'Cancelar', style: 'cancel' },
        ]}
        onClose={() => setMenuVisible(false)}
      />

      <CustomModal
        visible={deleteReplyModal.visible}
        title="Eliminar respuesta"
        message="¿Estas seguro de que deseas eliminar esta respuesta?"
        buttons={[
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: confirmDeleteReply },
        ]}
        onClose={() => setDeleteReplyModal({ visible: false, reply: null })}
      />
    </>
  );
}

export default function PostDetailScreen({ navigation, route }: any) {
  const { post, community, communityId: paramCommunityId } = route.params;
  const communityId: string = post.comunidad_id ?? paramCommunityId ?? community?.id;
  const canComment = community?.tipo_acceso !== 'SOLO_VER';
  const esModerador = community?.es_moderador === true;

  const commentsKey = CK.comments(communityId, post.id);
  const [comments, setComments] = useState<CommentData[]>(() => communityCache.peek<CommentData[]>(commentsKey) ?? []);
  const [loading, setLoading] = useState(!communityCache.peek(commentsKey));
  const [refreshing, setRefreshing] = useState(false);
  const [postLiked, setPostLiked] = useState<boolean>(post.mis_reacciones?.includes('LIKE') ?? false);
  const [totalReacciones, setTotalReacciones] = useState<number>(post.total_reacciones ?? 0);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [modTarget, setModTarget] = useState<{ id: string; nombre: string } | null>(null);
  const [modModalVisible, setModModalVisible] = useState(false);
  const [postMenuVisible, setPostMenuVisible] = useState(false);
  const [deletePostModal, setDeletePostModal] = useState(false);
  const [deleteCommentModal, setDeleteCommentModal] = useState<{ visible: boolean; comment: CommentData | null }>({ visible: false, comment: null });
  const [actionModal, setActionModal] = useState<{ visible: boolean; user: any }>({ visible: false, user: null });
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const fetchComments = useCallback(async (force = false) => {
    if (!force) {
      const fresh = communityCache.get<CommentData[]>(commentsKey, TTL.comments);
      if (fresh) {
        setComments(fresh);
        setLoading(false);
        setRefreshing(false);
        return;
      }
    }
    try {
      const data = await getComments(communityId, post.id, force);
      setComments(data);
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'Error al cargar comentarios.') });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [communityId, post.id, commentsKey]);

  useFocusEffect(useCallback(() => { fetchComments(); }, [fetchComments]));

  const handleReact = async () => {
    try {
      const result = await reactToPost(communityId, post.id, 'LIKE');
      setPostLiked(result.accion === 'added');
      if (typeof result.total === 'number') {
        setTotalReacciones(result.total);
      } else {
        setTotalReacciones(prev => result.accion === 'added' ? prev + 1 : Math.max(0, prev - 1));
      }
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo reaccionar.') });
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSending(true);
    try {
      await createComment(communityId, post.id, commentText.trim());
      setCommentText('');
      await fetchComments(true);
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo comentar.') });
    } finally {
      setSending(false);
    }
  };

  const confirmDeletePost = async () => {
    try {
      await deletePost(communityId, post.id);
      if (!post.es_mio && esModerador) {
        setActionModal({ visible: true, user: post.autor });
      } else {
        navigation.goBack();
      }
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo eliminar.') });
    }
  };

  const confirmDeleteComment = async () => {
    const comment = deleteCommentModal.comment;
    if (!comment) return;
    try {
      await deleteComment(communityId, post.id, comment.id);
      await fetchComments(true);
      if (!comment.es_mio && esModerador) {
        setActionModal({ visible: true, user: comment.autor });
      }
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo eliminar.') });
    }
  };

  const promptModeration = (user: { id: string; nombre: string }) => {
    setActionModal({ visible: true, user });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Publicacion</Text>
            <View style={{ width: 44 }} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchComments(true); }}
              colors={[COLORS.accent]}
              tintColor={COLORS.accent}
            />
          }
        >
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{post.autor?.nombre?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{post.autor?.nombre || 'Usuario'}</Text>
                <View style={styles.metaRow}>
                  {(community?.nombre || post.comunidad_nombre) && (
                    <>
                      <Text style={styles.communityName}>{community?.nombre || post.comunidad_nombre}</Text>
                      <View style={styles.dot} />
                    </>
                  )}
                  <Text style={styles.timeText}>{timeAgo(post.created_at)}</Text>
                </View>
              </View>
              {(post.es_mio || esModerador) && (
                <TouchableOpacity style={styles.menuBtn} onPress={() => setPostMenuVisible(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Feather name="more-horizontal" size={20} color={COLORS.muted} />
                </TouchableOpacity>
              )}
            </View>

            {post.titulo && <Text style={styles.postTitle}>{post.titulo}</Text>}
            <Text style={styles.postContent}>{post.contenido}</Text>

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionBtn, postLiked && styles.actionBtnLiked]} onPress={handleReact}>
                <Feather name="heart" size={18} color={postLiked ? COLORS.red : COLORS.muted} />
                <Text style={[styles.actionCount, postLiked && styles.actionCountLiked]}>{totalReacciones}</Text>
              </TouchableOpacity>
              <View style={styles.actionBtn}>
                <Feather name="message-circle" size={18} color={COLORS.muted} />
                <Text style={styles.actionCount}>{comments.length}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={styles.actionBtnShare}>
                <Feather name="share" size={18} color={COLORS.muted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Comentarios</Text>
            {comments.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{comments.length}</Text>
              </View>
            )}
          </View>

          {comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Feather name="message-circle" size={32} color={COLORS.accent} />
              </View>
              <Text style={styles.emptyTitle}>Sin comentarios</Text>
              <Text style={styles.emptyText}>
                {canComment ? 'Se el primero en comentar' : 'Aun no hay comentarios en este post'}
              </Text>
            </View>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                communityId={communityId}
                postId={post.id}
                canComment={canComment}
                esModerador={esModerador}
                onRefresh={fetchComments}
                onDelete={() => setDeleteCommentModal({ visible: true, comment })}
                onModerationNeeded={promptModeration}
              />
            ))
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {canComment && (
          <View style={styles.commentInputBar}>
            <TextInput
              style={styles.commentInput}
              placeholder="Escribe un comentario..."
              placeholderTextColor={COLORS.muted}
              value={commentText}
              onChangeText={setCommentText}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={handleComment}
            />
            <TouchableOpacity
              style={[styles.commentSendBtn, (!commentText.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleComment}
              disabled={!commentText.trim() || sending}
            >
              {sending ? <ActivityIndicator size="small" color={COLORS.white} /> : <Feather name="send" size={18} color={COLORS.white} />}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <CustomModal
        visible={postMenuVisible}
        title="Opciones"
        buttons={[
          { text: 'Eliminar', style: 'destructive', onPress: () => setDeletePostModal(true) },
          { text: 'Cancelar', style: 'cancel' },
        ]}
        onClose={() => setPostMenuVisible(false)}
      />

      <CustomModal
        visible={deletePostModal}
        title="Eliminar post"
        message="¿Estas seguro de que deseas eliminar este post?"
        buttons={[
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: confirmDeletePost },
        ]}
        onClose={() => setDeletePostModal(false)}
      />

      <CustomModal
        visible={deleteCommentModal.visible}
        title="Eliminar comentario"
        message="¿Estas seguro de que deseas eliminar este comentario?"
        buttons={[
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: confirmDeleteComment },
        ]}
        onClose={() => setDeleteCommentModal({ visible: false, comment: null })}
      />

      <CustomModal
        visible={actionModal.visible}
        title="Tomar acciones"
        message={`¿Deseas tomar acciones sobre ${actionModal.user?.nombre}?`}
        buttons={[
          { text: 'No', style: 'cancel', onPress: () => !deletePostModal && navigation.goBack() },
          { text: 'Si', onPress: () => { setModTarget(actionModal.user); setModModalVisible(true); } },
        ]}
        onClose={() => setActionModal({ visible: false, user: null })}
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
        communityId={communityId}
        targetUser={modTarget}
        onClose={() => { setModModalVisible(false); setModTarget(null); navigation.goBack(); }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: COLORS.white },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: COLORS.background },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  postCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 18, marginBottom: 24 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  communityName: { fontSize: 13, color: COLORS.accent, fontWeight: '500' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.muted, marginHorizontal: 6 },
  timeText: { fontSize: 13, color: COLORS.muted },
  menuBtn: { padding: 4 },
  postTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginBottom: 8, lineHeight: 24 },
  postContent: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: 16 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  actionBtnLiked: { backgroundColor: COLORS.redLight },
  actionCount: { fontSize: 14, color: COLORS.muted, fontWeight: '500' },
  actionCountLiked: { color: COLORS.red },
  actionBtnShare: { padding: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  badge: { backgroundColor: COLORS.lightMuted, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  emptyContainer: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22 },
  commentCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, marginBottom: 12 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  commentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  commentAvatarText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  commentAuthorInfo: { flex: 1 },
  commentAuthor: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  commentTime: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
  commentContent: { fontSize: 14, color: COLORS.text, lineHeight: 20, marginBottom: 12 },
  commentActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  replyInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  replyInput: { flex: 1, backgroundColor: COLORS.background, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: COLORS.text },
  replySendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  repliesContainer: { marginTop: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: COLORS.lightMuted },
  replyItem: { paddingVertical: 10 },
  replyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  replyAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.lightMuted, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  replyAvatarText: { fontSize: 12, fontWeight: '600', color: COLORS.muted },
  replyAuthorInfo: { flex: 1 },
  replyAuthor: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  replyTime: { fontSize: 11, color: COLORS.muted },
  replyContent: { fontSize: 13, color: COLORS.text, lineHeight: 18, marginBottom: 6 },
  replyLikeBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: COLORS.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  replyLikeBtnLiked: { backgroundColor: COLORS.redLight },
  replyLikeCount: { fontSize: 12, color: COLORS.muted, fontWeight: '500' },
  replyLikeCountLiked: { color: COLORS.red },
  commentInputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 32, backgroundColor: COLORS.white, gap: 12, borderTopWidth: 1, borderTopColor: COLORS.lightMuted },
  commentInput: { flex: 1, backgroundColor: COLORS.background, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12, fontSize: 15, color: COLORS.text },
  commentSendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
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