import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { IAuthProviderPort } from '../auth/domain/ports/auth-provider.port';
import { DatabaseService } from '../database/infrastructure/database.service';
import { SystemAuthService } from '../auth/infrastructure/services/system-auth.service';
import { SaveChatMessageUseCase } from './application/use-cases/save-chat-message.use-case';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('IAuthProviderPort')
    private readonly authProvider: IAuthProviderPort,
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly saveMessage: SaveChatMessageUseCase,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (!token) { client.disconnect(); return; }
    client.data.token = token;
  }

  handleDisconnect(_client: Socket) {}

  private async resolveUser(client: Socket): Promise<boolean> {
    if (client.data.user) return true;
    try {
      const robleResponse = await this.authProvider.verifyToken(client.data.token);
      const robleUser = robleResponse?.user;
      if (!robleResponse?.valid || !robleUser?.email) return false;

      const masterToken = await this.systemAuth.getMasterToken();
      const searchRes = await this.dbService.find('usuarios', { email: robleUser.email }, masterToken);
      const rows = Array.isArray(searchRes) ? searchRes : (searchRes.rows || []);
      const userInDb = rows.find((u: any) => u.email.toLowerCase() === robleUser.email.toLowerCase());
      if (!userInDb) return false;

      client.data.user = {
        uid:     userInDb.usuario_id,
        robleId: userInDb._id,
        nombre:  userInDb.nombre,
        email:   userInDb.email,
      };
      return true;
    } catch {
      return false;
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { communityId: string },
  ) {
    const ok = await this.resolveUser(client);
    if (!ok) { client.emit('error', { message: 'No autenticado.' }); client.disconnect(); return; }

    const { communityId } = data;
    const { robleId } = client.data.user;

    try {
      const masterToken = await this.systemAuth.getMasterToken();
      const membRes = await this.dbService.find(
        'comunidad_usuarios',
        { comunidad_id: communityId, usuario_id: robleId },
        masterToken,
      );
      const rows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
      const membresia = rows[0];

      if (!membresia) {
        client.emit('error', { message: 'No eres miembro de esta comunidad.' });
        return;
      }

      const room = `community:${communityId}`;
      client.join(room);
      client.emit('joined', {
        communityId,
        canSend: membresia.tipo_acceso === 'CHAT_COMPLETO',
        myRobleId: robleId,
      });
    } catch {
      client.emit('error', { message: 'Error al unirse al chat.' });
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { communityId: string; contenido: string },
  ) {
    const ok = await this.resolveUser(client);
    if (!ok) { client.emit('error', { message: 'No autenticado.' }); return; }
    if (!data.contenido?.trim()) return;

    const { robleId, nombre } = client.data.user;
    try {
      const message = await this.saveMessage.execute(
        data.communityId,
        robleId,
        nombre,
        data.contenido.trim(),
      );
      this.server.to(`community:${data.communityId}`).emit('new-message', message);
    } catch (err: any) {
      client.emit('error', { message: err.message || 'No se pudo enviar el mensaje.' });
    }
  }
}
