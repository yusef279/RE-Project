import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ConsentService } from './consent.service';
import { RequestConsentDto } from './dto/request-consent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../schemas/user.schema';

@Controller('api/consents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConsentController {
  constructor(private readonly consentService: ConsentService) { }

  // Admin routes - must come before parameterized routes
  @Get('admin/parents')
  @Roles(UserRole.ADMIN)
  async getAllParents() {
    return this.consentService.getAllParents();
  }

  @Post('admin-request')
  @Roles(UserRole.ADMIN)
  async adminRequestConsent(
    @Body() requestConsentDto: RequestConsentDto,
  ) {
    return this.consentService.adminRequestConsent(requestConsentDto);
  }

  // Teacher routes
  @Post('teacher-request')
  @Roles(UserRole.TEACHER)
  async requestConsent(
    @CurrentUser() user: any,
    @Body() requestConsentDto: RequestConsentDto,
  ) {
    return this.consentService.requestConsent(
      user.profileId,
      requestConsentDto,
    );
  }

  // Parameterized routes - must come after specific routes
  @Patch(':id/approve')
  @Roles(UserRole.PARENT)
  async approveConsent(@CurrentUser() user: any, @Param('id') consentId: string) {
    return this.consentService.approveConsent(consentId, user.profileId);
  }

  @Patch(':id/reject')
  @Roles(UserRole.PARENT)
  async rejectConsent(@CurrentUser() user: any, @Param('id') consentId: string) {
    return this.consentService.rejectConsent(consentId, user.profileId);
  }

  @Get(':id')
  @Roles(UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN)
  async getConsent(@CurrentUser() user: any, @Param('id') consentId: string) {
    return this.consentService.getConsent(
      consentId,
      user.profileId,
      user.role,
    );
  }
}
