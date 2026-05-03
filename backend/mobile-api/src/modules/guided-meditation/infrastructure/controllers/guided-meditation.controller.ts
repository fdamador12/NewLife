import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { GetGuidedMeditationsUseCase } from '../../application/use-cases/get-guided-meditations.use-case';

@Controller('guided-meditation')
@UseGuards(JwtAuthGuard)
export class GuidedMeditationController {
  constructor(private useCase: GetGuidedMeditationsUseCase) {}

  @Get()
  async getAll(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.useCase.execute(token);
  }

  @Get('categoria/:categoria')
  async getByCategory(@Param('categoria') categoria: string, @Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.useCase.executeByCategory(categoria, token);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.useCase.executeById(id, token);
  }
}