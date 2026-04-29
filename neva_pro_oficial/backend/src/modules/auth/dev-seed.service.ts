import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from '../users/users.service';

@Injectable()
export class DevSeedService implements OnModuleInit {
  constructor(private readonly users: UserService) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') return;
    if (process.env.SEED_ADMIN !== 'true') return;

    const email = String(process.env.SEED_ADMIN_EMAIL || 'admin@neva.pro').toLowerCase().trim();
    const password = String(process.env.SEED_ADMIN_PASSWORD || 'Admin@12345!');
    const name = String(process.env.SEED_ADMIN_NAME || 'Admin').trim() || 'Admin';

    const existing = await this.users.findByEmail(email);
    if (existing) return;

    await this.users.create({
      name,
      email,
      password_hash: password,
    });
  }
}

