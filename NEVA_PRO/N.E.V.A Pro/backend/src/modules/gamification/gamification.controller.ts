import { Controller, Post, Body, Get, Query } from '@nestjs/common';

@Controller('gamification')
export class GamificationController {

  @Post('answer')
  processAnswer(@Body() body: { isCorrect: boolean; consecutiveCorrect?: number }) {
    const { isCorrect, consecutiveCorrect = 0 } = body;

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
  getXpRules() {
    return {
      correctAnswer: 50,
      streakBonus: '10 XP por questão consecutiva correta (máx. +100)',
      seriesBonus: '+100 XP a cada 5 acertos seguidos',
      xpPerLevel: 1000,
    };
  }
}
