import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { BulkConsentDto } from './dto/bulk-consent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../schemas/user.schema';

@Controller('api/teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) { }

  @Post('classrooms')
  async createClassroom(
    @CurrentUser() user: any,
    @Body() createClassroomDto: CreateClassroomDto,
  ) {
    return this.teacherService.createClassroom(
      user.profileId,
      createClassroomDto,
    );
  }

  @Get('classrooms')
  async getClassrooms(@CurrentUser() user: any) {
    return this.teacherService.getClassrooms(user.profileId);
  }

  @Get('classrooms/:id')
  async getClassroom(@CurrentUser() user: any, @Param('id') classroomId: string) {
    return this.teacherService.getClassroom(user.profileId, classroomId);
  }

  @Patch('classrooms/:id')
  async updateClassroom(
    @CurrentUser() user: any,
    @Param('id') classroomId: string,
    @Body() updateClassroomDto: UpdateClassroomDto,
  ) {
    return this.teacherService.updateClassroom(
      user.profileId,
      classroomId,
      updateClassroomDto,
    );
  }

  @Delete('classrooms/:id')
  async deleteClassroom(@CurrentUser() user: any, @Param('id') classroomId: string) {
    return this.teacherService.deleteClassroom(user.profileId, classroomId);
  }

  @Post('consents/bulk')
  async sendBulkConsentRequests(
    @CurrentUser() user: any,
    @Body() bulkConsentDto: BulkConsentDto,
  ) {
    return this.teacherService.sendBulkConsentRequests(
      user.profileId,
      bulkConsentDto,
    );
  }

  @Post('assignments/bulk')
  async assignGameToClass(
    @CurrentUser() user: any,
    @Body() body: { classroomId: string; gameId: string; dueDate?: string; message?: string },
  ) {
    return this.teacherService.assignGameToClass(
      user.profileId,
      body.classroomId,
      body.gameId,
      body.dueDate ? new Date(body.dueDate) : undefined,
      body.message,
    );
  }

  @Get('classrooms/:id/analytics')
  async getClassroomAnalytics(
    @CurrentUser() user: any,
    @Param('id') classroomId: string,
  ) {
    return this.teacherService.getClassroomAnalytics(user.profileId, classroomId);
  }

  @Get('classrooms/:id/leaderboard')
  async getClassroomLeaderboard(
    @CurrentUser() user: any,
    @Param('id') classroomId: string,
    @Query('limit') limit?: number,
  ) {
    return this.teacherService.getClassroomLeaderboard(
      user.profileId,
      classroomId,
      limit ? parseInt(limit.toString()) : 10,
    );
  }

  @Get('consents')
  async getConsents(@CurrentUser() user: any) {
    return this.teacherService.getConsents(user.profileId);
  }

  @Get('parents')
  async getAllParents() {
    return this.teacherService.getAllParents();
  }
}
