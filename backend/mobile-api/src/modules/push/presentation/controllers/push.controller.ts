import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { RegisterPushTokenUseCase } from '../../application/use-cases/register-push-token.use-case';

@ApiTags('Push Notifications')
@ApiBearerAuth()
@Controller('push')
export class PushController {
  constructor(
    private readonly registerUseCase: RegisterPushTokenUseCase,
  ) {}

  /**
   * POST /push/register
   * Body: { token: "ExponentPushToken[xxxxx]" }
   * Auth: JWT requerido
   */
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Registra el Expo Push Token del dispositivo para notificaciones push' })
  @Post('register')
  async register(@Req() req: any, @Body() body: { token: string }) {
    return await this.registerUseCase.execute(req.user.uid, body.token);
  }
}