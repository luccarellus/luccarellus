import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';

@Injectable()
export class MuralService {
  constructor(private readonly prisma: PrismaService) {}

  async getLatestItems(limit: number = 10) {
    return this.prisma.mural.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
    });
  }

  async createItem(data: { title: string; content: string; type: string }) {
    return this.prisma.mural.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
      },
    });
  }
}
