import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ParentService } from './parent.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../schemas/user.schema';

@Controller('api/parent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PARENT)
export class ParentController {
  constructor(private readonly parentService: ParentService) { }

  @Post('children')
  async createChild(
    @CurrentUser() user: any,
    @Body() createChildDto: CreateChildDto,
  ) {
    return this.parentService.createChild(user.profileId, createChildDto);
  }

  @Get('children')
  async getChildren(@CurrentUser() user: any) {
    return this.parentService.getChildren(user.profileId);
  }

  @Get('children/:id')
  async getChild(@CurrentUser() user: any, @Param('id') childId: string) {
    return this.parentService.getChild(user.profileId, childId);
  }

  @Get('consents/pending')
  async getPendingConsents(@CurrentUser() user: any) {
    return this.parentService.getPendingConsents(user.profileId);
  }

  @Get('consents')
  async getAllConsents(@CurrentUser() user: any) {
    return this.parentService.getAllConsents(user.profileId);
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.parentService.getParentProfile(user.profileId);
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateParentDto: UpdateParentDto,
  ) {
    return this.parentService.updateParentProfile(user.profileId, updateParentDto);
  }

  @Put('children/:id')
  async updateChild(
    @CurrentUser() user: any,
    @Param('id') childId: string,
    @Body() updateChildDto: UpdateChildDto,
  ) {
    return this.parentService.updateChild(user.profileId, childId, updateChildDto);
  }
}
