import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Gamification')
@Controller('gamification')
@ApiBearerAuth()
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('answer')
  @ApiOperation({ summary: 'Process a question answer and award XP' })
  async processAnswer(@Request() req, @Body() body: { isCorrect: boolean; consecutiveCorrect?: number }) {
    const { isCorrect, consecutiveCorrect = 0 } = body;
    const userId = req.user.userId;

    let xpEarned = 0;
    let reason = '';
    let message = '';

    if (isCorrect) {
      xpEarned = 50;
      reason = 'QUESTION_CORRECT';
      message = 'Resposta correta!';

      const streak = consecutiveCorrect + 1;
      if (streak > 1) {
        const bonus = Math.min(streak * 10, 100);
        xpEarned += bonus;
        reason = `STREAK_${streak}`;
        message = `${streak}x em sequência! Bônus de ${bonus} XP!`;
      }

      if (streak % 5 === 0) {
        xpEarned += 100;
        reason = 'SERIE_BONUS';
        message = `🔥 Incrível! ${streak} acertos seguidos! Bônus de série!`;
      }

      // Award XP in DB
      await this.gamificationService.awardXp(userId, xpEarned, reason);
      // Increment questions solved (assuming we add this to users table or a separate stats table)
      // For now, let's just update the user record
      await this.gamificationService.updateStreak(userId);
    } else {
      reason = 'QUESTION_WRONG';
      message = 'Resposta incorreta. Continue tentando!';
    }

    return {
      isCorrect,
      xpEarned,
      reason,
      message,
    };
  }

  @Get('xp-rules')
  @ApiOperation({ summary: 'Get XP awarding rules' })
  getXpRules() {
    return {
      correctAnswer: 50,
      streakBonus: '10 XP por questão consecutiva correta (máx. +100)',
      seriesBonus: '+100 XP a cada 5 acertos seguidos',
      xpPerLevel: 1000,
    };
  }
}
