import { Message } from '@prisma/client';

export class MessageResponseDto {
  id!: string;
  classroomId!: string;
  senderId!: string;
  title!: string;
  content!: string;
  createdAt!: Date;
  updatedAt!: Date;

  private constructor(message: Message) {
    this.id = message.id;
    this.classroomId = message.classroomId;
    this.senderId = message.senderId;
    this.title = message.title;
    this.content = message.content;
    this.createdAt = message.createdAt;
    this.updatedAt = message.updatedAt;
  }

  static fromEntity(message: Message): MessageResponseDto {
    return new MessageResponseDto(message);
  }
}
