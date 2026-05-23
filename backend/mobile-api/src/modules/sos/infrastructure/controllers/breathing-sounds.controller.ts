import { Controller, Get, Post, Param, UseGuards, Logger, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { GetBreathingSoundsUseCase } from '../../application/use-cases/get-breathing-sounds.use-case';
import { SyncFreesoundSoundsUseCase } from '../../application/use-cases/sync-freesound-sounds.use-case';
import { BreathingSoundEntity } from '../../domain/entities/breathing-sound.entity';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@ApiTags('🎵 Breathing Sounds - Sonidos Ambientales')
@ApiBearerAuth()
@Controller('sos/breathing-sounds')
export class BreathingSoundsController {
  private readonly logger = new Logger('BreathingSoundsController');

  constructor(
    private getSoundsUseCase: GetBreathingSoundsUseCase,
    private syncSoundsUseCase: SyncFreesoundSoundsUseCase,
    private systemAuth: SystemAuthService,
  ) {}

  private async resolveToken(req: any): Promise<string> {
    const authHeader = req.headers.authorization;
    if (authHeader) return authHeader.split(' ')[1];
    return this.systemAuth.getMasterToken();
  }

  // ✅ Sin guard — funciona para guest y usuarios logueados
  @Get()
  @ApiOperation({
    summary: 'Obtener todos los sonidos ambientales',
    description: 'Retorna lista de sonidos para meditación guiada',
  })
  @ApiResponse({ status: 200, description: 'Lista de sonidos obtenida exitosamente' })
  async getAllSounds(@Req() req: any): Promise<BreathingSoundEntity[]> {
    try {
      const token = await this.resolveToken(req);
      return await this.getSoundsUseCase.getAllSounds(token);
    } catch (error) {
      this.logger.error(`❌ Error obteniendo sonidos: ${error}`);
      throw error;
    }
  }

  // ✅ Sin guard — funciona para guest y usuarios logueados
  @Get('nombre/:nombre')
  @ApiOperation({ summary: 'Obtener sonido por nombre' })
  async getSoundByNombre(
    @Param('nombre') nombre: string,
    @Req() req: any
  ): Promise<BreathingSoundEntity | null> {
    try {
      const token = await this.resolveToken(req);
      return await this.getSoundsUseCase.getSoundByNombre(nombre, token);
    } catch (error) {
      this.logger.error(`❌ Error obteniendo sonido: ${error}`);
      throw error;
    }
  }

  // ✅ Sin guard — funciona para guest y usuarios logueados
  @Get(':id')
  @ApiOperation({ summary: 'Obtener sonido por ID' })
  async getSoundById(
    @Param('id') id: string,
    @Req() req: any
  ): Promise<BreathingSoundEntity | null> {
    try {
      const token = await this.resolveToken(req);
      return await this.getSoundsUseCase.getSoundById(id, token);
    } catch (error) {
      this.logger.error(`❌ Error obteniendo sonido: ${error}`);
      throw error;
    }
  }

  // ✅ Con guard — solo admins pueden sincronizar
  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Sincronizar sonidos preseleccionados' })
  async syncFreesoundSounds(@Req() req: any): Promise<{ message: string }> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      await this.syncSoundsUseCase.execute(token);
      return { message: '✅ Sonidos sincronizados exitosamente' };
    } catch (error) {
      this.logger.error(`❌ Error en sincronización: ${error}`);
      throw error;
    }
  }
}