import { Injectable } from '@nestjs/common';
import { EnemApiService } from '../questions/enem-api.service';

@Injectable()
export class SimuladoService {
  constructor(private readonly enemApi: EnemApiService) {}

  private normalizeDiscipline(discipline: string) {
    const value = String(discipline || '').toLowerCase();
    const aliases: Record<string, string> = {
      humanas: 'ciencias-humanas',
      'ciencias-humanas': 'ciencias-humanas',
      'ciencias-humanas-e-suas-tecnologias': 'ciencias-humanas',
      humanidades: 'ciencias-humanas',
      matematica: 'matematica',
      'matematica-e-suas-tecnologias': 'matematica',
      'ciencias-natureza': 'ciencias-natureza',
      'ciencias-da-natureza': 'ciencias-natureza',
      'ciencias-natureza-e-suas-tecnologias': 'ciencias-natureza',
      linguagens: 'linguagens',
      'linguagens-codigos': 'linguagens',
      'linguagens-e-codigos': 'linguagens',
      'linguagens-e-codigos-e-suas-tecnologias': 'linguagens',
    };

    return aliases[value] || value;
  }

  /**
   * Returns a randomized set of ENEM questions filtered by year and day.
   */
  async getSimuladoQuestions(
    year: number,
    day: number,
    questionCountPerDiscipline: number = 20,
  ): Promise<{ questions: any[]; missingDisciplines: string[]; targetDisciplines: string[] }> {
    const targetDisciplines = day === 1
      ? ['linguagens', 'ciencias-humanas']
      : ['matematica', 'ciencias-natureza'];

    const buckets = new Map(targetDisciplines.map((discipline) => [discipline, [] as any[]]));
    const seen = new Set<string>();
    const pageSize = 50;
    const maxPages = 12;

    const collectFromYear = async (searchYear: number) => {
      for (let offset = 0; offset < pageSize * maxPages; offset += pageSize) {
        const payload = await this.enemApi.getQuestions(searchYear, pageSize, offset);
        const pageQuestions = Array.isArray(payload) ? payload : (payload.questions || []);
        if (!pageQuestions.length) break;

        for (const question of pageQuestions) {
          const normalizedDiscipline = this.normalizeDiscipline(question.discipline);
          if (!buckets.has(normalizedDiscipline)) continue;

          const questionKey = this.getQuestionKey(question, searchYear, normalizedDiscipline);
          if (seen.has(questionKey)) continue;

          const bucket = buckets.get(normalizedDiscipline)!;
          if (bucket.length < questionCountPerDiscipline) {
            bucket.push({ ...question, discipline: normalizedDiscipline });
            seen.add(questionKey);
          }
        }

        const allComplete = targetDisciplines.every((discipline) => buckets.get(discipline)!.length >= questionCountPerDiscipline);
        if (allComplete || pageQuestions.length < pageSize) break;

        if ((payload as any)?.exams && (payload as any)?.questions) {
          break;
        }
      }
    };

    await collectFromYear(year);

    const exams = await this.enemApi.getExams();
    const availableYears = Array.from(
      new Set((Array.isArray(exams) ? exams : []).map((exam: any) => Number(exam.year)).filter(Number.isFinite)),
    ).sort((a, b) => b - a);

    for (const searchYear of availableYears) {
      if (searchYear === year) continue;
      const allComplete = targetDisciplines.every((discipline) => buckets.get(discipline)!.length >= questionCountPerDiscipline);
      if (allComplete) break;
      await collectFromYear(searchYear);
    }

    const missingDisciplines = targetDisciplines.filter((discipline) => buckets.get(discipline)!.length < questionCountPerDiscipline);
    const questions = targetDisciplines.flatMap((discipline) => this.shuffleArray(buckets.get(discipline)!).slice(0, questionCountPerDiscipline));

    return {
      questions,
      missingDisciplines,
      targetDisciplines,
    };
  }

  private getQuestionKey(question: any, year: number, discipline: string) {
    const id = question.id || question.questionId || question.index || question.number;
    return `${year}:${discipline}:${id || question.context || question.title || JSON.stringify(question.alternatives || [])}`;
  }

  private shuffleArray<T>(items: T[]) {
    return [...items].sort(() => Math.random() - 0.5);
  }
}
