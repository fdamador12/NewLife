import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { GetNotificationSettingsUseCase } from '../../application/use-cases/get-notification-settings.use-case';
import { UpdateNotificationSettingsUseCase } from '../../application/use-cases/update-notification-settings.use-case';
import { UpdateNotificationSettingsDto } from '../dtos/update-notification-settings.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly getSettingsUseCase: GetNotificationSettingsUseCase,
    private readonly updateSettingsUseCase: UpdateNotificationSettingsUseCase,
  ) {}

  @Get('settings')
  @UseGuards(JwtAuthGuard)
  async getSettings(@Request() req: any) {
    // FIX: el JwtAuthGuard de NewLife pone el usuario_id en req.user.uid
    // (NO en req.user.sub como sugiere el estandar JWT)
    const usuarioId = req.user.uid;
    return await this.getSettingsUseCase.execute(usuarioId);
  }

  @Post('settings')
  @UseGuards(JwtAuthGuard)
  async updateSettings(@Request() req: any, @Body() dto: UpdateNotificationSettingsDto) {
    const usuarioId = req.user.uid;
    return await this.updateSettingsUseCase.execute(usuarioId, dto);
  }
}