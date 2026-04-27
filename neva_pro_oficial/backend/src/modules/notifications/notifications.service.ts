import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';

type NotificationSeed = {
  title: string;
  content: string;
  type: string;
  link?: string | null;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private getSeedItems(): NotificationSeed[] {
    return [
      {
        title: 'Bem-vindo ao N.E.V.A Pro',
        content: 'Seu painel foi ativado com sucesso. Explore questões, simulados e materiais no seu ritmo.',
        type: 'welcome',
        link: 'index.html',
      },
      {
        title: 'Meta diária em acompanhamento',
        content: 'Você ainda pode avançar na sua meta de estudos de hoje e manter sua sequência ativa.',
        type: 'goal',
        link: 'index.html',
      },
      {
        title: 'Novo material disponível',
        content: 'Uma nova trilha de revisão foi publicada para reforçar a preparação da semana.',
        type: 'material',
        link: 'materiais.html',
      },
      {
        title: 'Simulado recomendado',
        content: 'Há um simulado sugerido esperando por você no calendário de estudos.',
        type: 'simulado',
        link: 'simulado.html',
      },
    ];
  }

  private async ensureSeedNotifications(userId: string) {
    const existingCount = await this.prisma.notifications.count({
      where: { user_id: userId },
    });

    if (existingCount > 0) return;

    const now = new Date();
    const seeds = this.getSeedItems();

    for (const [index, seed] of seeds.entries()) {
      await this.prisma.notifications.create({
        data: {
          user_id: userId,
          title: seed.title,
          content: seed.content,
          type: seed.type,
          link: seed.link || null,
          is_read: index > 0,
          read_at: index > 0 ? now.toISOString() : null,
        },
      });
    }
  }

  async listForUser(userId: string) {
    await this.ensureSeedNotifications(userId);

    const items = await this.prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    const unreadCount = items.filter((item) => !item.is_read).length;
    return { items, unread_count: unreadCount };
  }

  async markAsRead(userId: string, notificationId: string) {
    const current = await this.prisma.notifications.findFirst({
      where: { id: notificationId, user_id: userId },
    });

    if (!current) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notifications.update({
      where: { id: notificationId },
      data: {
        is_read: true,
        read_at: new Date().toISOString(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: {
        is_read: true,
        read_at: new Date().toISOString(),
      },
    });

    return { updated: result.count };
  }
}
