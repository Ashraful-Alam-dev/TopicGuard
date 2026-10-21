import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { MEMBER_MESSAGE_MAX_LENGTH } from '../member-message.constants';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class ReplyMemberMessageDto {
  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'Enter a reply' })
  @MaxLength(MEMBER_MESSAGE_MAX_LENGTH)
  content!: string;
}
