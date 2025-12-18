import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Consent,
  ConsentStatus,
  ConsentType,
} from '../schemas/consent.schema';
import { ParentProfile } from '../schemas/parent-profile.schema';
import { TeacherProfile } from '../schemas/teacher-profile.schema';
import { ChildProfile } from '../schemas/child-profile.schema';
import { Classroom } from '../schemas/classroom.schema';
import { ClassroomStudent } from '../schemas/classroom-student.schema';
import { RequestConsentDto } from './dto/request-consent.dto';

@Injectable()
export class ConsentService {
  constructor(
    @InjectModel(Consent.name)
    private consentModel: Model<Consent>,
    @InjectModel(ParentProfile.name)
    private parentProfileModel: Model<ParentProfile>,
    @InjectModel(TeacherProfile.name)
    private teacherProfileModel: Model<TeacherProfile>,
    @InjectModel(ChildProfile.name)
    private childModel: Model<ChildProfile>,
    @InjectModel(Classroom.name)
    private classroomModel: Model<Classroom>,
    @InjectModel(ClassroomStudent.name)
    private classroomStudentModel: Model<ClassroomStudent>,
  ) { }

  async requestConsent(teacherId: string, requestConsentDto: RequestConsentDto) {
    const { type, parentId, childId, classroomId, message } = requestConsentDto;

    // Verify teacher exists
    const teacher = await this.teacherProfileModel.findById(teacherId).exec();

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Verify parent exists
    const parent = await this.parentProfileModel.findById(parentId).exec();

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    // Type-specific validation
    if (type === ConsentType.CHILD) {
      if (!childId) {
        throw new BadRequestException('Child ID is required for child consent');
      }

      const child = await this.childModel.findOne({
        _id: childId,
        parentId,
      }).exec();

      if (!child) {
        throw new NotFoundException('Child not found or not owned by parent');
      }
    }

    if (type === ConsentType.CLASSROOM) {
      if (!classroomId) {
        throw new BadRequestException(
          'Classroom ID is required for classroom consent',
        );
      }

      const classroom = await this.classroomModel.findOne({
        _id: classroomId,
        teacherId,
      }).exec();

      if (!classroom) {
        throw new NotFoundException('Classroom not found or not owned by teacher');
      }

      if (!childId) {
        throw new BadRequestException(
          'Child ID is required for classroom consent',
        );
      }
    }

    // Check for existing pending consent
    const existingConsent = await this.consentModel.findOne({
      teacherId,
      parentId,
      childId,
      classroomId,
      type,
      status: ConsentStatus.PENDING,
    }).exec();

    if (existingConsent) {
      throw new BadRequestException('A pending consent request already exists');
    }

    // Create consent
    const consent = new this.consentModel({
      type,
      teacherId,
      parentId,
      childId,
      classroomId,
      message,
      status: ConsentStatus.PENDING,
    });

    return await consent.save();
  }

  async approveConsent(consentId: string, parentId: string) {
    const consent = await this.consentModel.findOne({ _id: consentId, parentId }).exec();

    if (!consent) {
      throw new NotFoundException('Consent not found');
    }

    if (consent.status !== ConsentStatus.PENDING) {
      throw new BadRequestException('Consent has already been processed');
    }

    consent.status = ConsentStatus.APPROVED;
    await consent.save();

    // If classroom consent, add child to classroom
    if (consent.type === ConsentType.CLASSROOM && consent.childId && consent.classroomId) {
      const classroomStudent = new this.classroomStudentModel({
        classroomId: consent.classroomId,
        childId: consent.childId,
      });
      await classroomStudent.save();
    }

    return consent;
  }

  async rejectConsent(consentId: string, parentId: string) {
    const consent = await this.consentModel.findOne({ _id: consentId, parentId }).exec();

    if (!consent) {
      throw new NotFoundException('Consent not found');
    }

    if (consent.status !== ConsentStatus.PENDING) {
      throw new BadRequestException('Consent has already been processed');
    }

    consent.status = ConsentStatus.REJECTED;
    return await consent.save();
  }

  async getConsent(consentId: string, userId: string, userRole: string) {
    const consent = await this.consentModel.findById(consentId)
      .populate('parentId')
      .populate('teacherId')
      .populate('childId')
      .populate('classroomId')
      .exec();

    if (!consent) {
      throw new NotFoundException('Consent not found');
    }

    // Verify user has access to this consent
    if (userRole === 'parent' && consent.parentId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (userRole === 'teacher' && consent.teacherId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return consent;
  }
}
