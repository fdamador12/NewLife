import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { AdminJwtGuard } from '../../../admin/presentation/guards/admin-jwt.guard';
import { RolesGuard, Roles } from '../../../admin/presentation/guards/roles.guard';
import { UserRole } from '../../../admin/domain/entities/admin-user.entity';

import { CreateGrupoApoyoDto, UpdateGrupoApoyoDto } from '../dtos/grupo-apoyo.dto';
import { CreateGrupoUseCase } from '../../application/use-cases/grupos/create-grupo.use-case';
import { UpdateGrupoUseCase } from '../../application/use-cases/grupos/update-grupo.use-case';
import { DeleteGrupoUseCase } from '../../application/use-cases/grupos/delete-grupo.use-case';
import { GetAllGruposUseCase } from '../../application/use-cases/grupos/get-all-grupos.use-case';
import { GetGrupoByIdUseCase } from '../../application/use-cases/grupos/get-grupo-by-id.use-case';

@ApiTags('Admin — Grupos de Apoyo')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
@Controller('api/web/admin/grupos-apoyo')
export class SupportGroupController {
  constructor(
    private readonly createUseCase: CreateGrupoUseCase,
    private readonly updateUseCase: UpdateGrupoUseCase,
    private readonly deleteUseCase: DeleteGrupoUseCase,
    private readonly getAllUseCase: GetAllGruposUseCase,
    private readonly getByIdUseCase: GetGrupoByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los grupos de apoyo' })
  findAll() { 
    return this.getAllUseCase.execute(); 
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un grupo por su UUID (grupo_id)' })
  findById(@Param('id') id: string) { 
    return this.getByIdUseCase.execute(id); 
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo grupo de apoyo' })
  create(@Body() dto: CreateGrupoApoyoDto) { 
    return this.createUseCase.execute(dto); 
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un grupo de apoyo' })
  update(@Param('id') id: string, @Body() dto: UpdateGrupoApoyoDto) { 
    return this.updateUseCase.execute(id, dto); 
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un grupo de apoyo' })
  remove(@Param('id') id: string) { 
    return this.deleteUseCase.execute(id); 
  }
}