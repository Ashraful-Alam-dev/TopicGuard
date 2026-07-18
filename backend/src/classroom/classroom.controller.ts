import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { ClassroomService } from './classroom.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { JoinClassroomDto } from './dto/join-classroom.dto';
import { TransferMonitorDto } from './dto/transfer-monitor.dto';
import { ClassroomResponseDto } from './dto/classroom-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('classrooms')
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateClassroomDto,
  ): Promise<ClassroomResponseDto> {
    const classroom = await this.classroomService.create(user.id, dto);
    return ClassroomResponseDto.fromEntity(classroom, user.id);
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  async join(
    @CurrentUser() user: User,
    @Body() dto: JoinClassroomDto,
  ): Promise<ClassroomResponseDto> {
    const classroom = await this.classroomService.joinByCode(
      user.id,
      dto.joinCode,
    );
    return ClassroomResponseDto.fromEntity(classroom, user.id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findMine(@CurrentUser() user: User): Promise<ClassroomResponseDto[]> {
    const classrooms = await this.classroomService.findJoinedByUser(user.id);
    return classrooms.map((classroom) =>
      ClassroomResponseDto.fromEntity(classroom, user.id),
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ClassroomResponseDto> {
    const classroom = await this.classroomService.findByIdOrThrow(id, user.id);
    return ClassroomResponseDto.fromEntity(classroom, user.id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClassroomDto,
  ): Promise<ClassroomResponseDto> {
    const classroom = await this.classroomService.update(id, user.id, dto);
    return ClassroomResponseDto.fromEntity(classroom, user.id);
  }

  @Patch(':id/archive')
  @HttpCode(HttpStatus.OK)
  async archive(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ClassroomResponseDto> {
    const classroom = await this.classroomService.archive(id, user.id);
    return ClassroomResponseDto.fromEntity(classroom, user.id);
  }

  @Patch(':id/unarchive')
  @HttpCode(HttpStatus.OK)
  async unarchive(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ClassroomResponseDto> {
    const classroom = await this.classroomService.unarchive(id, user.id);
    return ClassroomResponseDto.fromEntity(classroom, user.id);
  }

  @Patch(':id/transfer-monitor')
  @HttpCode(HttpStatus.OK)
  async transferMonitor(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferMonitorDto,
  ): Promise<ClassroomResponseDto> {
    const classroom = await this.classroomService.transferMonitor(
      id,
      user.id,
      dto,
    );
    return ClassroomResponseDto.fromEntity(classroom, user.id);
  }
}
