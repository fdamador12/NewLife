import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { chatSocket, ChatMessage } from '../../../services/chatSocketService';
import { getChatHistory } from '../../../services/communityService';

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
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

type BubbleProps = {
  msg: ChatMessage;
  isOwn: boolean;
};

function Bubble({ msg, isOwn }: BubbleProps) {
  return (
    <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
      {!isOwn && (
        <Text style={styles.authorName}>{msg.autor_nombre}</Text>
      )}
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>{msg.contenido}</Text>
        <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>{formatTime(msg.created_at)}</Text>
      </View>
    </View>
  );
}

export default function CommunityChatScreen({ navigation, route }: any) {
  const { community } = route.params;
  const communityName = community.nombre || community.name || '';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [canSend, setCanSend] = useState(false);
  const myRobleIdRef = useRef<string>('');
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
        const history = await getChatHistory(community.id, 50);
        if (mounted) setMessages(history);
      } catch {}

      const sock = await chatSocket.connect();
      if (!mounted) return;

      cleanupJoined = chatSocket.onJoined((data) => {
        if (data.communityId !== community.id) return;
        myRobleIdRef.current = data.myRobleId;
        setCanSend(data.canSend);
        setLoading(false);
        scrollToEnd();
      });

      cleanupMsg = chatSocket.onNewMessage((msg) => {
        if (msg.comunidad_id !== community.id) return;
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === msg.id);
          if (exists) return prev;
          return [...prev, msg];
        });
        scrollToEnd();
      });

      cleanupErr = chatSocket.onError(() => {
        if (mounted) setLoading(false);
      });

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
    if (!trimmed || !canSend) return;
    chatSocket.sendMessage(community.id, trimmed);
    setText('');
  };

  const listData = buildList(messages);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
      ) : (
        <FlatList
          ref={flatRef}
          data={listData}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.messagesScroll}
          showsVerticalScrollIndicator={false}
          onLayout={scrollToEnd}
          renderItem={({ item }) => {
            if (item.type === 'separator') {
              return <Text style={styles.dateSeparator}>{item.date}</Text>;
            }
            const isOwn = item.msg.autor_id === myRobleIdRef.current;
            return <Bubble msg={item.msg} isOwn={isOwn} />;
          }}
        />
      )}

      <View style={styles.inputBar}>
        {canSend ? (
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
          <Text style={styles.readOnlyText}>Solo lectura — tu acceso no permite enviar mensajes</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },

  headerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F0F0F0',
    alignItems: 'center', justifyContent: 'center',
  },

  headerTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, flex: 1 },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  messagesScroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },

  dateSeparator: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.md,
  },

  messageRow: {
    flexDirection: 'column',
    marginBottom: spacing.xs,
    alignItems: 'flex-start',
  },

  messageRowOwn: {
    alignItems: 'flex-end',
  },

  authorName: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginBottom: 2,
    marginLeft: 2,
  },

  bubble: {
    maxWidth: '75%',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  bubbleOther: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },

  bubbleOwn: {
    backgroundColor: '#C8D8F5',
    borderBottomRightRadius: 4,
  },

  bubbleText: {
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },

  bubbleTextOwn: { color: colors.text },

  bubbleTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    alignSelf: 'flex-end',
  },

  bubbleTimeOwn: { color: 'rgba(0,0,0,0.4)' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    paddingBottom: Platform.OS === 'ios' ? 32 : spacing.md,
  },

  input: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.white,
    paddingVertical: spacing.xs,
    maxHeight: 100,
  },

  sendButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  sendButtonDisabled: { opacity: 0.4 },

  readOnlyText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});
