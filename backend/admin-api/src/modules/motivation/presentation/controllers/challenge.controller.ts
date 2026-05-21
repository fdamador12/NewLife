import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../admin/presentation/guards/admin-jwt.guard';
import { RolesGuard, Roles } from '../../../admin/presentation/guards/roles.guard';
import { UserRole } from '../../../admin/domain/entities/admin-user.entity';

import { CreateChallengeUseCase } from '../../application/use-cases/create-challenge.use-case';
import { UpdateChallengeUseCase } from '../../application/use-cases/update-challenge.use-case';
import { DeleteChallengeUseCase } from '../../application/use-cases/delete-challenge.use-case';
import { PublishChallengeUseCase } from '../../application/use-cases/publish-challenge.use-case';
import { GetAllChallengesUseCase } from '../../application/use-cases/get-all-challenges.use-case';
import { GetChallengeByIdUseCase } from '../../application/use-cases/get-challenge-by-id.use-case';
import { CreateChallengeDto, UpdateChallengeDto } from '../dtos/challenge.dto';

@ApiTags('Admin — Retos')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
@Controller('api/web/admin/challenges')
export class ChallengeController {
  constructor(
    private readonly createChallengeUseCase: CreateChallengeUseCase,
    private readonly updateChallengeUseCase: UpdateChallengeUseCase,
    private readonly deleteChallengeUseCase: DeleteChallengeUseCase,
    private readonly publishChallengeUseCase: PublishChallengeUseCase,
    private readonly getAllChallengesUseCase: GetAllChallengesUseCase,
    private readonly getChallengeByIdUseCase: GetChallengeByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los retos (Borradores y Publicados)' })
  async getAll() {
    return this.getAllChallengesUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un reto por su UUID (reto_id)' })
  @ApiParam({ name: 'id', description: 'El UUID generado por el backend (reto_id)' })
  async getById(@Param('id') id: string) {
    return this.getChallengeByIdUseCase.execute(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo reto en estado DRAFT' })
  async create(@Body() dto: CreateChallengeDto) {
    return this.createChallengeUseCase.execute(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar un reto (solo si está en estado DRAFT)' })
  @ApiParam({ name: 'id', description: 'El UUID generado por el backend (reto_id)' })
  async update(@Param('id') id: string, @Body() dto: UpdateChallengeDto) {
    return this.updateChallengeUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un reto (solo si está en estado DRAFT)' })
  @ApiParam({ name: 'id', description: 'El UUID generado por el backend (reto_id)' })
  async remove(@Param('id') id: string) {
    await this.deleteChallengeUseCase.execute(id);
    return { message: 'Reto eliminado exitosamente' };
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publicar un reto. Una vez publicado NO se puede editar ni borrar.' })
  @ApiParam({ name: 'id', description: 'El UUID generado por el backend (reto_id)' })
  async publish(@Param('id') id: string) {
    return this.publishChallengeUseCase.execute(id);
  }
}