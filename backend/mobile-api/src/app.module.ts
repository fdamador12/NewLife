import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CareModule } from './modules/care/care.module';
import { HomeModule } from './modules/home/home.module';
import { ProgressModule } from './modules/progress/progress.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { MotivationModule } from './modules/motivation/motivation.module';
import { SosModule } from './modules/sos/sos.module';
import { GuidedMeditationModule } from './modules/guided-meditation/guided-meditation.module';
import { PetModule } from './modules/pet/pet.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ZonesModule } from './zones/zones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CareModule,
    HomeModule,
    ProgressModule,
    CommunitiesModule,
    MotivationModule,
    SosModule,
    GuidedMeditationModule,
    PetModule,
    AnalyticsModule,
    ZonesModule,
  ],
})
export class AppModule {}