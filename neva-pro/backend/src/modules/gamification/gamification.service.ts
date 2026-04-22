import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';
import { RankingService } from '../ranking/ranking.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class GamificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rankingService: RankingService,
    // @InjectQueue('gamification') private readonly gamificationQueue: Queue,
  ) {}

  /**
   * Calculates and awards XP to a user
   */
  async awardXp(userId: string, amount: number, reason: string) {
    // 1. Log XP Event
    await this.prisma.xp_logs.create({
      data: {
          user_id: userId,
          amount,
          reason,
      },
    });

    // 2. Update User Profile
    const user = await this.prisma.users.update({
      where: { id: userId },
      data: { 
        total_xp: { increment: amount },
        last_activity_at: new Date()
      },
    });

    // 3. Update Redis Ranking
    await this.rankingService.updateUserScore(userId, user.total_xp);

    // 4. Check for Level Up (Logica simples: 1000 XP por level)
    const newLevel = Math.floor(user.total_xp / 1000) + 1;
    if (newLevel > user.level) {
      await this.prisma.users.update({
        where: { id: userId },
        data: { level: newLevel },
      });
      // Emit Notification (Simbolico)
    }

    // 5. Asynchronously check for badges
    // await this.gamificationQueue.add('check-badges', { userId });

    return user;
  }

  /**
   * Updates user streak based on consecutive activity
   */
  async updateStreak(userId: string) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) return;

    const lastActivity = user.last_activity_at;
    const now = new Date();
    
    if (!lastActivity) {
      await this.prisma.users.update({ where: { id: userId }, data: { current_streak: 1 } });
      return;
    }

    const diffHours = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    if (diffHours < 48) {
      // Menos de 48h desde a ultima atividade = manteve ou incrementou
      if (diffHours >= 24) {
        await this.prisma.users.update({ where: { id: userId }, data: { current_streak: { increment: 1 } } });
      }
    } else {
      // Mais de 48h = resetou a streak
      await this.prisma.users.update({ where: { id: userId }, data: { current_streak: 1 } });
    }
  }
}
