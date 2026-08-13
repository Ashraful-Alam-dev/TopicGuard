import { Module } from '@nestjs/common';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { ClassroomModule } from '../classroom/classroom.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ClassroomModule, EmailModule],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
