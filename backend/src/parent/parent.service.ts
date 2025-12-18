import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChildProfile } from '../schemas/child-profile.schema';
import { ParentProfile } from '../schemas/parent-profile.schema';
import { Consent, ConsentStatus } from '../schemas/consent.schema';
import { CreateChildDto } from './dto/create-child.dto';

@Injectable()
export class ParentService {
  constructor(
    @InjectModel(ChildProfile.name)
    private childModel: Model<ChildProfile>,
    @InjectModel(ParentProfile.name)
    private parentProfileModel: Model<ParentProfile>,
    @InjectModel(Consent.name)
    private consentModel: Model<Consent>,
  ) { }

  async createChild(parentId: string, createChildDto: CreateChildDto) {
    const parentProfile = await this.parentProfileModel.findById(parentId).exec();

    if (!parentProfile) {
      throw new NotFoundException('Parent profile not found');
    }

    const child = new this.childModel({
      ...createChildDto,
      locale: createChildDto.locale || 'ar-EG',
      parentId: parentProfile._id,
    });

    return await child.save();
  }

  async getChildren(parentId: string) {
    return await this.childModel.find({ parentId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getChild(parentId: string, childId: string) {
    const child = await this.childModel.findOne({ _id: childId, parentId }).exec();

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    return child;
  }

  async getPendingConsents(parentId: string) {
    return await this.consentModel.find({ parentId, status: ConsentStatus.PENDING })
      .populate('teacherId')
      .populate('childId')
      .populate('classroomId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllConsents(parentId: string) {
    return await this.consentModel.find({ parentId })
      .populate('teacherId')
      .populate('childId')
      .populate('classroomId')
      .sort({ createdAt: -1 })
      .exec();
  }
}
