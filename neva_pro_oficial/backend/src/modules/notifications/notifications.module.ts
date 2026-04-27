import { Module } from '@nestjs/common';
import { MuralService } from './mural.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [MuralService, NotificationsService],
  exports: [MuralService, NotificationsService],
})
export class NotificationModule {}
