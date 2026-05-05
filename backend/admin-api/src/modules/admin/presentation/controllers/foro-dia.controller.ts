import { Controller, Get, Post, Patch, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';
import { UserRole } from '../../domain/entities/admin-user.entity';

import { CreateForoDiaDto, UpdateForoDiaDto, CreateForoDiaBulkDto } from '../dtos/foro-dia.dto';
import { GetAllForosUseCase } from '../../application/use-cases/get-all-foros.use-case';
import { CreateForoDiaUseCase } from '../../application/use-cases/create-foro-dia.use-case';
import { UpdateForoDiaUseCase } from '../../application/use-cases/update-foro-dia.use-case';
import { CreateForosBulkUseCase } from '../../application/use-cases/create-foros-bulk.use-case';

@ApiTags('Admin — Foros del Día')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
@Controller('api/web/admin/foros-dia')
export class ForoDiaController {
  constructor(
    private readonly getAllUseCase: GetAllForosUseCase,
    private readonly createUseCase: CreateForoDiaUseCase,
    private readonly updateUseCase: UpdateForoDiaUseCase,
    private readonly createBulkUseCase: CreateForosBulkUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los foros del día' })
  findAll() { 
    return this.getAllUseCase.execute(); 
  }

  @Post()
  @ApiOperation({ summary: 'Programar un nuevo foro para un día específico' })
  create(@Body() dto: CreateForoDiaDto) { 
    return this.createUseCase.execute(dto); 
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Carga masiva de foros del día' })
  async createBulk(@Body() dto: CreateForoDiaBulkDto) {
    await this.createBulkUseCase.execute(dto.foros);
    return { message: `${dto.foros.length} foros programados exitosamente` };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un foro del día' })
  update(@Param('id') id: string, @Body() dto: UpdateForoDiaDto) { 
    return this.updateUseCase.execute(id, dto); 
  }
}