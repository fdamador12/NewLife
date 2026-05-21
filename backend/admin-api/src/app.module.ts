import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './modules/admin/admin.module';
import { MotivationModule } from './modules/motivation/motivation.module';
import { CareModule } from './modules/care/care.module';
import { MediaModule } from './modules/media/media.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AdminModule,
    MotivationModule,
    CareModule,
    MediaModule,
    AnalyticsModule,
  ],
})
export class AppModule {}