import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { ParentModule } from './parent/parent.module';
import { TeacherModule } from './teacher/teacher.module';
import { ConsentModule } from './consent/consent.module';
import { ActivityModule } from './activity/activity.module';
import { GamesModule } from './games/games.module';
import { ProtectionModule } from './protection/protection.module';
import { SandboxModule } from './sandbox/sandbox.module';
import { ChatModule } from './chat/chat.module';
import { CommonModule } from './common/common.module';

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ✅ MongoDB only
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    CommonModule,
    AuthModule,
    ParentModule,
    TeacherModule,
    ConsentModule,
    ActivityModule,
    GamesModule,
    ProtectionModule,
    SandboxModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
