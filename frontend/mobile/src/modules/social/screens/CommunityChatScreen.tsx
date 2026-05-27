import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { chatSocket, ChatMessage } from '../../../services/chatSocketService';
import { getChatHistory } from '../../../services/communityService';
import { getProfile } from '../../../services/authService';

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

type ListItem =
  | { type: 'separator'; date: string; key: string }
  | { type: 'message'; msg: ChatMessage; key: string };

function buildList(messages: ChatMessage[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDate = '';
  for (const msg of messages) {
    if (!isSameDay(msg.created_at, lastDate || '')) {
      items.push({ type: 'separator', date: formatDate(msg.created_at), key: `sep-${msg.created_at}` });
      lastDate = msg.created_at;
    }
    items.push({ type: 'message', msg, key: msg.id });
  }
  return items;
}

function Bubble({ msg, isOwn, isPending }: { msg: ChatMessage; isOwn: boolean; isPending: boolean }) {
  return (
    <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
      {!isOwn && <Text style={styles.authorName}>{msg.autor_nombre}</Text>}
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther, isPending && styles.bubblePending]}>
        <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>{msg.contenido}</Text>
        <View style={styles.bubbleFooter}>
          <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>{formatTime(msg.created_at)}</Text>
          {isPending && <Feather name="clock" size={10} color="rgba(0,0,0,0.4)" />}
        </View>
      </View>
    </View>
  );
}

/**
 * Chat con auto-clear de "pending" tras 1.5s.
 *
 * Diagnostico de Vane: el backend persiste el mensaje (aparece al reentrar)
 * pero NO broadcasts via socket al mismo sender. El reloj se quedaba para
 * siempre.
 *
 * Fix: tras 1.5s, removemos el id de `pendingIds`. El icono de reloj
 * desaparece. Si el broadcast llegara despues, no pasa nada — el set
 * ya no tiene el id.
 */
export default function CommunityChatScreen({ navigation, route }: any) {
  const { community } = route.params;
  const communityName = community.nombre || community.name || '';
  const insets = useSafeAreaInsets();

  const canSendByAccess = community.tipo_acceso === 'CHAT_COMPLETO';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const myRobleIdRef = useRef<string>('');
  const myNombreRef = useRef<string>('');
  const flatRef = useRef<FlatList>(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    let cleanupJoined: (() => void) | undefined;
    let cleanupMsg: (() => void) | undefined;
    let cleanupErr: (() => void) | undefined;
    let mounted = true;

    const init = async () => {
      try {
        const profile = await getProfile();
        if (mounted) {
          myRobleIdRef.current = profile?.robleId || profile?._id || profile?.id || '';
          myNombreRef.current = profile?.nombre || profile?.name || 'Yo';
        }
      } catch { }

      try {
        const history = await getChatHistory(community.id, 50);
        if (mounted) { setMessages(history); setLoading(false); scrollToEnd(); }
      } catch {
        if (mounted) setLoading(false);
      }

      try { await chatSocket.connect(); } catch { }
      if (!mounted) return;

      cleanupJoined = chatSocket.onJoined((data) => {
        if (data.communityId !== community.id) return;
        if (data.myRobleId) myRobleIdRef.current = data.myRobleId;
      });

      cleanupMsg = chatSocket.onNewMessage((msg) => {
        if (msg.comunidad_id !== community.id) return;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          // Reemplazar pending con mismo contenido (deduplicar por contenido)
          const pendingIdx = prev.findIndex(m =>
            m.id.startsWith('pending-') && m.contenido === msg.contenido
          );
          if (pendingIdx >= 0) {
            const updated = [...prev];
            updated[pendingIdx] = msg;
            return updated;
          }
          return [...prev, msg];
        });
        scrollToEnd();
      });

      cleanupErr = chatSocket.onError(() => { });
      chatSocket.joinRoom(community.id);
    };

    init();

    return () => {
      mounted = false;
      cleanupJoined?.();
      cleanupMsg?.();
      cleanupErr?.();
      chatSocket.disconnect();
    };
  }, [community.id, scrollToEnd]);

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed || !canSendByAccess) return;

    const tempId = `pending-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      comunidad_id: community.id,
      autor_id: myRobleIdRef.current || 'me',
      autor_nombre: myNombreRef.current || 'Yo',
      contenido: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setPendingIds(prev => new Set(prev).add(tempId));
    setText('');
    scrollToEnd();

    try {
      chatSocket.sendMessage(community.id, trimmed);
    } catch { }

    // FIX clave — auto-clear del pending status tras 1.5s.
    // El backend ya persistio (visible al re-entrar). El reloj solo
    // confunde si nunca se quita.
    setTimeout(() => {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });
    }, 1500);
  };

  const listData = buildList(messages);

  const safeBottom = Math.max(insets.bottom, 12);

  const readOnlyMessage = community.tipo_acceso === 'SOLO_VER'
    ? 'Tu acceso es solo lectura — no puedes enviar mensajes'
    : 'Solo miembros con acceso a chat completo pueden enviar mensajes';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <Feather name="users" size={18} color={colors.textMuted} />
        </View>
        <Text style={styles.headerTitle}>{communityName}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Feather name="message-circle" size={32} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Sin mensajes</Text>
          <Text style={styles.emptyText}>
            {canSendByAccess ? 'Se el primero en escribir algo' : 'Aun no hay mensajes en este chat'}
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          style={{ flex: 1 }}
          data={listData}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.messagesScroll}
          showsVerticalScrollIndicator={false}
          onLayout={scrollToEnd}
          renderItem={({ item }) => {
            if (item.type === 'separator') {
              return <Text style={styles.dateSeparator}>{item.date}</Text>;
            }
            const isOwn = item.msg.autor_id === myRobleIdRef.current || item.msg.autor_id === 'me';
            const isPending = pendingIds.has(item.msg.id);
            return <Bubble msg={item.msg} isOwn={isOwn} isPending={isPending} />;
          }}
        />
      )}

      <View style={[styles.inputBar, { paddingBottom: safeBottom }]}>
        {canSendByAccess ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Escribir..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={text}
              onChangeText={setText}
              multiline
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!text.trim()}
            >
              <Feather name="send" size={18} color={colors.white} />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.readOnlyContainer}>
            <Feather name="lock" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.readOnlyText}>{readOnlyMessage}</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  headerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: colors.text },
  emptyText: { fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  messagesScroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  dateSeparator: { fontSize: fontSizes.xs, color: colors.textMuted, textAlign: 'center', marginVertical: spacing.md },
  messageRow: { flexDirection: 'column', marginBottom: spacing.xs, alignItems: 'flex-start' },
  messageRowOwn: { alignItems: 'flex-end' },
  authorName: { fontSize: fontSizes.xs, color: colors.textMuted, marginBottom: 2, marginLeft: 2 },
  bubble: { maxWidth: '75%', borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  bubblePending: { opacity: 0.65 },
  bubbleOther: {
    backgroundColor: colors.white, borderBottomLeftRadius: 4,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2,
  },
  bubbleOwn: { backgroundColor: '#C8D8F5', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: fontSizes.sm, color: colors.text, lineHeight: 20 },
  bubbleTextOwn: { color: colors.text },
  bubbleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 2 },
  bubbleTime: { fontSize: 10, color: colors.textMuted },
  bubbleTimeOwn: { color: 'rgba(0,0,0,0.4)' },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.xl, paddingTop: spacing.md,
    backgroundColor: colors.primary,
  },
  input: { flex: 1, fontSize: fontSizes.md, color: colors.white, paddingVertical: spacing.xs, maxHeight: 100 },
  sendButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
  readOnlyContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 4 },
  readOnlyText: { fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontWeight: '500' },
});