import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Modal, Pressable,
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
  dark: '#404040',
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
  reply, foroId, communityId, canInteract, onRefresh,
}: {
  reply: Reply; foroId: string; communityId: string; canInteract: boolean; onRefresh: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [liking, setLiking] = useState(false);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      await likeForumReply(communityId, foroId, reply.id);
      onRefresh();
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo dar like.') });
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
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo comentar.') });
    } finally {
      setSending(false);
    }
  };

  const authorInitial = reply.autor.nombre.charAt(0).toUpperCase();

  return (
    <>
      <View style={styles.replyCard}>
        <View style={styles.replyHeader}>
          <View style={styles.replyAvatar}>
            <Text style={styles.replyAvatarText}>{authorInitial}</Text>
          </View>
          <View style={styles.replyAuthorInfo}>
            <Text style={styles.replyAuthor}>{reply.autor.nombre}</Text>
            <Text style={styles.replyTime}>{timeAgo(reply.created_at)}</Text>
          </View>
        </View>

        <Text style={styles.replyText}>{reply.contenido}</Text>

        <View style={styles.replyActions}>
          <TouchableOpacity style={[styles.actionPill, reply.yo_di_like && styles.actionPillLiked]} onPress={handleLike} disabled={liking}>
            <Feather name="heart" size={16} color={reply.yo_di_like ? COLORS.red : COLORS.muted} />
            <Text style={[styles.actionPillText, reply.yo_di_like && styles.actionPillTextLiked]}>{reply.total_likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionPill} onPress={() => setShowComments(!showComments)}>
            <Feather name="message-circle" size={16} color={COLORS.muted} />
            <Text style={styles.actionPillText}>{reply.comentarios.length}</Text>
          </TouchableOpacity>
        </View>

        {showComments && (
          <View style={styles.commentsSection}>
            {reply.comentarios.length === 0 ? (
              <Text style={styles.noCommentsText}>Sin comentarios aun</Text>
            ) : (
              reply.comentarios.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>{comment.autor.nombre.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.commentAuthor}>{comment.autor.nombre}</Text>
                    <Text style={styles.commentTime}>{timeAgo(comment.created_at)}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.contenido}</Text>
                </View>
              ))
            )}

            {canInteract && (
              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Anade un comentario..."
                  placeholderTextColor={COLORS.muted}
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline={false}
                />
                <TouchableOpacity
                  style={[styles.commentSendBtn, (!newComment.trim() || sending) && styles.sendDisabled]}
                  onPress={handleComment}
                  disabled={!newComment.trim() || sending}
                >
                  {sending ? <ActivityIndicator size="small" color={COLORS.white} /> : <Feather name="send" size={14} color={COLORS.white} />}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      <CustomModal
        visible={errorModal.visible}
        title="Error"
        message={errorModal.message}
        buttons={[{ text: 'Aceptar', style: 'default' }]}
        onClose={() => setErrorModal({ visible: false, message: '' })}
      />
    </>
  );
}

export default function DailyForumDetailScreen({ navigation, route }: any) {
  const { foro, community } = route.params;

  const forumKey = CK.forumDetail(community.id, foro.id);
  const [detail, setDetail] = useState<any>(() => communityCache.peek<any>(forumKey));
  const [loading, setLoading] = useState(!communityCache.peek(forumKey));
  const [refreshing, setRefreshing] = useState(false);
  const [reflection, setReflection] = useState('');
  const [sending, setSending] = useState(false);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

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
      setErrorModal({ visible: true, message: apiError(err, 'Error al cargar el foro.') });
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
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo enviar la respuesta.') });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  const replies: Reply[] = detail?.respuestas || [];
  const puedeResponder = detail?.puede_responder === true;
  const esHoy = detail?.foro?.es_hoy === true;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Foro del dia</Text>
          <Text style={styles.headerSubtitle}>{community.nombre}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchDetail(true); }}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
          />
        }
      >
        <View style={styles.forumCard}>
          <View style={styles.forumIconWrapper}>
            <Feather name="message-square" size={20} color={COLORS.white} />
          </View>
          <View style={styles.forumContent}>
            <Text style={styles.forumLabel}>
              {esHoy ? 'Foro del dia' : detail?.foro?.fecha || ''}
            </Text>
            <Text style={styles.forumQuestion}>
              {detail?.foro?.pregunta || foro.pregunta}
            </Text>
            {detail?.foro?.descripcion && (
              <Text style={styles.forumDesc}>{detail.foro.descripcion}</Text>
            )}
          </View>
        </View>

        {!esHoy && (
          <View style={styles.closedBanner}>
            <View style={styles.closedIconWrapper}>
              <Feather name="lock" size={16} color={COLORS.muted} />
            </View>
            <Text style={styles.closedText}>
              Este foro ya cerro. Solo puedes ver las respuestas y dar likes.
            </Text>
          </View>
        )}

        {puedeResponder && (
          <View style={styles.inputCard}>
            <TextInput
              style={styles.reflectionInput}
              placeholder="Escribe tu reflexion..."
              placeholderTextColor={COLORS.muted}
              value={reflection}
              onChangeText={setReflection}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, (!reflection.trim() || sending) && styles.sendDisabled]}
              disabled={!reflection.trim() || sending}
              onPress={handleSend}
            >
              {sending ? <ActivityIndicator size="small" color={COLORS.white} /> : <Feather name="send" size={18} color={COLORS.white} />}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Respuestas</Text>
          {replies.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{replies.length}</Text>
            </View>
          )}
        </View>

        {replies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Feather name="message-circle" size={32} color={COLORS.muted} />
            </View>
            <Text style={styles.emptyTitle}>Sin respuestas</Text>
            <Text style={styles.emptyText}>
              {puedeResponder ? 'Se el primero en responder' : 'Aun no hay respuestas'}
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

        <View style={{ height: 40 }} />
      </ScrollView>

      <CustomModal
        visible={errorModal.visible}
        title="Error"
        message={errorModal.message}
        buttons={[{ text: 'Aceptar', style: 'default' }]}
        onClose={() => setErrorModal({ visible: false, message: '' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: COLORS.white },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: COLORS.background },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  headerSubtitle: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  forumCard: { backgroundColor: COLORS.dark, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  forumIconWrapper: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  forumContent: { flex: 1, gap: 6 },
  forumLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 },
  forumQuestion: { fontSize: 16, fontWeight: '600', color: COLORS.white, lineHeight: 22 },
  forumDesc: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 20, marginTop: 4 },
  closedBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 16, padding: 14 },
  closedIconWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.lightMuted, alignItems: 'center', justifyContent: 'center' },
  closedText: { fontSize: 14, color: COLORS.muted, flex: 1, lineHeight: 20 },
  inputCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  reflectionInput: { flex: 1, backgroundColor: COLORS.background, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: COLORS.text, maxHeight: 100 },
  sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  badge: { backgroundColor: COLORS.lightMuted, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  emptyContainer: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.lightMuted, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22 },
  replyCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, gap: 12 },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  replyAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  replyAvatarText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  replyAuthorInfo: { flex: 1 },
  replyAuthor: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  replyTime: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  replyText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  replyActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  actionPillLiked: { backgroundColor: COLORS.redLight },
  actionPillText: { fontSize: 14, color: COLORS.muted, fontWeight: '500' },
  actionPillTextLiked: { color: COLORS.red },
  commentsSection: { marginTop: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.lightMuted, gap: 10 },
  noCommentsText: { fontSize: 14, color: COLORS.muted, fontStyle: 'italic' },
  commentCard: { backgroundColor: COLORS.background, borderRadius: 14, padding: 12, gap: 6, borderLeftWidth: 3, borderLeftColor: COLORS.lightMuted },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  commentAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.lightMuted, alignItems: 'center', justifyContent: 'center' },
  commentAvatarText: { fontSize: 11, fontWeight: '600', color: COLORS.muted },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: COLORS.text, flex: 1 },
  commentTime: { fontSize: 11, color: COLORS.muted },
  commentText: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  commentInput: { flex: 1, backgroundColor: COLORS.white, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.lightMuted },
  commentSendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
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