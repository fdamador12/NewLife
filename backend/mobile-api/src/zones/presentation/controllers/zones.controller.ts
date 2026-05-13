import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../../modules/auth/presentation/guards/jwt-auth.guard';
import { CreateZoneUseCase } from '../../application/use-cases/create-zone.use-case';
import { GetZonesUseCase } from '../../application/use-cases/get-zones.use-case';
import { DeleteZoneUseCase } from '../../application/use-cases/delete-zone.use-case';
import { CreateZoneDto } from '../dtos/zone.dto';

@Controller('zones')
@UseGuards(JwtAuthGuard)
export class ZonesController {
  constructor(
    private createZone: CreateZoneUseCase,
    private getZones: GetZonesUseCase,
    private deleteZone: DeleteZoneUseCase,
  ) {}

  @Get()
  getAll(@Req() req: any) {
    return this.getZones.execute(req.user.uid);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateZoneDto) {
    return this.createZone.execute(req.user.uid, dto);
  }

  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    return this.deleteZone.execute(req.user.uid, id);
  }
}