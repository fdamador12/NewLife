import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Modal, Pressable,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { apiError } from '../../../utils/apiError';
import {
  getComments, createComment, deletePost, deleteComment, deleteReply,
  reactToPost, likeComment, replyToComment, likeCommentReply,
} from '../../../services/communityService';
import { communityCache, CK, TTL } from '../../../services/communityCache';
import ModerationActionsModal from '../components/ModerationActionsModal';
import { Avatar } from '../components/Avatar';
import { ExpandableImage } from '../components/ExpandableImage';

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
  autor: { id: string; nombre: string; avatar_url?: string | null };
  total_likes: number;
  yo_di_like: boolean;
};

type CommentData = {
  id: string;
  contenido: string;
  created_at: string;
  es_mio: boolean;
  autor: { id: string; nombre: string; avatar_url?: string | null };
  total_likes: number;
  yo_di_like: boolean;
  respuestas: ReplyData[];
};

type ReplyingTo = { commentId: string; authorName: string } | null;

function ReplyItem({
  reply, esModerador, onLike, onDelete, onPressAuthor,
}: {
  reply: ReplyData; esModerador: boolean;
  onLike: () => void; onDelete: () => void; onPressAuthor: () => void;
}) {
  const [menuVisible, setMenuVisible] = useState(false);
  return (
    <>
      <View style={styles.replyItem}>
        <View style={styles.replyHeader}>
          <Avatar url={reply.autor.avatar_url} name={reply.autor.nombre} size={28} onPress={onPressAuthor} />
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
        <TouchableOpacity style={[styles.replyLikeBtn, reply.yo_di_like && styles.replyLikeBtnLiked]} onPress={onLike}>
          <Feather name="heart" size={14} color={reply.yo_di_like ? COLORS.red : COLORS.muted} />
          {reply.total_likes > 0 && (
            <Text style={[styles.replyLikeCount, reply.yo_di_like && styles.replyLikeCountLiked]}>{reply.total_likes}</Text>
          )}
        </TouchableOpacity>
      </View>
      <CustomModal
        visible={menuVisible} title="Opciones"
        buttons={[{ text: 'Eliminar', style: 'destructive', onPress: onDelete }, { text: 'Cancelar', style: 'cancel' }]}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
}

function CommentCard({
  comment, canComment, esModerador, onLike, onDelete, onReplyTrigger,
  onPressAuthor, onLikeReply, onDeleteReply,
}: {
  comment: CommentData; canComment: boolean; esModerador: boolean;
  onLike: () => void; onDelete: () => void;
  onReplyTrigger: (commentId: string, authorName: string) => void;
  onPressAuthor: (autor: { id: string; nombre: string }) => void;
  onLikeReply: (commentId: string, replyId: string) => void;
  onDeleteReply: (commentId: string, reply: ReplyData) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  return (
    <>
      <View style={styles.commentCard}>
        <View style={styles.commentHeader}>
          <Avatar url={comment.autor.avatar_url} name={comment.autor.nombre} size={40} onPress={() => onPressAuthor(comment.autor)} />
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
          <TouchableOpacity style={[styles.actionBtn, comment.yo_di_like && styles.actionBtnLiked]} onPress={onLike}>
            <Feather name="heart" size={16} color={comment.yo_di_like ? COLORS.red : COLORS.muted} />
            {comment.total_likes > 0 && (
              <Text style={[styles.actionCount, comment.yo_di_like && styles.actionCountLiked]}>{comment.total_likes}</Text>
            )}
          </TouchableOpacity>
          {canComment && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => onReplyTrigger(comment.id, comment.autor.nombre)}>
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
        {showReplies && comment.respuestas.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.respuestas.map((reply) => (
              <ReplyItem key={reply.id} reply={reply} esModerador={esModerador}
                onLike={() => onLikeReply(comment.id, reply.id)}
                onDelete={() => onDeleteReply(comment.id, reply)}
                onPressAuthor={() => onPressAuthor(reply.autor)}
              />
            ))}
          </View>
        )}
      </View>
      <CustomModal
        visible={menuVisible} title="Opciones"
        buttons={[{ text: 'Eliminar', style: 'destructive', onPress: onDelete }, { text: 'Cancelar', style: 'cancel' }]}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
}

export default function PostDetailScreen({ navigation, route }: any) {
  const { post, community, communityId: paramCommunityId } = route.params;
  const communityId: string = post.comunidad_id ?? paramCommunityId ?? community?.id;
  const canComment = community?.tipo_acceso !== 'SOLO_VER';
  const esModerador = community?.es_moderador === true;
  const insets = useSafeAreaInsets();

  const commentsKey = CK.comments(communityId, post.id);
  const [comments, setComments] = useState<CommentData[]>(() => communityCache.peek<CommentData[]>(commentsKey) ?? []);
  const [loading, setLoading] = useState(!communityCache.peek(commentsKey));
  const [refreshing, setRefreshing] = useState(false);
  const [postLiked, setPostLiked] = useState<boolean>(post.mis_reacciones?.includes('LIKE') ?? false);
  const [totalReacciones, setTotalReacciones] = useState<number>(post.total_reacciones ?? 0);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyingTo>(null);
  const inputRef = useRef<TextInput>(null);
  const [modTarget, setModTarget] = useState<{ id: string; nombre: string } | null>(null);
  const [modModalVisible, setModModalVisible] = useState(false);
  const [postMenuVisible, setPostMenuVisible] = useState(false);
  const [deletePostModal, setDeletePostModal] = useState(false);
  const [deleteCommentModal, setDeleteCommentModal] = useState<{ visible: boolean; comment: CommentData | null }>({ visible: false, comment: null });
  const [deleteReplyModal, setDeleteReplyModal] = useState<{ visible: boolean; commentId: string; reply: ReplyData | null }>({ visible: false, commentId: '', reply: null });
  const [actionModal, setActionModal] = useState<{ visible: boolean; user: any }>({ visible: false, user: null });
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const fetchComments = useCallback(async (force = false) => {
    if (!force) {
      const fresh = communityCache.get<CommentData[]>(commentsKey, TTL.comments);
      if (fresh) { setComments(fresh); setLoading(false); setRefreshing(false); return; }
    }
    try {
      const data = await getComments(communityId, post.id, force);
      setComments(data);
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'Error al cargar comentarios.') });
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [communityId, post.id, commentsKey]);

  useFocusEffect(useCallback(() => { fetchComments(); }, [fetchComments]));

  const handleReact = async () => {
    try {
      const result = await reactToPost(communityId, post.id, 'LIKE');
      setPostLiked(result.accion === 'added');
      if (typeof result.total === 'number') setTotalReacciones(result.total);
      else setTotalReacciones(prev => result.accion === 'added' ? prev + 1 : Math.max(0, prev - 1));
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo reaccionar.') });
    }
  };

  const handleSend = async () => {
    if (!commentText.trim()) return;
    setSending(true);
    try {
      if (replyingTo) await replyToComment(communityId, post.id, replyingTo.commentId, commentText.trim());
      else await createComment(communityId, post.id, commentText.trim());
      setCommentText(''); setReplyingTo(null);
      await fetchComments(true);
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo enviar.') });
    } finally { setSending(false); }
  };

  const handleReplyTrigger = (commentId: string, authorName: string) => {
    setReplyingTo({ commentId, authorName });
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCancelReply = () => { setReplyingTo(null); setCommentText(''); };
  const handleLikeComment = async (commentId: string) => {
    try { await likeComment(communityId, post.id, commentId); await fetchComments(true); } catch { }
  };
  const handleLikeReply = async (commentId: string, replyId: string) => {
    try { await likeCommentReply(communityId, post.id, commentId, replyId); await fetchComments(true); } catch { }
  };
  const handleDeleteCommentTrigger = (comment: CommentData) => setDeleteCommentModal({ visible: true, comment });
  const handleDeleteReplyTrigger = (commentId: string, reply: ReplyData) => setDeleteReplyModal({ visible: true, commentId, reply });

  const confirmDeletePost = async () => {
    try {
      await deletePost(communityId, post.id);
      if (!post.es_mio && esModerador) setActionModal({ visible: true, user: post.autor });
      else navigation.goBack();
    } catch (err: any) { setErrorModal({ visible: true, message: apiError(err, 'No se pudo eliminar.') }); }
  };
  const confirmDeleteComment = async () => {
    const comment = deleteCommentModal.comment;
    if (!comment) return;
    try {
      await deleteComment(communityId, post.id, comment.id);
      await fetchComments(true);
      if (!comment.es_mio && esModerador) setActionModal({ visible: true, user: comment.autor });
    } catch (err: any) { setErrorModal({ visible: true, message: apiError(err, 'No se pudo eliminar.') }); }
  };
  const confirmDeleteReply = async () => {
    const { commentId, reply } = deleteReplyModal;
    if (!reply) return;
    try {
      await deleteReply(communityId, post.id, commentId, reply.id);
      await fetchComments(true);
      if (!reply.es_mio && esModerador) setActionModal({ visible: true, user: reply.autor });
    } catch (err: any) { setErrorModal({ visible: true, message: apiError(err, 'No se pudo eliminar.') }); }
  };

  const handlePressCommentAuthor = (autor: { id: string; nombre: string }) => {
    navigation.navigate('UserProfile', { isOwn: false, robleId: autor.id, name: autor.nombre });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0;
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 0);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Publicación</Text>
            <View style={{ width: 44 }} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchComments(true); }} colors={[COLORS.accent]} tintColor={COLORS.accent} />
          }
        >
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <Avatar
                url={post.autor?.avatar_url}
                name={post.autor?.nombre || 'Usuario'}
                size={48}
                onPress={() => post.autor && navigation.navigate('UserProfile', {
                  isOwn: false, robleId: post.autor.id, name: post.autor.nombre,
                })}
              />
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
            {post.imagen_url ? (
              <View style={{ marginBottom: 16 }}>
                <ExpandableImage uri={post.imagen_url} />
              </View>
            ) : null}

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
                {canComment ? 'Sé el primero en comentar' : 'Aun no hay comentarios en este post'}
              </Text>
            </View>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment.id} comment={comment} canComment={canComment} esModerador={esModerador}
                onLike={() => handleLikeComment(comment.id)}
                onDelete={() => handleDeleteCommentTrigger(comment)}
                onReplyTrigger={handleReplyTrigger}
                onPressAuthor={handlePressCommentAuthor}
                onLikeReply={handleLikeReply}
                onDeleteReply={handleDeleteReplyTrigger}
              />
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {canComment && (
          <View style={[styles.inputContainer, { paddingBottom: safeBottom }]}>
            {replyingTo && (
              <View style={styles.replyingBanner}>
                <Feather name="corner-down-right" size={14} color={COLORS.accent} />
                <Text style={styles.replyingText}>
                  Respondiendo a <Text style={styles.replyingName}>@{replyingTo.authorName}</Text>
                </Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={handleCancelReply} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="x" size={16} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.commentInputBar}>
              <TextInput
                ref={inputRef}
                style={styles.commentInput}
                placeholder={replyingTo ? `Responde a ${replyingTo.authorName}...` : 'Escribe un comentario...'}
                placeholderTextColor={COLORS.muted}
                value={commentText} onChangeText={setCommentText}
                multiline={false} returnKeyType="send" onSubmitEditing={handleSend}
              />
              <TouchableOpacity
                style={[styles.commentSendBtn, (!commentText.trim() || sending) && styles.sendBtnDisabled]}
                onPress={handleSend} disabled={!commentText.trim() || sending}
              >
                {sending ? <ActivityIndicator size="small" color={COLORS.white} /> : <Feather name="send" size={18} color={COLORS.white} />}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <CustomModal visible={postMenuVisible} title="Opciones"
        buttons={[{ text: 'Eliminar', style: 'destructive', onPress: () => setDeletePostModal(true) }, { text: 'Cancelar', style: 'cancel' }]}
        onClose={() => setPostMenuVisible(false)} />
      <CustomModal visible={deletePostModal} title="Eliminar post" message="¿Estás seguro?"
        buttons={[{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: confirmDeletePost }]}
        onClose={() => setDeletePostModal(false)} />
      <CustomModal visible={deleteCommentModal.visible} title="Eliminar comentario" message="¿Estás seguro?"
        buttons={[{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: confirmDeleteComment }]}
        onClose={() => setDeleteCommentModal({ visible: false, comment: null })} />
      <CustomModal visible={deleteReplyModal.visible} title="Eliminar respuesta" message="¿Estás seguro?"
        buttons={[{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: confirmDeleteReply }]}
        onClose={() => setDeleteReplyModal({ visible: false, commentId: '', reply: null })} />
      <CustomModal visible={actionModal.visible} title="Tomar acciones"
        message={`¿Deseas tomar acciones sobre ${actionModal.user?.nombre}?`}
        buttons={[
          { text: 'No', style: 'cancel', onPress: () => !deletePostModal && navigation.goBack() },
          { text: 'Si', onPress: () => { setModTarget(actionModal.user); setModModalVisible(true); } },
        ]}
        onClose={() => setActionModal({ visible: false, user: null })} />
      <CustomModal visible={errorModal.visible} title="Error" message={errorModal.message}
        buttons={[{ text: 'Aceptar', style: 'default' }]}
        onClose={() => setErrorModal({ visible: false, message: '' })} />
      <ModerationActionsModal visible={modModalVisible} communityId={communityId} targetUser={modTarget}
        onClose={() => { setModModalVisible(false); setModTarget(null); navigation.goBack(); }} />
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
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  communityName: { fontSize: 13, color: COLORS.accent, fontWeight: '500' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.muted, marginHorizontal: 6 },
  timeText: { fontSize: 13, color: COLORS.muted },
  menuBtn: { padding: 4 },
  postTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginBottom: 8, lineHeight: 24 },
  postContent: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: 12 },
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
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  commentAuthorInfo: { flex: 1 },
  commentAuthor: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  commentTime: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
  commentContent: { fontSize: 14, color: COLORS.text, lineHeight: 20, marginBottom: 12 },
  commentActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  repliesContainer: { marginTop: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: COLORS.lightMuted },
  replyItem: { paddingVertical: 10 },
  replyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  replyAuthorInfo: { flex: 1 },
  replyAuthor: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  replyTime: { fontSize: 11, color: COLORS.muted },
  replyContent: { fontSize: 13, color: COLORS.text, lineHeight: 18, marginBottom: 6 },
  replyLikeBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: COLORS.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  replyLikeBtnLiked: { backgroundColor: COLORS.redLight },
  replyLikeCount: { fontSize: 12, color: COLORS.muted, fontWeight: '500' },
  replyLikeCountLiked: { color: COLORS.red },
  inputContainer: { backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.lightMuted },
  replyingBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.lightMuted },
  replyingText: { fontSize: 13, color: COLORS.muted },
  replyingName: { color: COLORS.accent, fontWeight: '600' },
  commentInputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  commentInput: { flex: 1, backgroundColor: COLORS.background, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12, fontSize: 15, color: COLORS.text },
  commentSendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
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