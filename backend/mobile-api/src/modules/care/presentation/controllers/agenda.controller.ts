import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { AgendaUseCase } from '../../application/use-cases/agenda.use-case';
import { CreateAgendaEventDto, UpdateAgendaEventDto } from '../dtos/agenda.dto';

@ApiTags('Cuidado — Agenda')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('care/agenda')
export class AgendaController {
  constructor(private readonly agendaUseCase: AgendaUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los eventos de la agenda del usuario' })
  findAll(@Request() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    return this.agendaUseCase.findAll(req.user.uid, token);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo evento' })
  create(@Request() req: any, @Body() dto: CreateAgendaEventDto) {
    const token = req.headers.authorization.split(' ')[1];
    return this.agendaUseCase.create(req.user.uid, dto, token);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un evento existente' })
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateAgendaEventDto) {
    const token = req.headers.authorization.split(' ')[1];
    return this.agendaUseCase.update(id, req.user.uid, dto, token);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un evento' })
  remove(@Param('id') id: string, @Request() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    return this.agendaUseCase.delete(id, req.user.uid, token);
  }
}