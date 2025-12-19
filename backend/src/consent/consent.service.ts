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

    // Log consent details before processing
    console.log('DEBUG approveConsent - consent details:', {
      type: consent.type,
      childId: consent.childId,
      classroomId: consent.classroomId,
      childIdType: typeof consent.childId,
      classroomIdType: typeof consent.classroomId,
    });

    // Store original ObjectIds before saving (they might change after populate)
    const originalChildId = consent.childId;
    const originalClassroomId = consent.classroomId;

    consent.status = ConsentStatus.APPROVED;
    await consent.save();

    // If classroom consent, add child to classroom
    if (consent.type === ConsentType.CLASSROOM && originalChildId && originalClassroomId) {
      // Get ObjectIds - handle both ObjectId instances and string representations
      let childIdObj: Types.ObjectId;
      let classroomIdObj: Types.ObjectId;

      // Handle childId
      if (originalChildId instanceof Types.ObjectId) {
        childIdObj = originalChildId;
      } else if (typeof originalChildId === 'string') {
        childIdObj = new Types.ObjectId(originalChildId);
      } else if (originalChildId && typeof originalChildId === 'object' && '_id' in originalChildId) {
        // If populated, get the _id
        const populatedId = (originalChildId as any)._id;
        childIdObj = populatedId instanceof Types.ObjectId ? populatedId : new Types.ObjectId(populatedId.toString());
      } else {
        childIdObj = new Types.ObjectId(String(originalChildId));
      }

      // Handle classroomId
      if (originalClassroomId instanceof Types.ObjectId) {
        classroomIdObj = originalClassroomId;
      } else if (typeof originalClassroomId === 'string') {
        classroomIdObj = new Types.ObjectId(originalClassroomId);
      } else if (originalClassroomId && typeof originalClassroomId === 'object' && '_id' in originalClassroomId) {
        // If populated, get the _id
        const populatedId = (originalClassroomId as any)._id;
        classroomIdObj = populatedId instanceof Types.ObjectId ? populatedId : new Types.ObjectId(populatedId.toString());
      } else {
        classroomIdObj = new Types.ObjectId(String(originalClassroomId));
      }

      console.log(`DEBUG: Processing classroom enrollment - childId: ${childIdObj.toString()}, classroomId: ${classroomIdObj.toString()}`);

      // Verify child and classroom exist
      const child = await this.childModel.findById(childIdObj).exec();
      const classroom = await this.classroomModel.findById(classroomIdObj).exec();

      if (!child) {
        console.error(`DEBUG: Child ${childIdObj.toString()} not found`);
        throw new NotFoundException('Child not found');
      }

      if (!classroom) {
        console.error(`DEBUG: Classroom ${classroomIdObj.toString()} not found`);
        throw new NotFoundException('Classroom not found');
      }

      // Check if student is already in classroom to prevent duplicates
      const existing = await this.classroomStudentModel.findOne({
        classroomId: classroomIdObj,
        childId: childIdObj,
      }).exec();

      if (!existing) {
        try {
          const classroomStudent = new this.classroomStudentModel({
            classroomId: classroomIdObj,
            childId: childIdObj,
            enrolledAt: new Date(),
          });
          const saved = await classroomStudent.save();
          console.log(`DEBUG: Successfully added child ${childIdObj.toString()} to classroom ${classroomIdObj.toString()}, ClassroomStudent ID: ${saved._id}`);
        } catch (error) {
          console.error(`DEBUG: Error saving ClassroomStudent:`, error);
          throw new BadRequestException(`Failed to add child to classroom: ${error.message}`);
        }
      } else {
        console.log(`DEBUG: Child ${childIdObj.toString()} already enrolled in classroom ${classroomIdObj.toString()}`);
      }
    } else {
      console.log(`DEBUG: Not a classroom consent or missing childId/classroomId - type: ${consent.type}, childId: ${consent.childId}, classroomId: ${consent.classroomId}`);
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

    // Convert string IDs to ObjectId for proper querying
    const parentObjectId = Types.ObjectId.isValid(parentId) ? new Types.ObjectId(parentId) : parentId;

    // Verify parent exists
    const parent = await this.parentProfileModel.findById(parentObjectId).exec();

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    // Type-specific validation
    if (type === ConsentType.CHILD) {
      if (!childId) {
        throw new BadRequestException('Child ID is required for child consent');
      }

      const childObjectId = Types.ObjectId.isValid(childId) ? new Types.ObjectId(childId) : childId;

      const child = await this.childModel.findOne({
        _id: childObjectId,
        parentId: parentObjectId,
      }).exec();

      if (!child) {
        throw new NotFoundException('Child not found or not owned by parent');
      }

      // Check for existing pending consent
      const existingConsent = await this.consentModel.findOne({
        parentId: parentObjectId,
        childId: childObjectId,
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
        parentId: parentObjectId,
        childId: childObjectId,
        message,
        status: ConsentStatus.PENDING,
      });

      return await consent.save();
    }

    throw new BadRequestException('Invalid consent type for admin request');
  }
}
