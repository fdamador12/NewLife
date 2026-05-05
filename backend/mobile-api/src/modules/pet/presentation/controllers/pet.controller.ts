import { Controller, Get, Post, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { GetPetUseCase } from '../../application/use-cases/get-pet.use-case';
import { AddXpUseCase } from '../../application/use-cases/add-xp.use-case';
import { SelectFormUseCase } from '../../application/use-cases/select-form.use-case';
import { AddXpDto } from '../dtos/add-xp.dto';
import { SelectFormDto } from '../dtos/select-form.dto';

@ApiTags('Pet')
@ApiBearerAuth()
@Controller('pet')
export class PetController {
  constructor(
    private readonly getPetUseCase: GetPetUseCase,
    private readonly addXpUseCase: AddXpUseCase,
    private readonly selectFormUseCase: SelectFormUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Obtener estado actual de la mascota' })
  async getPet(@Request() req: any) {
    return await this.getPetUseCase.execute(req.user.uid);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-xp')
  @ApiOperation({ summary: 'Sumar XP por una acción' })
  async addXp(@Request() req: any, @Body() dto: AddXpDto) {
    return await this.addXpUseCase.execute(
      req.user.uid,
      dto.action,
      dto.nivel,
      dto.subnivel,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('select-form')
  @ApiOperation({ summary: 'Cambiar la mascota equipada' })
  async selectForm(@Request() req: any, @Body() dto: SelectFormDto) {
    return await this.selectFormUseCase.execute(req.user.uid, dto.form);
  }
}