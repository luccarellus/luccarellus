import { Controller, Post, Body } from '@nestjs/common';
import { SimuladoService } from './simulado.service';

@Controller('simulados')
export class SimuladosController {
  constructor(private readonly simuladoService: SimuladoService) {}

  @Post('start')
  async startSimulado(
    @Body() body: { year: number; day: number; questionCountPerDiscipline?: number },
  ) {
    const year = Number(body.year);
    const day = Number(body.day);
    const questionCountPerDiscipline = Number(body.questionCountPerDiscipline || 20);

    const { questions, missingDisciplines, targetDisciplines } = await this.simuladoService.getSimuladoQuestions(
      year,
      day,
      questionCountPerDiscipline,
    );

    const timeLimitSeconds = day === 1 ? (5 * 3600 + 30 * 60) : 5 * 3600;

    return {
      simuladoId: `sim_${Date.now()}`,
      year,
      day,
      targetDisciplines,
      questions,
      totalQuestions: questions.length,
      timeLimitSeconds,
      questionCountPerDiscipline,
      missingDisciplines,
      startedAt: new Date().toISOString(),
    };
  }

  @Post('finish')
  finishSimulado(@Body() body: { correct: number; total: number; timeUsedSeconds: number; day: number }) {
    const { correct, total, timeUsedSeconds, day } = body;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    let xpEarned = correct * 50;
    if (accuracy >= 80) xpEarned += 200;
    if (accuracy === 100) xpEarned += 300;

    return {
      correct,
      total,
      accuracy,
      xpEarned,
      timeUsedSeconds,
      day,
      medal: accuracy >= 90 ? 'gold' : accuracy >= 70 ? 'silver' : accuracy >= 50 ? 'bronze' : null,
      message: accuracy >= 80
        ? '🏆 Excelente desempenho! Continue assim!'
        : accuracy >= 60
        ? '📚 Bom resultado! Revise os erros.'
        : '💪 Continue praticando! Você vai melhorar!',
      completedAt: new Date().toISOString(),
    };
  }
}
