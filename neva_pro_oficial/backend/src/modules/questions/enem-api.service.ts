import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EnemApiService {
  private readonly baseUrl = 'https://api.enem.dev/v1';
  private readonly localDataPath = path.join(process.cwd(), 'data', 'questions-data.json');
  private readonly timeoutMs = 12000;
  private readonly maxRetries = 2;
  private readonly maxPageSize = 50;

  private getLocalData() {
    try {
      const data = fs.readFileSync(this.localDataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  private async fetchWithRetry(url: string, timeoutMs = this.timeoutMs) {
    let lastError: any = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('External API request failed');
  }

  private toLocalPayload(year: number, questions: any[], limit: number, offset: number) {
    const safeLimit = Math.min(this.maxPageSize, Math.max(1, Number(limit || 20)));
    const safeOffset = Math.max(0, Number(offset || 0));
    const paged = questions.slice(safeOffset, safeOffset + safeLimit);

    return {
      metadata: {
        limit: safeLimit,
        offset: safeOffset,
        total: questions.length,
        hasMore: safeOffset + safeLimit < questions.length,
      },
      questions: paged.map((question) => ({
        ...question,
        year: question.year || year,
      })),
    };
  }

  async getExams() {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/exams`);
      return await response.json();
    } catch (error) {
      console.warn('API externa falhou, usando cache local para exames.');
      const local = this.getLocalData();
      const allExams: any[] = [];

      Object.keys(local)
        .map(Number)
        .sort((a, b) => b - a)
        .forEach((year) => {
          if (local[year]?.exams) allExams.push(...local[year].exams);
        });

      return allExams;
    }
  }

  async getQuestions(year: number, limit: number = 20, offset: number = 0) {
    const safeLimit = Math.min(this.maxPageSize, Math.max(1, Number(limit || 20)));
    const safeOffset = Math.max(0, Number(offset || 0));
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/exams/${year}/questions?limit=${safeLimit}&offset=${safeOffset}`);
      return await response.json();
    } catch (error) {
      console.warn(`API externa falhou para questoes de ${year}, usando cache local.`);
      const local = this.getLocalData();

      if (local[year]?.questions) {
        return this.toLocalPayload(year, local[year].questions, safeLimit, safeOffset);
      }

      const allLocalQuestions = Object.keys(local)
        .map(Number)
        .sort((a, b) => b - a)
        .flatMap((localYear) =>
          (local[localYear]?.questions || []).map((question: any) => ({
            ...question,
            year: question.year || localYear,
          })),
        );

      if (allLocalQuestions.length > 0) {
        console.warn(`Ano ${year} nao encontrado localmente. Usando cache combinado (${allLocalQuestions.length} questoes).`);
        return this.toLocalPayload(year, allLocalQuestions, safeLimit, safeOffset);
      }

      return { metadata: { limit: safeLimit, offset: safeOffset, total: 0, hasMore: false }, questions: [] };
    }
  }

  async getQuestionByIndex(year: number, index: number) {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/exams/${year}/questions/${index}`);
      return await response.json();
    } catch (error) {
      const local = this.getLocalData();

      const exactYearQuestion = local[year]?.questions?.find((q: any) => q.index === index);
      if (exactYearQuestion) return exactYearQuestion;

      const nearestQuestion = Object.keys(local)
        .map(Number)
        .sort((a, b) => Math.abs(a - year) - Math.abs(b - year))
        .flatMap((localYear) => local[localYear]?.questions || [])
        .find((q: any) => q.index === index);

      if (nearestQuestion) return nearestQuestion;
      throw new HttpException('Questao nao encontrada', HttpStatus.NOT_FOUND);
    }
  }

  async verifyAnswer(year: number, questionIndex: number, selectedLetter: string): Promise<boolean> {
    try {
      const question = await this.getQuestionByIndex(year, questionIndex);
      return question.correctAlternative === selectedLetter;
    } catch (error) {
      return false;
    }
  }
}
