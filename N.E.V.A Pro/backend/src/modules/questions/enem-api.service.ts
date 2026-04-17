import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EnemApiService {
  private readonly baseUrl = 'https://api.enem.dev/v1';
  private readonly localDataPath = path.join(process.cwd(), 'data', 'questions-data.json');

  private getLocalData() {
    try {
      const data = fs.readFileSync(this.localDataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  async getExams() {
    try {
      const response = await fetch(`${this.baseUrl}/exams`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(3000) // 3s timeout
      });
      if (!response.ok) throw new Error();
      return await response.json();
    } catch (error) {
      console.warn('API Externa falhou, usando cache local para Exames.');
      const local = this.getLocalData();
      // Flatten all exams, ordered from newest to oldest
      const allExams = [];
      Object.keys(local)
        .map(Number)
        .sort((a, b) => b - a)
        .forEach(year => {
          if (local[year]?.exams) allExams.push(...local[year].exams);
        });
      return allExams;
    }
  }

  async getQuestions(year: number, limit: number = 20, offset: number = 0) {
    try {
      const response = await fetch(`${this.baseUrl}/exams/${year}/questions?limit=${limit}&offset=${offset}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000) // 5s timeout
      });
      if (!response.ok) throw new Error();
      return await response.json();
    } catch (error) {
      console.warn(`API Externa falhou para questões de ${year}, usando cache local.`);
      const local = this.getLocalData();
      // Return exact year if available, otherwise fall back to nearest available year
      if (local[year]) return local[year];
      const availableYears = Object.keys(local).map(Number).sort((a, b) => Math.abs(a - year) - Math.abs(b - year));
      if (availableYears.length > 0) {
        console.warn(`Ano ${year} não encontrado localmente. Usando ${availableYears[0]} como substituto.`);
        return local[availableYears[0]];
      }
      return { questions: [] };
    }
  }

  async getQuestionByIndex(year: number, index: number) {
    try {
      const response = await fetch(`${this.baseUrl}/exams/${year}/questions/${index}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(3000)
      });
      if (!response.ok) throw new Error();
      return await response.json();
    } catch (error) {
      const local = this.getLocalData();
      const question = local[year]?.questions?.find(q => q.index === index);
      if (question) return question;
      throw new HttpException('Questão não encontrada', HttpStatus.NOT_FOUND);
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
