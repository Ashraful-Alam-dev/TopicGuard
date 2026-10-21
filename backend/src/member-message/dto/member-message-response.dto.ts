import { MemberMessage } from '@prisma/client';

export interface MemberMessageSender {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export type MemberMessageWithRelations = MemberMessage & {
  sender?: MemberMessageSender;
  classroom?: { id: string; name: string };
};

export class MemberMessageResponseDto {
  id!: string;
  classroomId!: string;
  senderId!: string;
  content!: string;
  replyContent!: string | null;
  repliedAt!: Date | null;
  createdAt!: Date;

  /** Included for the monitor's inbox. */
  sender?: MemberMessageSender;
  /** Included for the dashboard summaries. */
  classroom?: { id: string; name: string };

  private constructor(message: MemberMessageWithRelations) {
    this.id = message.id;
    this.classroomId = message.classroomId;
    this.senderId = message.senderId;
    this.content = message.content;
    this.replyContent = message.replyContent;
    this.repliedAt = message.repliedAt;
    this.createdAt = message.createdAt;
    if (message.sender) this.sender = message.sender;
    if (message.classroom) this.classroom = message.classroom;
  }

  static fromEntity(message: MemberMessageWithRelations): MemberMessageResponseDto {
    return new MemberMessageResponseDto(message);
  }
}
