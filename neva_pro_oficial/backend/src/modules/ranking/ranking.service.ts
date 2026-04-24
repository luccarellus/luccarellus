import { Injectable } from '@nestjs/common';

const MOCK_USERS = [
  { id: '1', name: 'Ana Carolina',    initials: 'AC', totalXp: 18450, level: 18, accuracy: 91, questionsAnswered: 620 },
  { id: '2', name: 'Bruno Mello',     initials: 'BM', totalXp: 15200, level: 15, accuracy: 88, questionsAnswered: 540 },
  { id: '3', name: 'Carlos Eduardo',  initials: 'CE', totalXp: 12800, level: 12, accuracy: 85, questionsAnswered: 480 },
  { id: '4', name: 'Daniela Ferreira',initials: 'DF', totalXp: 11000, level: 11, accuracy: 82, questionsAnswered: 420 },
  { id: '5', name: 'Eduardo Lima',    initials: 'EL', totalXp: 9800,  level: 9,  accuracy: 79, questionsAnswered: 380 },
  { id: '6', name: 'Fernanda Souza',  initials: 'FS', totalXp: 8600,  level: 8,  accuracy: 76, questionsAnswered: 340 },
  { id: '7', name: 'Gabriel Nunes',   initials: 'GN', totalXp: 7200,  level: 7,  accuracy: 73, questionsAnswered: 300 },
  { id: '8', name: 'Helena Costa',    initials: 'HC', totalXp: 6100,  level: 6,  accuracy: 70, questionsAnswered: 260 },
  { id: '9', name: 'Igor Santos',     initials: 'IS', totalXp: 5400,  level: 5,  accuracy: 67, questionsAnswered: 220 },
  { id: '10', name: 'Julia Pereira',  initials: 'JP', totalXp: 4800,  level: 4,  accuracy: 64, questionsAnswered: 190 },
  { id: '11', name: 'Kevin Alves',    initials: 'KA', totalXp: 4200,  level: 4,  accuracy: 61, questionsAnswered: 170 },
  { id: '12', name: 'Laura Martins',  initials: 'LM', totalXp: 3600,  level: 3,  accuracy: 58, questionsAnswered: 150 },
  { id: '13', name: 'Marcos Rocha',   initials: 'MR', totalXp: 3000,  level: 3,  accuracy: 55, questionsAnswered: 130 },
  { id: '14', name: 'Natalia Braga',  initials: 'NB', totalXp: 2400,  level: 2,  accuracy: 52, questionsAnswered: 110 },
  { id: '15', name: 'Olivia Torres',  initials: 'OT', totalXp: 1800,  level: 1,  accuracy: 49, questionsAnswered: 90 },
];

@Injectable()
export class RankingService {
  private normalizeUser(user: (typeof MOCK_USERS)[number], rank: number) {
    return {
      id: user.id,
      username: user.name,
      initials: user.initials,
      xp: user.totalXp,
      level: user.level,
      accuracy: user.accuracy,
      questionsAnswered: user.questionsAnswered,
      rank,
    };
  }

  async getTopUsers(limit: number = 10) {
    return MOCK_USERS.slice(0, limit).map((u, i) => this.normalizeUser(u, i + 1));
  }

  async getUserRank(userId: string) {
    const idx = MOCK_USERS.findIndex(u => u.id === userId);
    if (idx === -1) return { rank: MOCK_USERS.length + 1, score: 0 };
    return { rank: idx + 1, score: MOCK_USERS[idx].totalXp };
  }

  async updateUserScore(userId: string, score: number) {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) user.totalXp = score;
  }

  async getAllUsers() {
    return MOCK_USERS.map((u, i) => this.normalizeUser(u, i + 1));
  }
}
