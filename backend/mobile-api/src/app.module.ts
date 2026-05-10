import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CareModule } from './modules/care/care.module';
import { HomeModule } from './modules/home/home.module';
import { ProgressModule } from './modules/progress/progress.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CareModule,
    HomeModule,
    ProgressModule,
    CommunitiesModule,
    ChatModule,
  ],
})
export class AppModule { }