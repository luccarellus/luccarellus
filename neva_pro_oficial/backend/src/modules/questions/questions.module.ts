import { Module } from '@nestjs/common';
import { QuestionController } from './questions.controller';
import { GamificationModule } from '../gamification/gamification.module';
import { EnemApiService } from './enem-api.service';

@Module({
  imports: [GamificationModule],
  controllers: [QuestionController],
  providers: [EnemApiService],
})
export class QuestionModule {}
