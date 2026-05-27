import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:3000';

let socket: Socket | null = null;

export type ChatMessage = {
  id: string;
  comunidad_id: string;
  autor_id: string;
  autor_nombre: string;
  contenido: string;
  created_at: string;
};

export const chatSocket = {
  async connect(): Promise<Socket> {
    if (socket?.connected) return socket;

    const token = await AsyncStorage.getItem('accessToken');
    socket = io(`${BASE_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });
    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket(): Socket | null {
    return socket;
  },

  joinRoom(communityId: string) {
    socket?.emit('join-room', { communityId });
  },

  sendMessage(communityId: string, contenido: string) {
    socket?.emit('send-message', { communityId, contenido });
  },

  onJoined(cb: (data: { communityId: string; canSend: boolean; myRobleId: string }) => void) {
    socket?.on('joined', cb);
    return () => socket?.off('joined', cb);
  },

  onNewMessage(cb: (msg: ChatMessage) => void) {
    socket?.on('new-message', cb);
    return () => socket?.off('new-message', cb);
  },

  onError(cb: (data: { message: string }) => void) {
    socket?.on('error', cb);
    return () => socket?.off('error', cb);
  },
};
