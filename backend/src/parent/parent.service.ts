import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    console.log('DEBUG: ParentService.getChildren searching for parentId:', parentId);

    // Explicitly cast to ObjectId if it's a valid string
    const query = Types.ObjectId.isValid(parentId)
      ? { parentId: new Types.ObjectId(parentId) }
      : { parentId };

    const children = await this.childModel.find(query)
      .sort({ createdAt: -1 })
      .exec();

    console.log(`DEBUG: Real children found in DB: ${children.length}`);

    return children;
  }

  async getChild(parentId: string, childId: string) {
    const query = {
      _id: Types.ObjectId.isValid(childId) ? new Types.ObjectId(childId) : childId,
      parentId: Types.ObjectId.isValid(parentId) ? new Types.ObjectId(parentId) : parentId,
    };
    const child = await this.childModel.findOne(query).exec();

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    return child;
  }

  async getPendingConsents(parentId: string) {
    const query = {
      parentId: Types.ObjectId.isValid(parentId) ? new Types.ObjectId(parentId) : parentId,
      status: ConsentStatus.PENDING
    };
    const consents = await this.consentModel.find(query)
      .populate({
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'email'
        }
      })
      .populate('childId')
      .populate('classroomId')
      .sort({ createdAt: -1 })
      .exec();

    // Transform the data to match frontend expectations
    return consents.map(consent => {
      const consentObj: any = consent.toObject();
      return {
        id: consentObj._id.toString(),
        type: consentObj.type,
        status: consentObj.status,
        message: consentObj.message,
        teacher: consentObj.teacherId ? {
          fullName: consentObj.teacherId.fullName,
          school: consentObj.teacherId.school,
          user: {
            email: consentObj.teacherId.userId?.email || ''
          }
        } : null,
        child: consentObj.childId ? {
          fullName: consentObj.childId.fullName
        } : null,
        classroom: consentObj.classroomId ? {
          name: consentObj.classroomId.name
        } : null,
        createdAt: consentObj.createdAt
      };
    });
  }

  async getAllConsents(parentId: string) {
    const query = {
      parentId: Types.ObjectId.isValid(parentId) ? new Types.ObjectId(parentId) : parentId,
    };
    return await this.consentModel.find(query)
      .populate({
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'email'
        }
      })
      .populate('childId')
      .populate('classroomId')
      .sort({ createdAt: -1 })
      .exec();
  }
}
