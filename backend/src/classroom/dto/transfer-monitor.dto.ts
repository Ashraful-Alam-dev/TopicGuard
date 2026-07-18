import { IsUUID } from 'class-validator';

export class TransferMonitorDto {
  @IsUUID()
  newMonitorId!: string;
}
