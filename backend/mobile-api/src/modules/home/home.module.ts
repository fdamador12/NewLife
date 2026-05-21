import { Module } from '@nestjs/common';
import { HomeController } from './presentation/controllers/home.controller';
import { GetSobrietyTimeUseCase } from './application/use-cases/get-sobriety-time.use-case';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { ProgressModule } from '../progress/progress.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, ProgressModule, UsersModule],
  controllers: [HomeController],
  providers: [GetSobrietyTimeUseCase],
  exports: [GetSobrietyTimeUseCase],
})
export class HomeModule {}