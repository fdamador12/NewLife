import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { GetChatHistoryUseCase } from '../../application/use-cases/get-chat-history.use-case';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly getChatHistory: GetChatHistoryUseCase,
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  @Get(':communityId/messages')
  async getMessages(
    @Param('communityId') communityId: string,
    @Query('limit') limit: string,
    @Req() req: any,
  ) {
    const masterToken = await this.systemAuth.getMasterToken();
    const searchRes = await this.dbService.find('usuarios', { usuario_id: req.user.uid }, masterToken);
    const rows = Array.isArray(searchRes) ? searchRes : (searchRes.rows || []);
    const userInDb = rows[0];
    if (!userInDb) return [];

    return this.getChatHistory.execute(communityId, userInDb._id, parseInt(limit ?? '50', 10));
  }
}
