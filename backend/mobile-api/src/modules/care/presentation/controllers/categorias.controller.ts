import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { GetCategoriasUseCase } from '../../application/use-cases/get-categorias.use-case';
import { GetContenidoPorCategoriaUseCase } from '../../application/use-cases/get-contenido-por-categoria.use-case';

@ApiTags('Cuidado — Categorías')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('care/categorias')
export class CategoriasController {
  constructor(
    private readonly getCategoriasUseCase: GetCategoriasUseCase,
    private readonly getContenidoPorCategoria: GetContenidoPorCategoriaUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener lista de categorías de contenido con contador' })
  findAll() {
    return this.getCategoriasUseCase.execute();
  }

  @Get(':id/contenido')
  @ApiOperation({ summary: 'Obtener contenido de una categoría específica' })
  getContenidoByCategoria(
    @Param('id') categoriaId: string,
    @Query('limit') limit?: string,
    @Request() req?: any
  ) {
    const token = req?.headers?.authorization?.split(' ')[1];
    const userId = req?.user?.uid;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    
    return this.getContenidoPorCategoria.execute(userId, categoriaId, token, limitNum);
  }
}