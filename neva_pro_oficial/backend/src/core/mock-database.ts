import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

type AnyRecord = Record<string, any>;

type MockState = {
  users: AnyRecord[];
  answers: AnyRecord[];
  xp_logs: AnyRecord[];
  materials: AnyRecord[];
  mural: AnyRecord[];
  questions: AnyRecord[];
  question_options: AnyRecord[];
};

const DEFAULT_STATE: MockState = {
  users: [],
  answers: [],
  xp_logs: [],
  materials: [
    {
      id: 'material-1',
      title: 'Guia rápido do ENEM',
      content_url: 'https://example.com/neva-pro/guia-enem',
      type: 'pdf',
      subject: 'geral',
      created_at: new Date().toISOString(),
    },
    {
      id: 'material-2',
      title: 'Resumo de Matemática',
      content_url: 'https://example.com/neva-pro/resumo-matematica',
      type: 'article',
      subject: 'matematica',
      created_at: new Date().toISOString(),
    },
  ],
  mural: [
    {
      id: 'mural-1',
      title: 'Bem-vindo ao N.E.V.A Pro',
      content: 'Use o modo local para testar login, questões, ranking e perfil sem depender de serviços externos.',
      type: 'INFO',
      created_at: new Date().toISOString(),
    },
    {
      id: 'mural-2',
      title: 'Desafio da semana',
      content: 'Complete uma sequência de estudos para ver a pontuação atualizada no ranking local.',
      type: 'DESAFIO',
      created_at: new Date().toISOString(),
    },
  ],
  questions: [],
  question_options: [],
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function toDateValue(value: any) {
  if (!value) return value;
  const asDate = value instanceof Date ? value : new Date(value);
  return Number.isNaN(asDate.getTime()) ? value : asDate.toISOString();
}

function normalizeString(value: any) {
  return String(value ?? '').toLowerCase().trim();
}

function matchesWhere(row: AnyRecord, where?: AnyRecord): boolean {
  if (!where || Object.keys(where).length === 0) return true;

  if (Array.isArray(where.OR)) {
    return where.OR.some((condition) => matchesWhere(row, condition));
  }

  return Object.entries(where).every(([key, expected]) => {
    if (expected === undefined) return true;
    if (key === 'OR') return true;

    const current = row[key];

    if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
      if ('in' in expected && Array.isArray(expected.in)) {
        return expected.in.includes(current);
      }
      if ('contains' in expected) {
        return normalizeString(current).includes(normalizeString(expected.contains));
      }
      if ('equals' in expected) {
        return normalizeString(current) === normalizeString(expected.equals);
      }
      return matchesWhere(current || {}, expected);
    }

    if (typeof current === 'string' || typeof expected === 'string') {
      return normalizeString(current) === normalizeString(expected);
    }

    return current === expected;
  });
}

function sortRecords(records: AnyRecord[], orderBy?: AnyRecord) {
  if (!orderBy || typeof orderBy !== 'object') return records;
  const [field, directionRaw] = Object.entries(orderBy)[0] || [];
  const direction = String(directionRaw || 'asc').toLowerCase();
  if (!field) return records;

  return [...records].sort((a, b) => {
    const left = a[field];
    const right = b[field];
    if (left === right) return 0;
    if (left === undefined || left === null) return 1;
    if (right === undefined || right === null) return -1;
    if (left > right) return direction === 'desc' ? -1 : 1;
    if (left < right) return direction === 'desc' ? 1 : -1;
    return 0;
  });
}

function applyPagination(records: AnyRecord[], take?: number, skip?: number) {
  const safeSkip = Math.max(0, Number(skip || 0));
  const safeTake = typeof take === 'number' ? Math.max(0, take) : undefined;
  const sliced = records.slice(safeSkip);
  return typeof safeTake === 'number' ? sliced.slice(0, safeTake) : sliced;
}

function normalizeDiscipline(value: any) {
  const normalized = normalizeString(value);
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

  return aliases[normalized] || normalized;
}

function loadQuestionsSeed() {
  const candidates = [
    path.join(process.cwd(), 'data', 'questions-data.json'),
    path.join(process.cwd(), 'src', 'modules', 'questions', 'data', 'questions-data.json'),
  ];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;

    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      const questions: AnyRecord[] = [];
      const questionOptions: AnyRecord[] = [];

      Object.entries(parsed || {}).forEach(([year, yearPayload]: [string, any]) => {
        const yearNumber = Number(year);
        const yearQuestions = Array.isArray(yearPayload?.questions) ? yearPayload.questions : [];

        yearQuestions.forEach((question: any) => {
          const questionId = `mock-${yearNumber}-${question.index}`;
          const alternatives = Array.isArray(question.alternatives) ? question.alternatives : [];

          questions.push({
            id: questionId,
            text: [question.context, question.alternativesIntroduction].filter(Boolean).join('\n\n'),
            explanation: question.explanation || null,
            subject: normalizeDiscipline(question.discipline) || 'geral',
            difficulty: 'MEDIUM',
            year: yearNumber,
            index: question.index,
            context: question.context || '',
            alternativesIntroduction: question.alternativesIntroduction || '',
            correctAlternative: question.correctAlternative || null,
            created_at: new Date().toISOString(),
          });

          alternatives.forEach((alternative: any, idx: number) => {
            const label = alternative.letter || String.fromCharCode(65 + idx);
            questionOptions.push({
              id: `mock-${yearNumber}-${question.index}-${label}`,
              question_id: questionId,
              text: alternative.text || '',
              is_correct: Boolean(alternative.isCorrect),
              label,
            });
          });
        });
      });

      return { questions, questionOptions };
    } catch {
      // Try next path.
    }
  }

  return { questions: [], questionOptions: [] };
}

export class LocalMockDatabase {
  private readonly statePath = path.join(process.cwd(), 'data', 'mock-db.json');
  private state: MockState;

  constructor() {
    this.state = this.loadState();
    const seeded = loadQuestionsSeed();
    if (this.state.questions.length === 0 && seeded.questions.length > 0) {
      this.state.questions = seeded.questions;
    }
    if (this.state.question_options.length === 0 && seeded.questionOptions.length > 0) {
      this.state.question_options = seeded.questionOptions;
    }
    this.persist();
  }

  get models() {
    return {
      users: this.createUsersModel(),
      answers: this.createAnswersModel(),
      xp_logs: this.createXpLogsModel(),
      materials: this.createMaterialsModel(),
      mural: this.createMuralModel(),
      questions: this.createQuestionsModel(),
      question_options: this.createQuestionOptionsModel(),
      simulados: this.createEmptyModel('simulados'),
      simulado_questions: this.createEmptyModel('simulado_questions'),
      badges: this.createEmptyModel('badges'),
      user_badges: this.createEmptyModel('user_badges'),
    };
  }

  private loadState(): MockState {
    if (fs.existsSync(this.statePath)) {
      try {
        const raw = fs.readFileSync(this.statePath, 'utf8');
        const parsed = JSON.parse(raw);
        return {
          users: Array.isArray(parsed.users) ? parsed.users : [],
          answers: Array.isArray(parsed.answers) ? parsed.answers : [],
          xp_logs: Array.isArray(parsed.xp_logs) ? parsed.xp_logs : [],
          materials: Array.isArray(parsed.materials) ? parsed.materials : clone(DEFAULT_STATE.materials),
          mural: Array.isArray(parsed.mural) ? parsed.mural : clone(DEFAULT_STATE.mural),
          questions: Array.isArray(parsed.questions) ? parsed.questions : [],
          question_options: Array.isArray(parsed.question_options) ? parsed.question_options : [],
        };
      } catch {
        // Fall through to defaults.
      }
    }

    return clone(DEFAULT_STATE);
  }

  private persist() {
    try {
      fs.mkdirSync(path.dirname(this.statePath), { recursive: true });
      fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2), 'utf8');
    } catch {
      // Local cache is best-effort only.
    }
  }

  private generateId(prefix = 'mock') {
    if (typeof crypto.randomUUID === 'function') {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private attachQuestionOptions(question: AnyRecord) {
    return {
      ...question,
      question_options: this.state.question_options.filter((option) => option.question_id === question.id),
    };
  }

  private createEmptyModel(name: string) {
    return {
      findMany: async () => [],
      findUnique: async () => null,
      create: async (data: AnyRecord) => {
        const created = { id: this.generateId(name), ...data?.data };
        return created;
      },
    };
  }

  private createUsersModel() {
    return {
      findUnique: async ({ where, include }: AnyRecord) => {
        const user = this.state.users.find((entry) => matchesWhere(entry, where));
        if (!user) return null;

        if (include?._count?.select?.answers) {
          const correctAnswers = this.state.answers.filter(
            (answer) => answer.user_id === user.id && answer.is_correct === true,
          ).length;
          return {
            ...clone(user),
            _count: {
              answers: correctAnswers,
            },
          };
        }

        return clone(user);
      },
      findFirst: async ({ where }: AnyRecord) => {
        const user = this.state.users.find((entry) => matchesWhere(entry, where));
        return user ? clone(user) : null;
      },
      create: async ({ data }: AnyRecord) => {
        const now = new Date().toISOString();
        const created = {
          id: this.generateId('user'),
          level: 1,
          total_xp: 0,
          current_streak: 0,
          created_at: now,
          updated_at: now,
          last_activity_at: null,
          ...data,
          email: normalizeString(data?.email),
          password_hash: data?.password_hash || data?.password || '',
        };
        delete created.password;
        this.state.users.push(created);
        this.persist();
        return clone(created);
      },
      update: async ({ where, data }: AnyRecord) => {
        const userIndex = this.state.users.findIndex((entry) => matchesWhere(entry, where));
        if (userIndex === -1) throw new Error('User not found');

        const current = this.state.users[userIndex];
        const next = { ...current };

        for (const [key, value] of Object.entries(data || {})) {
          if (value && typeof value === 'object' && 'increment' in value) {
            next[key] = Number(next[key] || 0) + Number((value as AnyRecord).increment || 0);
          } else if (key === 'email' && typeof value === 'string') {
            next[key] = normalizeString(value);
          } else if (key === 'last_activity_at') {
            next[key] = toDateValue(value);
          } else {
            next[key] = value;
          }
        }

        next.updated_at = new Date().toISOString();
        this.state.users[userIndex] = next;
        this.persist();
        return clone(next);
      },
    };
  }

  private createAnswersModel() {
    return {
      create: async ({ data }: AnyRecord) => {
        const created = {
          id: this.generateId('answer'),
          created_at: new Date().toISOString(),
          ...data,
        };
        this.state.answers.push(created);
        this.persist();
        return clone(created);
      },
      findMany: async ({ where }: AnyRecord = {}) => {
        const answers = this.state.answers.filter((entry) => matchesWhere(entry, where));
        return clone(answers);
      },
    };
  }

  private createXpLogsModel() {
    return {
      create: async ({ data }: AnyRecord) => {
        const created = {
          id: this.generateId('xp'),
          created_at: new Date().toISOString(),
          ...data,
        };
        this.state.xp_logs.push(created);
        this.persist();
        return clone(created);
      },
    };
  }

  private createMaterialsModel() {
    return {
      findMany: async ({ where, orderBy }: AnyRecord = {}) => {
        const records = this.state.materials.filter((entry) => matchesWhere(entry, where));
        return clone(sortRecords(records, orderBy));
      },
      findUnique: async ({ where }: AnyRecord) => {
        const record = this.state.materials.find((entry) => matchesWhere(entry, where));
        return record ? clone(record) : null;
      },
    };
  }

  private createMuralModel() {
    return {
      findMany: async ({ take, orderBy }: AnyRecord = {}) => {
        const records = sortRecords(this.state.mural, orderBy);
        return clone(applyPagination(records, take));
      },
      create: async ({ data }: AnyRecord) => {
        const created = {
          id: this.generateId('mural'),
          created_at: new Date().toISOString(),
          ...data,
        };
        this.state.mural.push(created);
        this.persist();
        return clone(created);
      },
    };
  }

  private createQuestionsModel() {
    return {
      findMany: async ({ where, take, skip, include, orderBy }: AnyRecord = {}) => {
        const records = this.state.questions.filter((entry) => matchesWhere(entry, where));
        const paged = applyPagination(sortRecords(records, orderBy), take, skip);

        if (include?.question_options) {
          return clone(paged.map((question) => this.attachQuestionOptions(question)));
        }

        return clone(paged);
      },
      findUnique: async ({ where, include }: AnyRecord) => {
        const record = this.state.questions.find((entry) => matchesWhere(entry, where));
        if (!record) return null;
        if (include?.question_options) {
          return clone(this.attachQuestionOptions(record));
        }
        return clone(record);
      },
    };
  }

  private createQuestionOptionsModel() {
    return {
      findUnique: async ({ where }: AnyRecord) => {
        const record = this.state.question_options.find((entry) => matchesWhere(entry, where));
        return record ? clone(record) : null;
      },
      findFirst: async ({ where }: AnyRecord) => {
        const record = this.state.question_options.find((entry) => matchesWhere(entry, where));
        return record ? clone(record) : null;
      },
    };
  }
}
