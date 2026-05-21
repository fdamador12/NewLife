import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../admin/presentation/guards/admin-jwt.guard';
import { RolesGuard, Roles } from '../../../admin/presentation/guards/roles.guard';
import { UserRole } from '../../../admin/domain/entities/admin-user.entity';
import { GetAllFrasesUseCase } from '../../application/use-cases/get-all-frases.use-case';
import { GetFraseDiaByDateUseCase } from '../../application/use-cases/get-frase-dia-by-date.use-case';
import { CreateFraseDiaUseCase } from '../../application/use-cases/create-frase-dia.use-case';
import { UpdateFraseDiaUseCase } from '../../application/use-cases/update-frase-dia.use-case';
import { CreateFraseDiaDto, UpdateFraseDiaDto, CreateFraseDiaBulkDto } from '../dtos/frase-dia.dto';

@ApiTags('Admin — Frases del Día')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
@Controller('api/web/admin/frases-dia')
export class FraseDiaController {
  constructor(
    private readonly getAllFrasesUseCase: GetAllFrasesUseCase,
    private readonly getFraseDiaByDateUseCase: GetFraseDiaByDateUseCase,
    private readonly createFraseDiaUseCase: CreateFraseDiaUseCase,
    private readonly updateFraseDiaUseCase: UpdateFraseDiaUseCase,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Listar todas las frases del día registradas' })
  async getAll() {
    return this.getAllFrasesUseCase.execute();
  }

  @Get('fecha/:dia')
  @ApiOperation({ summary: 'Obtener la frase de una fecha específica (YYYY-MM-DD)' })
  async getByDate(@Param('dia') dia: string) {
    return this.getFraseDiaByDateUseCase.execute(dia);
  }

  @Post()
  @ApiOperation({ summary: 'Programar una nueva frase para un día específico' })
  async create(@Body() dto: CreateFraseDiaDto) {
    return this.createFraseDiaUseCase.execute({
      frase: dto.frase,
      dia: dto.dia,
    });
  }

  // Endpoint para Carga Masiva
  @Post('bulk')
  @ApiOperation({ summary: 'Programar múltiples frases de forma masiva' })
  async createBulk(@Body() dto: CreateFraseDiaBulkDto) {
    let insertadas = 0;
    
    for (const item of dto.frases) {
      try {
        await this.createFraseDiaUseCase.execute({
          frase: item.frase,
          dia: item.dia,
        });
        insertadas++;
      } catch (error) {
        // Si una frase falla (ej. día duplicado), la saltamos y seguimos con las demás
        console.warn(`[Bulk Import] Se omitió la frase del día ${item.dia}`);
      }
    }
    
    return { insertadas, totalProcesadas: dto.frases.length };
  }

  @Patch('fecha/:dia')
  @ApiOperation({ summary: 'Modificar el texto o la fecha de una frase buscándola por su fecha actual' })
  async update(
    @Param('dia') diaActual: string,
    @Body() dto: UpdateFraseDiaDto
  ) {
    return this.updateFraseDiaUseCase.execute(diaActual, {
      frase: dto.frase,
      dia: dto.dia,
    });
  }
}