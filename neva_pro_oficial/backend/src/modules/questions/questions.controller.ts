import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GamificationService } from '../gamification/gamification.service';
import { PrismaService } from '../../core/prisma.service';
import { EnemApiService } from './enem-api.service';

@ApiTags('Questions')
@Controller('questions')
export class QuestionController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService,
    private readonly enemApi: EnemApiService,
  ) {}

  @Get('exams')
  @ApiOperation({ summary: 'Get list of available ENEM exams' })
  async getExams() {
    console.log('[DEBUG] GET /questions/exams called');
    return this.enemApi.getExams();
  }

  @Get('external')
  @ApiOperation({ summary: 'Get questions from external ENEM API' })
  async getExternalQuestions(
    @Query('year') year: number, 
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0
  ) {
    return this.enemApi.getQuestions(year, limit, offset);
  }

  @Get()
  @ApiOperation({ summary: 'List internal questions with pagination' })
  async findAll(@Query('page') page: number = 1, @Query('subject') subject?: string) {
    const skip = (page - 1) * 10;
    return this.prisma.questions.findMany({
      where: { subject },
      take: 10,
      skip,
      include: { question_options: true },
    });
  }

  @Post('external/answer')
  @ApiOperation({ summary: 'Submit an answer to an external question and get XP' })
  async submitExternalAnswer(
    @Body() body: { userId: string; year: number; questionIndex: number; selectedLetter: string },
  ) {
    const isCorrect = await this.enemApi.verifyAnswer(body.year, body.questionIndex, body.selectedLetter);

    // 1. Save Answer (external)
    await this.prisma.answers.create({
      data: {
        user_id: body.userId,
        external_id: `ENEM-${body.year}-${body.questionIndex}`,
        is_correct: isCorrect,
      },
    });

    // 2. Process Gamification if correct
    if (isCorrect) {
      await this.gamificationService.awardXp(body.userId, 50, 'QUESTION_CORRECT');
      await this.gamificationService.updateStreak(body.userId);
    }

    return {
      correct: isCorrect,
      xpGained: isCorrect ? 50 : 0,
    };
  }

  @Post(':id/answer')
  @ApiOperation({ summary: 'Submit an internal answer and get XP' })
  async submitAnswer(
    @Param('id') questionId: string,
    @Body() body: { userId: string; optionId: string },
  ) {
    // ... existing internal logic
    const option = await this.prisma.question_options.findUnique({
      where: { id: body.optionId },
    });

    const isCorrect = option?.is_correct || false;

    await this.prisma.answers.create({
      data: {
        user_id: body.userId,
        question_id: questionId,
        option_id: body.optionId,
        is_correct: isCorrect,
      },
    });

    if (isCorrect) {
      await this.gamificationService.awardXp(body.userId, 50, 'QUESTION_CORRECT');
      await this.gamificationService.updateStreak(body.userId);
    }

    return {
      correct: isCorrect,
      xpGained: isCorrect ? 50 : 0,
      explanation: isCorrect ? 'Parabens! Voce acertou.' : 'Nao foi dessa vez. Estude a explicacao!',
    };
  }
}
