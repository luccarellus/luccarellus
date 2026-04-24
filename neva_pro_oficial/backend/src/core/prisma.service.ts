import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LocalMockDatabase } from './mock-database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private mockMode = false;
  private mockDatabase?: LocalMockDatabase;

  constructor() {
    super();

    if (!process.env.DATABASE_URL) {
      this.enableMockMode();
    }
  }

  async onModuleInit() {
    if (this.mockMode) {
      return;
    }

    try {
      await this.$connect();
      console.log('Successfully connected to database');
    } catch (error) {
      console.warn('Could not connect to database. Some features may be unavailable.');
      this.enableMockMode();
    }
  }

  private enableMockMode() {
    if (this.mockMode) return;

    this.mockMode = true;
    this.mockDatabase = new LocalMockDatabase();
    const models = this.mockDatabase.models as Record<string, unknown>;

    for (const [modelName, modelValue] of Object.entries(models)) {
      Object.defineProperty(this, modelName, {
        value: modelValue,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
    console.warn('Prisma mock mode enabled. Using local JSON-backed data instead of a database.');
  }
}
