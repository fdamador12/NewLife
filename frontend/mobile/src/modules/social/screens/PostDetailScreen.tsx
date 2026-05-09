import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert,
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
  reply,
  communityId,
  postId,
  commentId,
  esModerador,
  onRefresh,
  onDelete,
}: {
  reply: ReplyData;
  communityId: string;
  postId: string;
  commentId: string;
  esModerador: boolean;
  onRefresh: () => void;
  onDelete: () => void;
}) {
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      await likeCommentReply(communityId, postId, commentId, reply.id);
      onRefresh();
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo dar like.'));
    } finally {
      setLiking(false);
    }
  };

  const showMenu = () => {
    Alert.alert('Opciones', undefined, [
      { text: 'Eliminar', style: 'destructive', onPress: onDelete },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.replyItem}>
      <View style={styles.replyHeader}>
        <View style={styles.replyAvatar}>
          <Feather name="user" size={10} color={colors.textMuted} />
        </View>
        <Text style={styles.replyAuthor}>{reply.autor.nombre}</Text>
        <Text style={styles.replyTime}>{timeAgo(reply.created_at)}</Text>
        {(reply.es_mio || esModerador) && (
          <TouchableOpacity onPress={showMenu} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="more-horizontal" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.replyContent}>{reply.contenido}</Text>
      <TouchableOpacity style={styles.replyLike} onPress={handleLike} disabled={liking}>
        <Feather
          name="heart"
          size={14}
          color={reply.yo_di_like ? '#FF6B6B' : colors.textMuted}
        />
        {reply.total_likes > 0 && (
          <Text style={[styles.replyLikeCount, reply.yo_di_like && styles.likedText]}>
            {reply.total_likes}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function CommentCard({
  comment,
  communityId,
  postId,
  canComment,
  esModerador,
  onRefresh,
  onDelete,
  onModerationNeeded,
}: {
  comment: CommentData;
  communityId: string;
  postId: string;
  canComment: boolean;
  esModerador: boolean;
  onRefresh: () => void;
  onDelete: () => void;
  onModerationNeeded: (user: { id: string; nombre: string }) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      await likeComment(communityId, postId, comment.id);
      onRefresh();
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo dar like.'));
    } finally {
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
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo enviar la respuesta.'));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteReply = (reply: ReplyData) => {
    Alert.alert('Eliminar respuesta', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await deleteReply(communityId, postId, comment.id, reply.id);
            onRefresh();
            if (!reply.es_mio && esModerador) {
              onModerationNeeded(reply.autor);
            }
          } catch (err: any) {
            Alert.alert('Error', apiError(err, 'No se pudo eliminar.'));
          }
        },
      },
    ]);
  };

  const showCommentMenu = () => {
    Alert.alert('Opciones', undefined, [
      { text: 'Eliminar', style: 'destructive', onPress: onDelete },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.commentCard}>
      {/* Header */}
      <View style={styles.commentHeader}>
        <View style={styles.commentAvatar}>
          <Feather name="user" size={14} color={colors.textMuted} />
        </View>
        <View style={styles.commentAuthorInfo}>
          <Text style={styles.commentAuthor}>{comment.autor.nombre}</Text>
        </View>
        <Text style={styles.commentTime}>{timeAgo(comment.created_at)}</Text>
        {(comment.es_mio || esModerador) && (
          <TouchableOpacity onPress={showCommentMenu} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="more-horizontal" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Contenido */}
      <Text style={styles.commentContent}>{comment.contenido}</Text>

      {/* Acciones */}
      <View style={styles.commentActions}>
        <TouchableOpacity style={styles.commentAction} onPress={handleLike} disabled={liking}>
          <Feather
            name="heart"
            size={15}
            color={comment.yo_di_like ? '#FF6B6B' : colors.textMuted}
          />
          {comment.total_likes > 0 && (
            <Text style={[styles.commentActionText, comment.yo_di_like && styles.likedText]}>
              {comment.total_likes}
            </Text>
          )}
        </TouchableOpacity>

        {canComment && (
          <TouchableOpacity
            style={styles.commentAction}
            onPress={() => setShowReplyInput(!showReplyInput)}
          >
            <Feather name="corner-down-right" size={15} color={colors.textMuted} />
            <Text style={styles.commentActionText}>Responder</Text>
          </TouchableOpacity>
        )}

        {comment.respuestas.length > 0 && (
          <TouchableOpacity
            style={styles.commentAction}
            onPress={() => setShowReplies(!showReplies)}
          >
            <Feather
              name={showReplies ? 'chevron-up' : 'chevron-down'}
              size={15}
              color={colors.textMuted}
            />
            <Text style={styles.commentActionText}>
              {showReplies
                ? 'Ocultar'
                : `${comment.respuestas.length} respuesta${comment.respuestas.length !== 1 ? 's' : ''}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Input de respuesta inline */}
      {showReplyInput && (
        <View style={styles.replyInputRow}>
          <TextInput
            style={styles.replyInput}
            placeholder="Escribe una respuesta..."
            placeholderTextColor={colors.textMuted}
            value={replyText}
            onChangeText={setReplyText}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.replySendBtn, (!replyText.trim() || sending) && styles.sendDisabled]}
            onPress={handleReply}
            disabled={!replyText.trim() || sending}
          >
            {sending
              ? <ActivityIndicator size="small" color={colors.white} />
              : <Feather name="send" size={13} color={colors.white} />
            }
          </TouchableOpacity>
        </View>
      )}

      {/* Respuestas */}
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
              onDelete={() => handleDeleteReply(reply)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function PostDetailScreen({ navigation, route }: any) {
  const { post, community, communityId: paramCommunityId } = route.params;
  const communityId: string = post.comunidad_id ?? paramCommunityId ?? community?.id;
  const canComment = community?.tipo_acceso !== 'SOLO_VER';
  const esModerador = community?.es_moderador === true;

  const commentsKey = CK.comments(communityId, post.id);
  const [comments, setComments] = useState<CommentData[]>(
    () => communityCache.peek<CommentData[]>(commentsKey) ?? [],
  );
  const [loading, setLoading] = useState(!communityCache.peek(commentsKey));
  const [refreshing, setRefreshing] = useState(false);
  const [postLiked, setPostLiked] = useState<boolean>(
    post.mis_reacciones?.includes('LIKE') ?? false,
  );
  const [totalReacciones, setTotalReacciones] = useState<number>(post.total_reacciones ?? 0);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [modTarget, setModTarget] = useState<{ id: string; nombre: string } | null>(null);
  const [modModalVisible, setModModalVisible] = useState(false);

  const promptModeration = (user: { id: string; nombre: string }) => {
    Alert.alert(
      '¿Tomar acciones?',
      `¿Deseas tomar acciones sobre ${user.nombre}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí', onPress: () => { setModTarget(user); setModModalVisible(true); } },
      ],
    );
  };

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
      Alert.alert('Error', apiError(err, 'Error al cargar comentarios.'));
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
      Alert.alert('Error', apiError(err, 'No se pudo reaccionar.'));
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
      Alert.alert('Error', apiError(err, 'No se pudo comentar.'));
    } finally {
      setSending(false);
    }
  };

  const handleDeletePost = () => {
    Alert.alert('Eliminar post', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(communityId, post.id);
            if (!post.es_mio && esModerador) {
              Alert.alert(
                '¿Tomar acciones?',
                `¿Deseas tomar acciones sobre ${post.autor?.nombre}?`,
                [
                  { text: 'No', style: 'cancel', onPress: () => navigation.goBack() },
                  { text: 'Sí', onPress: () => { setModTarget(post.autor); setModModalVisible(true); } },
                ],
              );
            } else {
              navigation.goBack();
            }
          } catch (err: any) {
            Alert.alert('Error', apiError(err, 'No se pudo eliminar.'));
          }
        },
      },
    ]);
  };

  const showPostMenu = () => {
    Alert.alert('Opciones', undefined, [
      { text: 'Eliminar', style: 'destructive', onPress: handleDeletePost },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleDeleteComment = (comment: CommentData) => {
    Alert.alert('Eliminar comentario', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await deleteComment(communityId, post.id, comment.id);
            await fetchComments(true);
            if (!comment.es_mio && esModerador) {
              promptModeration(comment.autor);
            }
          } catch (err: any) {
            Alert.alert('Error', apiError(err, 'No se pudo eliminar.'));
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchComments(true); }}
              colors={[colors.primary]}
            />
          }
        >
          {/* Card del post */}
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postAvatar}>
                <Feather name="user" size={18} color={colors.textMuted} />
              </View>
              <View style={styles.postAuthorInfo}>
                <Text style={styles.postAuthor}>{post.autor?.nombre || 'Usuario'}</Text>
                {(community?.nombre || post.comunidad_nombre) && (
                  <Text style={styles.postCommunity}>
                    {community?.nombre || post.comunidad_nombre}
                  </Text>
                )}
              </View>
              <Text style={styles.postTime}>{timeAgo(post.created_at)}</Text>
              {(post.es_mio || esModerador) && (
                <TouchableOpacity onPress={showPostMenu} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="more-horizontal" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {post.titulo ? <Text style={styles.postTitle}>{post.titulo}</Text> : null}
            <Text style={styles.postBody}>{post.contenido}</Text>

            <View style={styles.postActions}>
              <TouchableOpacity style={styles.postAction} onPress={handleReact}>
                <Feather
                  name="heart"
                  size={18}
                  color={postLiked ? '#FF6B6B' : colors.textMuted}
                />
                <Text style={[styles.postActionText, postLiked && styles.likedText]}>
                  {totalReacciones}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.postAction}>
                <Feather name="message-circle" size={18} color={colors.textMuted} />
                <Text style={styles.postActionText}>{comments.length}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.postAction, { marginLeft: 'auto' }]}>
                <Feather name="share" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sección de comentarios */}
          <Text style={styles.sectionTitle}>
            {comments.length} comentario{comments.length !== 1 ? 's' : ''}
          </Text>

          {comments.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="message-circle" size={36} color={colors.border} />
              <Text style={styles.emptyText}>
                {canComment ? 'Sé el primero en comentar' : 'Sin comentarios aún'}
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
                onDelete={() => handleDeleteComment(comment)}
                onModerationNeeded={promptModeration}
              />
            ))
          )}

          <View style={{ height: spacing.xl }} />
        </ScrollView>

        {/* Input de comentario fijo en el fondo */}
        {canComment && (
          <View style={styles.commentInputBar}>
            <TextInput
              style={styles.commentInput}
              placeholder="Escribe un comentario..."
              placeholderTextColor={colors.textMuted}
              value={commentText}
              onChangeText={setCommentText}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={handleComment}
            />
            <TouchableOpacity
              style={[styles.commentSendBtn, (!commentText.trim() || sending) && styles.sendDisabled]}
              onPress={handleComment}
              disabled={!commentText.trim() || sending}
            >
              {sending
                ? <ActivityIndicator size="small" color={colors.white} />
                : <Feather name="send" size={16} color={colors.white} />
              }
            </TouchableOpacity>
          </View>
        )}
      </View>

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
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg,
  },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },

  scroll: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.xl },

  // Post card
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

  sectionTitle: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.md },
  emptyText: { fontSize: fontSizes.md, color: colors.textMuted },

  // Comment card
  commentCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.lg,
    gap: spacing.sm, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  commentAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center',
  },
  commentAuthorInfo: { flex: 1 },
  commentAuthor: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text },
  commentTime: { fontSize: fontSizes.xs, color: colors.textMuted },
  commentContent: { fontSize: fontSizes.sm, color: colors.textLight, lineHeight: 20 },
  commentActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  commentAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  commentActionText: { fontSize: fontSizes.xs, color: colors.textMuted },

  // Reply input
  replyInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs,
  },
  replyInput: {
    flex: 1, backgroundColor: colors.background, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: fontSizes.sm, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
  },
  replySendBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },

  // Replies list
  repliesContainer: { gap: spacing.sm, marginTop: spacing.xs },
  replyItem: {
    backgroundColor: colors.background, borderRadius: borderRadius.sm, padding: spacing.md,
    gap: 4, borderLeftWidth: 2, borderLeftColor: colors.border,
  },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  replyAvatar: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center',
  },
  replyAuthor: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.text, flex: 1 },
  replyTime: { fontSize: 10, color: colors.textMuted },
  replyContent: { fontSize: fontSizes.xs, color: colors.textLight, lineHeight: 16 },
  replyLike: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  replyLikeCount: { fontSize: 11, color: colors.textMuted },

  likedText: { color: '#FF6B6B' },

  // Comment input bar (bottom fixed)
  commentInputBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  commentInput: {
    flex: 1, backgroundColor: colors.background, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: fontSizes.sm, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
  },
  commentSendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
});
