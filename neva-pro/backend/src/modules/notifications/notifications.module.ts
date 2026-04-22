import { Module } from '@nestjs/common';
import { MuralService } from './mural.service';

@Module({
  providers: [MuralService],
  exports: [MuralService],
})
export class NotificationModule {}
