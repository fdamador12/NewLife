import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { apiError } from '../../../utils/apiError';
import {
  getDailyForumDetail,
  replyDailyForum,
  likeForumReply,
  commentForumReply,
} from '../../../services/communityService';
import { communityCache, CK, TTL } from '../../../services/communityCache';

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

type Comment = {
  id: string;
  contenido: string;
  created_at: string;
  es_mio: boolean;
  autor: { id: string; nombre: string };
};

type Reply = {
  id: string;
  contenido: string;
  created_at: string;
  es_mio: boolean;
  autor: { id: string; nombre: string };
  total_likes: number;
  yo_di_like: boolean;
  comentarios: Comment[];
};

function ReplyCard({
  reply,
  foroId,
  communityId,
  canInteract,
  onRefresh,
}: {
  reply: Reply;
  foroId: string;
  communityId: string;
  canInteract: boolean;
  onRefresh: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment]     = useState('');
  const [sending, setSending]           = useState(false);
  const [liking, setLiking]             = useState(false);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      await likeForumReply(communityId, foroId, reply.id);
      onRefresh();
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo dar like.'));
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      await commentForumReply(communityId, foroId, reply.id, newComment.trim());
      setNewComment('');
      onRefresh();
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo comentar.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.replyCard}>
      {/* Header */}
      <View style={styles.replyHeader}>
        <View style={styles.replyAvatar}>
          <Feather name="user" size={14} color={colors.textMuted} />
        </View>
        <View style={styles.replyAuthorInfo}>
          <Text style={styles.replyAuthor}>{reply.autor.nombre}</Text>
        </View>
        <Text style={styles.replyTime}>{timeAgo(reply.created_at)}</Text>
      </View>

      {/* Contenido */}
      <Text style={styles.replyText}>{reply.contenido}</Text>

      {/* Acciones */}
      <View style={styles.replyActions}>
        {/* Like */}
        <TouchableOpacity style={styles.replyAction} onPress={handleLike} disabled={liking}>
          <Feather
            name="heart"
            size={16}
            color={reply.yo_di_like ? '#FF6B6B' : colors.textMuted}
          />
          <Text style={[styles.replyActionText, reply.yo_di_like && styles.likedText]}>
            {reply.total_likes}
          </Text>
        </TouchableOpacity>

        {/* Comentarios toggle */}
        <TouchableOpacity
          style={styles.replyAction}
          onPress={() => setShowComments(!showComments)}
        >
          <Feather name="message-circle" size={16} color={colors.textMuted} />
          <Text style={styles.replyActionText}>{reply.comentarios.length}</Text>
        </TouchableOpacity>
      </View>

      {/* Comentarios */}
      {showComments && (
        <View style={styles.commentsSection}>
          {reply.comentarios.length === 0 ? (
            <Text style={styles.noCommentsText}>Sin comentarios aún</Text>
          ) : (
            reply.comentarios.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAvatar}>
                    <Feather name="user" size={10} color={colors.textMuted} />
                  </View>
                  <Text style={styles.commentAuthor}>{comment.autor.nombre}</Text>
                  <Text style={styles.commentTime}>{timeAgo(comment.created_at)}</Text>
                </View>
                <Text style={styles.commentText}>{comment.contenido}</Text>
              </View>
            ))
          )}

          {/* Input comentario — solo si es hoy y puede interactuar */}
          {canInteract && (
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Añade un comentario..."
                placeholderTextColor={colors.textMuted}
                value={newComment}
                onChangeText={setNewComment}
                multiline={false}
              />
              <TouchableOpacity
                style={[styles.commentSendBtn, (!newComment.trim() || sending) && styles.sendDisabled]}
                onPress={handleComment}
                disabled={!newComment.trim() || sending}
              >
                {sending
                  ? <ActivityIndicator size="small" color={colors.white} />
                  : <Feather name="send" size={14} color={colors.white} />
                }
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default function DailyForumDetailScreen({ navigation, route }: any) {
  const { foro, community } = route.params;

  const forumKey = CK.forumDetail(community.id, foro.id);
  const [detail, setDetail]         = useState<any>(() => communityCache.peek<any>(forumKey));
  const [loading, setLoading]       = useState(!communityCache.peek(forumKey));
  const [refreshing, setRefreshing] = useState(false);
  const [reflection, setReflection] = useState('');
  const [sending, setSending]     = useState(false);

  const fetchDetail = useCallback(async (force = false) => {
    if (!force) {
      const fresh = communityCache.get<any>(forumKey, TTL.forumDetail);
      if (fresh) {
        setDetail(fresh);
        setLoading(false);
        setRefreshing(false);
        return;
      }
    }
    try {
      const data = await getDailyForumDetail(community.id, foro.id, force);
      setDetail(data);
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'Error al cargar el foro.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [community?.id, foro.id, forumKey]);

  useFocusEffect(useCallback(() => { fetchDetail(); }, [fetchDetail]));

  const handleSend = async () => {
    if (!reflection.trim()) return;
    setSending(true);
    try {
      await replyDailyForum(community.id, foro.id, reflection.trim());
      setReflection('');
      await fetchDetail(true);
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo enviar la respuesta.'));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const replies: Reply[]  = detail?.respuestas || [];
  const puedeResponder    = detail?.puede_responder === true;
  const esHoy             = detail?.foro?.es_hoy === true;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Foro del día</Text>
          <Text style={styles.headerSubtitle}>{community.nombre}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchDetail(true); }}
            colors={[colors.primary]}
          />
        }
      >
        {/* Card del foro */}
        <View style={styles.forumCard}>
          <Text style={styles.forumEmoji}>✏️</Text>
          <View style={styles.forumContent}>
            <Text style={styles.forumLabel}>
              {esHoy ? 'Foro del día' : detail?.foro?.fecha || ''}
            </Text>
            <Text style={styles.forumQuestion}>
              {detail?.foro?.pregunta || foro.pregunta}
            </Text>
            {detail?.foro?.descripcion && (
              <Text style={styles.forumDesc}>{detail.foro.descripcion}</Text>
            )}
          </View>
        </View>

        {/* Aviso si no es hoy */}
        {!esHoy && (
          <View style={styles.closedBanner}>
            <Feather name="lock" size={14} color={colors.textMuted} />
            <Text style={styles.closedText}>
              Este foro ya cerró. Solo puedes ver las respuestas y dar likes.
            </Text>
          </View>
        )}

        {/* Input respuesta — solo si es hoy y puede responder */}
        {puedeResponder && (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.reflectionInput}
              placeholder="Escribe tu reflexión..."
              placeholderTextColor={colors.textMuted}
              value={reflection}
              onChangeText={setReflection}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, (!reflection.trim() || sending) && styles.sendButtonDisabled]}
              disabled={!reflection.trim() || sending}
              onPress={handleSend}
            >
              {sending
                ? <ActivityIndicator size="small" color={colors.white} />
                : <Feather name="play" size={18} color={colors.white} />
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Respuestas */}
        <Text style={styles.repliesTitle}>
          {replies.length} respuesta{replies.length !== 1 ? 's' : ''}
        </Text>

        {replies.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="message-circle" size={36} color={colors.border} />
            <Text style={styles.emptyText}>
              {puedeResponder ? 'Sé el primero en responder' : 'Sin respuestas aún'}
            </Text>
          </View>
        ) : (
          replies.map((reply) => (
            <ReplyCard
              key={reply.id}
              reply={reply}
              foroId={foro.id}
              communityId={community.id}
              canInteract={esHoy && community?.tipo_acceso !== 'SOLO_VER'}
              onRefresh={() => fetchDetail(true)}
            />
          ))
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg,
  },
  headerCenter:   { alignItems: 'center', flex: 1 },
  headerTitle:    { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  headerSubtitle: { fontSize: fontSizes.xs, color: colors.textMuted, marginTop: 2 },
  scroll:         { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.xl },
  forumCard: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    padding: spacing.lg, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
  },
  forumEmoji:    { fontSize: 36 },
  forumContent:  { flex: 1, gap: 4 },
  forumLabel: {
    fontSize: fontSizes.xs, fontWeight: '700',
    color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1,
  },
  forumQuestion: { fontSize: fontSizes.md, fontWeight: '700', color: colors.white, lineHeight: 22 },
  forumDesc:     { fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.7)', lineHeight: 18, marginTop: 4 },
  closedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: '#F0F0F0', borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  closedText:    { fontSize: fontSizes.sm, color: colors.textMuted, flex: 1 },
  inputRow:      { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  reflectionInput: {
    flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    fontSize: fontSizes.md, color: colors.text, elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, maxHeight: 100,
  },
  sendButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  sendButtonDisabled: { opacity: 0.4 },
  repliesTitle: {
    fontSize: fontSizes.sm, fontWeight: '700', color: colors.text,
  },
  replyCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.lg,
    gap: spacing.sm, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  replyHeader:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  replyAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center',
  },
  replyAuthorInfo: { flex: 1 },
  replyAuthor:     { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text },
  replyTime:       { fontSize: fontSizes.xs, color: colors.textMuted },
  replyText:       { fontSize: fontSizes.sm, color: colors.textLight, lineHeight: 20 },
  replyActions:    { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  replyAction:     { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  replyActionText: { fontSize: fontSizes.sm, color: colors.textMuted },
  likedText:       { color: '#FF6B6B' },
  commentsSection: { marginTop: spacing.sm, gap: spacing.sm },
  noCommentsText:  { fontSize: fontSizes.sm, color: colors.textMuted, fontStyle: 'italic' },
  commentCard: {
    backgroundColor: colors.background, borderRadius: borderRadius.sm,
    padding: spacing.md, gap: 4,
    borderLeftWidth: 2, borderLeftColor: colors.border,
  },
  commentHeader:  { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  commentAvatar: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center',
  },
  commentAuthor:  { fontSize: fontSizes.xs, fontWeight: '700', color: colors.text, flex: 1 },
  commentTime:    { fontSize: 10, color: colors.textMuted },
  commentText:    { fontSize: fontSizes.xs, color: colors.textLight, lineHeight: 16 },
  commentInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs,
  },
  commentInput: {
    flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: fontSizes.sm, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
  },
  commentSendBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendDisabled:   { opacity: 0.4 },
  emptyState:     { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.md },
  emptyText:      { fontSize: fontSizes.md, color: colors.textMuted },
});