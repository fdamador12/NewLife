import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { AdminJwtGuard } from '../../../admin/presentation/guards/admin-jwt.guard';
import { RolesGuard, Roles } from '../../../admin/presentation/guards/roles.guard';
import { UserRole } from '../../../admin/domain/entities/admin-user.entity';

import { CreateContenidoDto, UpdateContenidoDto } from '../dtos/contenido.dto';
import { CreateContenidoUseCase } from '../../application/use-cases/contenido/create-contenido.use-case';
import { UpdateContenidoUseCase } from '../../application/use-cases/contenido/update-contenido.use-case';
import { DeleteContenidoUseCase } from '../../application/use-cases/contenido/delete-contenido.use-case';
import { GetAllContenidoUseCase } from '../../application/use-cases/contenido/get-all-contenido.use-case';
import { GetContenidoByIdUseCase } from '../../application/use-cases/contenido/get-contenido-by-id.use-case';

@ApiTags('Admin — Contenido Educativo')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
@Controller('api/web/admin/contenido')
export class ContenidoController {
  constructor(
    private readonly createUseCase: CreateContenidoUseCase,
    private readonly updateUseCase: UpdateContenidoUseCase,
    private readonly deleteUseCase: DeleteContenidoUseCase,
    private readonly getAllUseCase: GetAllContenidoUseCase,
    private readonly getByIdUseCase: GetContenidoByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los contenidos (Artículos y Videos)' })
  findAll() { return this.getAllUseCase.execute(); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener contenido por ID' })
  findById(@Param('id') id: string) { return this.getByIdUseCase.execute(id); }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo contenido' })
  create(@Body() dto: CreateContenidoDto) { return this.createUseCase.execute(dto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar contenido (o pasarlo de DRAFT a PUBLISHED)' })
  update(@Param('id') id: string, @Body() dto: UpdateContenidoDto) { return this.updateUseCase.execute(id, dto); }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar contenido permanentemente' })
  remove(@Param('id') id: string) { return this.deleteUseCase.execute(id); }
}