import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RankingModule } from './modules/ranking/ranking.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/users.module';
import { QuestionModule } from './modules/questions/questions.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { NotificationModule } from './modules/notifications/notifications.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { SimuladoModule } from './modules/simulados/simulados.module';
import { PrismaModule } from './core/prisma.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    /*
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    */
    AuthModule,
    UserModule,
    QuestionModule,
    RankingModule,
    GamificationModule,
    NotificationModule,
    MaterialsModule,
    SimuladoModule,
  ],
})
export class AppModule {}
