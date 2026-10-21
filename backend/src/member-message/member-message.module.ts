import { Module } from '@nestjs/common';
import { MemberMessageController } from './member-message.controller';
import { MemberMessageService } from './member-message.service';
import { ClassroomModule } from '../classroom/classroom.module';
import { RateLimitModule } from '../common/rate-limit/rate-limit.module';

@Module({
  imports: [ClassroomModule, RateLimitModule],
  controllers: [MemberMessageController],
  providers: [MemberMessageService],
})
export class MemberMessageModule {}
