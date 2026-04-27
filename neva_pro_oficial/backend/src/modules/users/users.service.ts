import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            answers: {
              where: { is_correct: true }
            }
          }
        }
      }
    });

    if (!user) return null;

    return {
      ...user,
      questions_resolved: user._count.answers
    };
  }

  async findByEmail(email: string) {
    const normalizedEmail = email.toLowerCase();
    return this.prisma.users.findFirst({
      where: {
        OR: [
          { email },
          { email: normalizedEmail },
        ],
      },
    });
  }

  async create(data: {
    name: string;
    email: string;
    password_hash?: string;
    avatar_url?: string;
  }) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = data.password_hash
      ? await bcrypt.hash(data.password_hash, salt)
      : await bcrypt.hash(`${Date.now()}-${Math.random().toString(16).slice(2)}`, salt);

    return this.prisma.users.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
        password_hash: hashedPassword,
        level: 1,
        total_xp: 0,
        current_streak: 0,
      },
    });
  }

  async update(id: string, data: any) {
    const allowedData: Record<string, any> = {};

    if (typeof data?.name === 'string') {
      allowedData.name = data.name.trim();
    }

    if (typeof data?.avatar_url === 'string') {
      allowedData.avatar_url = data.avatar_url;
    }

    return this.prisma.users.update({
      where: { id },
      data: allowedData,
    });
  }
}
