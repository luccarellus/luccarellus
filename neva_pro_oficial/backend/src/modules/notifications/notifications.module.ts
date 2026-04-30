import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/prisma.module';
import { MuralService } from './mural.service';
import { MuralController } from './mural.controller';

@Module({
    imports: [PrismaModule],
    controllers: [MuralController],
    providers: [MuralService],
    exports: [MuralService],
})
export class NotificationModule { }
