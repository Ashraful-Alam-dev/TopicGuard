import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { ClassroomModule } from '../classroom/classroom.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ClassroomModule, EmailModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
