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

@ApiTags('🎵 Breathing Sounds - Sonidos Ambientales')
@ApiBearerAuth()
@Controller('sos/breathing-sounds')
export class BreathingSoundsController {
  private readonly logger = new Logger('BreathingSoundsController');

  constructor(
    private getSoundsUseCase: GetBreathingSoundsUseCase,
    private syncSoundsUseCase: SyncFreesoundSoundsUseCase
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener todos los sonidos ambientales',
    description:
      'Retorna lista de sonidos (lluvia, olas, viento, fuego, pájaros) para meditación guiada',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sonidos obtenida exitosamente',
  })
  async getAllSounds(@Req() req: any): Promise<BreathingSoundEntity[]> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const user = req.user;
      this.logger.log(`🔊 Usuario ${user?.email || 'desconocido'} solicitó todos los sonidos`);
      return await this.getSoundsUseCase.getAllSounds(token);
    } catch (error) {
      this.logger.error(`❌ Error obteniendo sonidos: ${error}`);
      throw error;
    }
  }

  @Get('nombre/:nombre')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener sonido por nombre',
    description:
      'Retorna un sonido específico: Lluvia, Olas, Viento, Fuego o Pajaros',
  })
  @ApiResponse({
    status: 200,
    description: 'Sonido obtenido exitosamente',
  })
  async getSoundByNombre(
    @Param('nombre') nombre: string,
    @Req() req: any
  ): Promise<BreathingSoundEntity | null> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const user = req.user;
      this.logger.log(
        `🔊 Usuario ${user?.email || 'desconocido'} solicitó sonido: ${nombre}`
      );
      return await this.getSoundsUseCase.getSoundByNombre(nombre, token);
    } catch (error) {
      this.logger.error(`❌ Error obteniendo sonido: ${error}`);
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener sonido por ID',
    description: 'Retorna un sonido específico usando su ID (_id)',
  })
  async getSoundById(
    @Param('id') id: string,
    @Req() req: any
  ): Promise<BreathingSoundEntity | null> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const user = req.user;
      this.logger.log(`🔊 Usuario ${user?.email || 'desconocido'} solicitó sonido ID: ${id}`);
      return await this.getSoundsUseCase.getSoundById(id, token);
    } catch (error) {
      this.logger.error(`❌ Error obteniendo sonido: ${error}`);
      throw error;
    }
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Sincronizar sonidos preseleccionados',
    description:
      'Sincroniza 5 sonidos ambientales preseleccionados en la BD. Los URLs de Freesound ya están en las constantes.',
  })
  @ApiResponse({
    status: 201,
    description: 'Sincronización completada exitosamente',
  })
  async syncFreesoundSounds(@Req() req: any): Promise<{
    message: string;
  }> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const user = req.user;
      this.logger.log(`🔄 Usuario ${user?.email || 'desconocido'} disparó sincronización`);
      await this.syncSoundsUseCase.execute(token);
      return { message: '✅ Sonidos sincronizados exitosamente' };
    } catch (error) {
      this.logger.error(`❌ Error en sincronización: ${error}`);
      throw error;
    }
  }
}