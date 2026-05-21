import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { GetActiveGruposUseCase } from '../../application/use-cases/get-active-grupos.use-case';

@ApiTags('Cuidado — Grupos de Apoyo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('care/grupos')
export class GruposController {
  constructor(private readonly getActiveGruposUseCase: GetActiveGruposUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Obtener la lista de grupos de apoyo y fundaciones sugeridas (Solo activos)' })
  findAll() {
    return this.getActiveGruposUseCase.execute();
  }
}