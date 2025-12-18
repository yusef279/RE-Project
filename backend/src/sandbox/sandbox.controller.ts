import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { SandboxService } from './sandbox.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';

@Controller('api/sandbox')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SandboxController {
    constructor(private readonly sandboxService: SandboxService) { }

    @Get('assets/:childId')
    @Roles(UserRole.PARENT, UserRole.ADMIN) // Child access usually via parent for now in this demo structure
    async getAssets(@Param('childId') childId: string) {
        return this.sandboxService.getAvailableAssets(childId);
    }

    @Post('autosave/:childId')
    @Roles(UserRole.PARENT)
    async autoSave(
        @Param('childId') childId: string,
        @Body() body: { projectId?: string; title?: string; canvasData: any },
    ) {
        return this.sandboxService.autoSaveProject(childId, body.projectId || null, body);
    }

    @Get('projects/:childId')
    @Roles(UserRole.PARENT)
    async getProjects(@Param('childId') childId: string) {
        return this.sandboxService.getChildProjects(childId);
    }

    @Put('share/:projectId')
    @Roles(UserRole.PARENT)
    async shareProject(
        @Param('projectId') projectId: string,
        @Body() body: { recipientIds: string[] },
    ) {
        return this.sandboxService.shareProject(projectId, body.recipientIds);
    }
}
