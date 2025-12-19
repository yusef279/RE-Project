import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    console.log('DEBUG approveConsent - consentId:', consentId, 'parentId:', parentId);

    const query = {
      _id: Types.ObjectId.isValid(consentId) ? new Types.ObjectId(consentId) : consentId,
      parentId: Types.ObjectId.isValid(parentId) ? new Types.ObjectId(parentId) : parentId
    };
    console.log('DEBUG approveConsent - query:', JSON.stringify(query));

    const consent = await this.consentModel.findOne(query).exec();
    console.log('DEBUG approveConsent - found consent:', consent ? 'YES' : 'NO');

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
    console.log('DEBUG rejectConsent - consentId:', consentId, 'parentId:', parentId);

    const query = {
      _id: Types.ObjectId.isValid(consentId) ? new Types.ObjectId(consentId) : consentId,
      parentId: Types.ObjectId.isValid(parentId) ? new Types.ObjectId(parentId) : parentId
    };
    console.log('DEBUG rejectConsent - query:', JSON.stringify(query));

    const consent = await this.consentModel.findOne(query).exec();
    console.log('DEBUG rejectConsent - found consent:', consent ? 'YES' : 'NO');

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

  async getAllParents() {
    const parents = await this.parentProfileModel
      .find()
      .populate('userId', 'email')
      .exec();

    const parentsWithChildren = await Promise.all(
      parents.map(async (parent) => {
        const children = await this.childModel
          .find({ parentId: parent._id })
          .select('fullName age totalPoints')
          .exec();

        return {
          _id: parent._id,
          fullName: parent.fullName,
          email: parent.userId?.['email'],
          children: children.map((child) => ({
            _id: child._id,
            fullName: child.fullName,
            age: child.age,
            totalPoints: child.totalPoints,
          })),
        };
      }),
    );

    return parentsWithChildren;
  }

  async adminRequestConsent(requestConsentDto: RequestConsentDto) {
    const { type, parentId, childId, message } = requestConsentDto;

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

    // Check for existing pending consent
    const existingConsent = await this.consentModel.findOne({
      parentId,
      childId,
      type,
      status: ConsentStatus.PENDING,
      teacherId: null, // Admin requests don't have a teacher
    }).exec();

    if (existingConsent) {
      throw new BadRequestException('A pending consent request already exists');
    }

    // Create consent
    const consent = new this.consentModel({
      type,
      parentId,
      childId,
      message,
      status: ConsentStatus.PENDING,
    });

    return await consent.save();
  }
}
