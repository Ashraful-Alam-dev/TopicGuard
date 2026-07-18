import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateClassroomDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  courseCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
