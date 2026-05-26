import { Controller, Get, Post, Delete, Body, Req, UseGuards, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';

import { GetFraseDelDiaUseCase } from '../../application/use-cases/get-frase-del-dia.use-case';
import { GetFrasesGuardadasUseCase } from '../../application/use-cases/get-frases-guardadas.use-case';
import { GuardarFraseUseCase } from '../../application/use-cases/guardar-frase.use-case';
import { DesguardarFraseUseCase } from '../../application/use-cases/desguardar-frase.use-case';
import { GetFrasesPorFechaUseCase } from '../../application/use-cases/get-frases-por-fecha.use-case';
import { FraseActionDto } from '../dtos/frase.dto';

import { JoinChallengeUseCase } from '../../application/use-cases/join-challenge.use-case';
import { GetMyChallengesUseCase } from '../../application/use-cases/get-my-challenges.use-case';
import { JoinChallengeDto } from '../dtos/join-challenge.dto';
import { GetMisMedallasUseCase } from '../../application/use-cases/get-mis-medallas.use-case';
import { ReclamarXpUseCase } from '../../application/use-cases/reclamar-xp.use-case';

@ApiTags('Motivación')
@ApiBearerAuth()
@Controller('motivation')
export class MotivationController {
  constructor(
    private readonly getFraseDelDiaUseCase: GetFraseDelDiaUseCase,
    private readonly getFrasesGuardadasUseCase: GetFrasesGuardadasUseCase,
    private readonly guardarFraseUseCase: GuardarFraseUseCase,
    private readonly desguardarFraseUseCase: DesguardarFraseUseCase,
    private readonly getFrasesPorFechaUseCase: GetFrasesPorFechaUseCase,
    private readonly getMyChallengesUseCase: GetMyChallengesUseCase,
    private readonly joinChallengeUseCase: JoinChallengeUseCase,
    private readonly getMisMedallasUseCase: GetMisMedallasUseCase,
    private readonly reclamarXpUseCase: ReclamarXpUseCase,
  ) {}

  // ✅ Sin guard — funciona para guest y usuarios logueados
  @ApiOperation({ summary: 'Obtiene la frase del día actual' })
  @Get('frase-del-dia')
  async getFraseDelDia(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1] ?? null;
    const uid = req.user?.uid ?? null;
    return await this.getFraseDelDiaUseCase.execute(uid, token);
  }

  // ✅ Sin guard — funciona para guest y usuarios logueados
  @ApiOperation({ summary: 'Obtiene todas las frases hasta una fecha específica' })
  @ApiQuery({ name: 'hasta', description: 'Fecha en formato YYYY-MM-DD', example: '2026-04-21' })
  @Get('frases')
  async getFrasesPorFecha(@Query('hasta') hasta: string, @Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1] ?? null;
    const uid = req.user?.uid ?? null;
    return await this.getFrasesPorFechaUseCase.execute(uid, hasta, token);
  }

  // ✅ Con guard — requiere autenticación
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtiene la lista de todas las frases que el usuario ha guardado (favoritas)' })
  @Get('frases-guardadas')
  async getFrasesGuardadas(@Req() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    return await this.getFrasesGuardadasUseCase.execute(req.user.uid, token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Guarda una frase en la lista de favoritas (Darle corazón)' })
  @Post('frases-guardadas')
  async guardarFrase(@Req() req: any, @Body() dto: FraseActionDto) {
    const token = req.headers.authorization.split(' ')[1];
    return await this.guardarFraseUseCase.execute(req.user.uid, dto.frase_id, token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Quita una frase de la lista de favoritas (Quitar corazón)' })
  @ApiParam({ name: 'fraseId', description: 'El ID de la frase que se va a eliminar de guardadas' })
  @Delete('frases-guardadas/:fraseId')
  async desguardarFrase(@Req() req: any, @Param('fraseId') fraseId: string) {
    const token = req.headers.authorization.split(' ')[1];
    return await this.desguardarFraseUseCase.execute(req.user.uid, fraseId, token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener la lista de retos inscritos y su progreso' })
  @Get('mis-retos')
  async getMyChallenges(@Req() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    return await this.getMyChallengesUseCase.execute(req.user.uid, token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Inscribe al usuario a un reto publicado y lo inicia en 0' })
  @Post('retos/unirse')
  async joinChallenge(@Req() req: any, @Body() dto: JoinChallengeDto) {
    const token = req.headers.authorization.split(' ')[1];
    return await this.joinChallengeUseCase.execute(req.user.uid, dto.reto_id, token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener la lista de medallas (Retos en estado COMPLETED)' })
  @Get('mis-medallas')
  async getMisMedallas(@Req() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    return await this.getMisMedallasUseCase.execute(req.user.uid, token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reclamar XP de un reto completado' })
  @ApiParam({ name: 'userRetoId', description: 'El user_reto_id del reto completado' })
  @Post('retos/:userRetoId/reclamar-xp')
  async reclamarXp(@Req() req: any, @Param('userRetoId') userRetoId: string) {
    const token = req.headers.authorization.split(' ')[1];
    return await this.reclamarXpUseCase.execute(req.user.uid, userRetoId, token);
  }
}