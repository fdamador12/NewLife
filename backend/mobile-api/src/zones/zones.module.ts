import { Module } from '@nestjs/common';
import { ZonesController } from './presentation/controllers/zones.controller';
import { CreateZoneUseCase } from './application/use-cases/create-zone.use-case';
import { GetZonesUseCase } from './application/use-cases/get-zones.use-case';
import { DeleteZoneUseCase } from './application/use-cases/delete-zone.use-case';
import { DatabaseModule } from '../modules/database/database.module';
import { AuthModule } from '../modules/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ZonesController],
  providers: [CreateZoneUseCase, GetZonesUseCase, DeleteZoneUseCase],
})
export class ZonesModule {}