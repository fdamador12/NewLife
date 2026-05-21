import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { AdminJwtGuard } from '../../../admin/presentation/guards/admin-jwt.guard';
import { RolesGuard, Roles } from '../../../admin/presentation/guards/roles.guard';
import { UserRole } from '../../../admin/domain/entities/admin-user.entity';

import { CreateCategoriaDto, UpdateCategoriaDto } from '../dtos/categoria.dto';
import { CreateCategoriaUseCase } from '../../application/use-cases/categorias/create-categoria.use-case';
import { UpdateCategoriaUseCase } from '../../application/use-cases/categorias/update-categoria.use-case';
import { DeleteCategoriaUseCase } from '../../application/use-cases/categorias/delete-categoria.use-case';
import { GetAllCategoriasUseCase } from '../../application/use-cases/categorias/get-all-categorias.use-case';
import { GetCategoriaByIdUseCase } from '../../application/use-cases/categorias/get-categoria-by-id.use-case';

@ApiTags('Admin — Categorías de Contenido')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
@Controller('api/web/admin/categorias')
export class CategoriaController {
  constructor(
    private readonly createUseCase: CreateCategoriaUseCase,
    private readonly updateUseCase: UpdateCategoriaUseCase,
    private readonly deleteUseCase: DeleteCategoriaUseCase,
    private readonly getAllUseCase: GetAllCategoriasUseCase,
    private readonly getByIdUseCase: GetCategoriaByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las categorías' })
  findAll() { return this.getAllUseCase.execute(); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  findById(@Param('id') id: string) { return this.getByIdUseCase.execute(id); }

  @Post()
  @ApiOperation({ summary: 'Crear nueva categoría' })
  create(@Body() dto: CreateCategoriaDto) { return this.createUseCase.execute(dto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar categoría' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoriaDto) { return this.updateUseCase.execute(id, dto); }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar categoría (No borra el contenido)' })
  remove(@Param('id') id: string) { return this.deleteUseCase.execute(id); }
}