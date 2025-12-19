import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SandboxAsset } from '../schemas/sandbox-asset.schema';
import { SandboxProject } from '../schemas/sandbox-project.schema';
import { ChildProfile } from '../schemas/child-profile.schema';

@Injectable()
export class SandboxService {
    constructor(
        @InjectModel(SandboxAsset.name)
        private assetModel: Model<SandboxAsset>,
        @InjectModel(SandboxProject.name)
        private projectModel: Model<SandboxProject>,
        @InjectModel(ChildProfile.name)
        private childModel: Model<ChildProfile>,
    ) { }

    async getAvailableAssets(childId: string) {
        const child = await this.childModel.findById(childId).exec();
        if (!child) throw new NotFoundException('Child not found');

        // Return all assets, marking which ones are locked/unlocked
        // In a real app, this would check against child's achievements
        return await this.assetModel.find().exec();
    }

    async autoSaveProject(childId: string, projectId: string | null, data: any) {
        if (projectId) {
            return await this.projectModel.findByIdAndUpdate(
                projectId,
                {
                    canvasData: data.canvasData,
                    title: data.title,
                    lastAutoSavedAt: new Date(),
                },
                { new: true },
            ).exec();
        } else {
            const newProject = new this.projectModel({
                childId,
                title: data.title || 'Untitled Project',
                canvasData: data.canvasData,
                lastAutoSavedAt: new Date(),
            });
            return await newProject.save();
        }
    }

    async getChildProjects(childId: string) {
        return await this.projectModel.find({ childId }).sort({ updatedAt: -1 }).exec();
    }

    async shareProject(projectId: string, recipientIds: string[]) {
        const project = await this.projectModel.findById(projectId).exec();
        if (!project) throw new NotFoundException('Project not found');

        project.isShared = true;
        project.shareStatus = 'pending';
        project.sharedWith = recipientIds;

        return await project.save();
    }

    async getPendingShares(parentId: string) {
        // This would fetch projects from children belonging to this parent
        // that have shareStatus: 'pending'
        return await this.projectModel.find({ shareStatus: 'pending' }).exec();
    }
}
