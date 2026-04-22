import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(type?: string, subject?: string) {
    return this.prisma.materials.findMany({
      where: {
        type: type as any,
        subject,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.materials.findUnique({
      where: { id },
    });
  }
}
