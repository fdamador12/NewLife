import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { GetPublishedContenidoUseCase } from '../../application/use-cases/get-published-contenido.use-case';
import { ManageFavoritosUseCase } from '../../application/use-cases/manage-favoritos.use-case';

@ApiTags('Cuidado — Contenido Educativo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('care/contenido')
export class ContenidoMobileController {
  constructor(
    private readonly getContenidoUseCase: GetPublishedContenidoUseCase,
    private readonly manageFavoritos: ManageFavoritosUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todo el contenido publicado y ver si el usuario le ha dado corazón' })
  findAll(@Request() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    return this.getContenidoUseCase.execute(req.user.uid, token);
  }

  @Get('favoritos')
  @ApiOperation({ summary: 'Obtener la lista de artículos y videos guardados' })
  getFavoritos(@Request() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    return this.manageFavoritos.getFavoritos(req.user.uid, token);
  }

  @Post(':id/favorito')
  @ApiOperation({ summary: 'Darle corazón a un artículo/video' })
  addFavorito(@Param('id') id: string, @Request() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    return this.manageFavoritos.addFavorito(req.user.uid, id, token);
  }

  @Delete(':id/favorito')
  @ApiOperation({ summary: 'Quitarle el corazón' })
  removeFavorito(@Param('id') id: string, @Request() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    return this.manageFavoritos.removeFavorito(req.user.uid, id, token);
  }
}