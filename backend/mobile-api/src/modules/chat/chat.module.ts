import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './presentation/controllers/chat.controller';
import { SaveChatMessageUseCase } from './application/use-cases/save-chat-message.use-case';
import { GetChatHistoryUseCase } from './application/use-cases/get-chat-history.use-case';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [ChatController],
  providers: [ChatGateway, SaveChatMessageUseCase, GetChatHistoryUseCase],
})
export class ChatModule {}
