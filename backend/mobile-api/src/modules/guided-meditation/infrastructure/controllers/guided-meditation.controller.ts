import { Controller, Get, Param, UseGuards, Req, Optional } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { GetGuidedMeditationsUseCase } from '../../application/use-cases/get-guided-meditations.use-case';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Controller('guided-meditation')
export class GuidedMeditationController {
  constructor(
    private useCase: GetGuidedMeditationsUseCase,
    private systemAuth: SystemAuthService,
  ) {}

  private async resolveToken(req: any): Promise<string> {
    const authHeader = req.headers.authorization;
    if (authHeader) return authHeader.split(' ')[1];
    return this.systemAuth.getMasterToken();
  }

  @Get()
  async getAll(@Req() req: any) {
    const token = await this.resolveToken(req);
    return this.useCase.execute(token);
  }

  @Get('categoria/:categoria')
  async getByCategory(@Param('categoria') categoria: string, @Req() req: any) {
    const token = await this.resolveToken(req);
    return this.useCase.executeByCategory(categoria, token);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any) {
    const token = await this.resolveToken(req);
    return this.useCase.executeById(id, token);
  }
}