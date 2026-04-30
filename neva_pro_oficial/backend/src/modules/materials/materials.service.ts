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

  async create(data: { title: string; content_url: string; type: string; subject?: string }) {
    return this.prisma.materials.create({
      data: {
        ...data,
        type: data.type as any,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.materials.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.materials.delete({
      where: { id },
    });
  }
}
