import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { Classroom } from '../schemas/classroom.schema';
import { ClassroomStudent } from '../schemas/classroom-student.schema';
import { TeacherProfile } from '../schemas/teacher-profile.schema';
import { ChildProfile } from '../schemas/child-profile.schema';
import { ParentProfile } from '../schemas/parent-profile.schema';
import { GameProgress } from '../schemas/game-progress.schema';
import { Consent, ConsentStatus, ConsentType } from '../schemas/consent.schema';
import { Assignment } from '../schemas/assignment.schema';
import { Game } from '../schemas/game.schema';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { BulkConsentDto } from './dto/bulk-consent.dto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectModel(Classroom.name)
    private classroomModel: Model<Classroom>,
    @InjectModel(ClassroomStudent.name)
    private classroomStudentModel: Model<ClassroomStudent>,
    @InjectModel(TeacherProfile.name)
    private teacherProfileModel: Model<TeacherProfile>,
    @InjectModel(ChildProfile.name)
    private childModel: Model<ChildProfile>,
    @InjectModel(ParentProfile.name)
    private parentProfileModel: Model<ParentProfile>,
    @InjectModel(GameProgress.name)
    private progressModel: Model<GameProgress>,
    @InjectModel(Consent.name)
    private consentModel: Model<Consent>,
    @InjectModel(Assignment.name)
    private assignmentModel: Model<Assignment>,
    @InjectModel(Game.name)
    private gameModel: Model<Game>,
  ) { }

  async createClassroom(
    teacherId: string,
    createClassroomDto: CreateClassroomDto,
  ) {
    const teacherProfile = await this.teacherProfileModel.findById(teacherId).exec();

    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found');
    }

    const classroom = new this.classroomModel({
      ...createClassroomDto,
      teacherId: teacherProfile._id,
    });

    return await classroom.save();
  }

  async getClassrooms(teacherId: string) {
    console.log('DEBUG: TeacherService.getClassrooms searching for teacherId:', teacherId);

    // Explicitly cast to ObjectId
    const query = Types.ObjectId.isValid(teacherId)
      ? { teacherId: new Types.ObjectId(teacherId) }
      : { teacherId };

    const classrooms = await this.classroomModel.find(query)
      .populate('classroomStudents')
      .sort({ createdAt: -1 })
      .exec();

    console.log(`DEBUG: Real classrooms found in DB: ${classrooms.length}`);
    return classrooms;
  }

  async getClassroom(teacherId: string, id: string) {
    const query = {
      _id: Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id,
      teacherId: Types.ObjectId.isValid(teacherId) ? new Types.ObjectId(teacherId) : teacherId,
    };
    const classroom = await this.classroomModel.findOne(query)
      .populate('classroomStudents')
      .exec();

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    return classroom;
  }

  async updateClassroom(
    teacherId: string,
    classroomId: string,
    updateClassroomDto: UpdateClassroomDto,
  ) {
    const query = {
      _id: Types.ObjectId.isValid(classroomId) ? new Types.ObjectId(classroomId) : classroomId,
      teacherId: Types.ObjectId.isValid(teacherId) ? new Types.ObjectId(teacherId) : teacherId,
    };
    const classroom = await this.classroomModel.findOneAndUpdate(
      query,
      updateClassroomDto,
      { new: true }
    ).exec();

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    return classroom;
  }

  async deleteClassroom(teacherId: string, classroomId: string) {
    const query = {
      _id: Types.ObjectId.isValid(classroomId) ? new Types.ObjectId(classroomId) : classroomId,
      teacherId: Types.ObjectId.isValid(teacherId) ? new Types.ObjectId(teacherId) : teacherId,
    };
    const classroom = await this.classroomModel.findOneAndDelete(query).exec();
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }
    return { message: 'Classroom deleted successfully' };
  }

  async sendBulkConsentRequests(
    teacherId: string,
    bulkConsentDto: BulkConsentDto,
  ) {
    const { childIds, classroomId, message, type } = bulkConsentDto;

    // Verify classroom belongs to teacher
    await this.getClassroom(teacherId, classroomId);

    const consents: Consent[] = [];
    for (const childId of childIds) {
      // Check if child exists
      const child = await this.childModel.findById(childId).exec();

      if (!child) {
        continue; // Skip non-existent children
      }

      // Check if consent already exists
      const existing = await this.consentModel.findOne({
        teacherId,
        parentId: child.parentId,
        childId,
        classroomId,
        type,
      }).exec();

      if (existing) {
        continue; // Skip if consent already requested
      }

      // Create consent request
      const consent = new this.consentModel({
        teacherId,
        parentId: child.parentId,
        childId,
        classroomId,
        type,
        status: ConsentStatus.PENDING,
        message,
      });

      const saved = await consent.save();
      consents.push(saved);
    }

    return {
      message: `Sent ${consents.length} consent request(s)`,
      consents,
    };
  }

  async assignGameToClass(
    teacherId: string,
    classroomId: string,
    gameId: string,
    dueDate?: Date,
    message?: string,
  ) {
    // 1. Verify classroom and teacher
    await this.getClassroom(teacherId, classroomId);

    // 2. Get all students in class
    const classroomStudents = await this.classroomStudentModel.find({ classroomId }).exec();
    const studentIds = classroomStudents.map(cs => cs.childId);

    // 3. Create assignment
    const assignment = new this.assignmentModel({
      teacherId,
      classroomId,
      gameId,
      assignedStudentIds: studentIds,
      dueDate,
      message,
    });

    return await assignment.save();
  }

  async getClassroomAnalytics(teacherId: string, classroomId: string) {
    const classroom = await this.getClassroom(teacherId, classroomId);

    const classroomQuery = {
      classroomId: Types.ObjectId.isValid(classroomId) ? new Types.ObjectId(classroomId) : classroomId
    };
    const classroomStudents = await this.classroomStudentModel.find(classroomQuery).populate('childId').exec();
    const students = classroomStudents
      .map((cs) => cs.childId as unknown as ChildProfile)
      .filter((child): child is ChildProfile => child != null && typeof child === 'object');

    // Calculate total points
    const totalPoints = students.reduce((sum, child) => sum + (child.totalPoints || 0), 0);
    const averagePoints = students.length > 0 ? totalPoints / students.length : 0;

    // Get game progress for all students
    const studentIds = students
      .map((s) => s._id)
      .filter((id) => id != null)
      .map((id) => (Types.ObjectId.isValid(id) ? (id instanceof Types.ObjectId ? id : new Types.ObjectId(id)) : id));

    let allProgress: (GameProgress & { gameId?: any } & Document)[] = [];
    if (studentIds.length > 0) {
      allProgress = await this.progressModel
        .find({
          childId: { $in: studentIds }
        })
        .populate({
          path: 'gameId',
          model: 'Game',
          select: 'title iconEmoji _id'
        })
        .exec();
    }

    // Group by game
    const gameStats: Record<string, any> = {};
    allProgress.forEach((progress) => {
      // Skip if gameId is not populated or is null
      if (!progress.gameId) {
        console.warn('GameProgress has null/undefined gameId:', progress._id);
        return;
      }

      const game = progress.gameId as any;
      
      // Handle both populated game object and ObjectId
      let gameId: string;
      let gameTitle: string;
      let gameIcon: string;
      
      if (game && typeof game === 'object' && game._id) {
        // Populated game object
        gameId = game._id.toString();
        gameTitle = game.title || 'Unknown Game';
        gameIcon = game.iconEmoji || '🎮';
      } else if (Types.ObjectId.isValid(game)) {
        // Just an ObjectId, need to fetch game details
        gameId = game.toString();
        gameTitle = 'Unknown Game';
        gameIcon = '🎮';
      } else {
        // Invalid game reference
        console.warn('Invalid game reference in progress:', progress._id, 'gameId:', game);
        return;
      }
      
      if (!gameStats[gameId]) {
        gameStats[gameId] = {
          gameTitle,
          gameIcon,
          totalCompletions: 0,
          averageScore: 0,
          scores: [],
        };
      }
      
      // Only count if there are actual completions
      if (progress.timesCompleted && progress.timesCompleted > 0) {
        gameStats[gameId].totalCompletions += progress.timesCompleted || 0;
      }
      
      // Only add score if highScore exists and is valid
      if (progress.highScore != null && progress.highScore >= 0) {
        gameStats[gameId].scores.push(progress.highScore);
      }
    });

    // Calculate averages and clean up empty games
    const validGameStats: any[] = [];
    Object.keys(gameStats).forEach((gameId) => {
      const stats = gameStats[gameId];
      
      // Only include games that have been played (have completions or scores)
      if (stats.totalCompletions > 0 || stats.scores.length > 0) {
        if (stats.scores.length > 0) {
          stats.averageScore = stats.scores.reduce((a: number, b: number) => a + b, 0) / stats.scores.length;
        } else {
          stats.averageScore = 0;
        }
        
        // Remove scores array from final output (not needed in response)
        delete stats.scores;
        
        validGameStats.push(stats);
      }
    });

    return {
      classroom: {
        id: classroom._id,
        name: classroom.name,
        gradeLevel: classroom.gradeLevel,
        studentCount: students.length,
      },
      analytics: {
        totalPoints,
        averagePoints: Math.round(averagePoints),
        gameStats: validGameStats,
        topStudents: students
          .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
          .slice(0, 5)
          .map((child) => ({
            id: child._id,
            fullName: child.fullName,
            totalPoints: child.totalPoints || 0,
          })),
      },
    };
  }

  async getClassroomLeaderboard(teacherId: string, classroomId: string, limit = 10) {
    const classroom = await this.getClassroom(teacherId, classroomId);

    const classroomQuery = {
      classroomId: Types.ObjectId.isValid(classroomId) ? new Types.ObjectId(classroomId) : classroomId
    };
    const classroomStudents = await this.classroomStudentModel.find(classroomQuery).populate('childId').exec();
    const students = classroomStudents
      .map((cs) => cs.childId as unknown as ChildProfile)
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, limit);

    return students.map((child, index) => ({
      rank: index + 1,
      childId: child._id,
      fullName: child.fullName,
      totalPoints: child.totalPoints,
      age: child.age,
    }));
  }

  async getConsents(teacherId: string) {
    const consents = await this.consentModel.find({ teacherId })
      .populate({
        path: 'parentId',
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
      const consentObj = consent.toObject() as any;
      const parentId = consentObj.parentId as any;
      const childId = consentObj.childId as any;
      const classroomId = consentObj.classroomId as any;
      
      return {
        id: consentObj._id.toString(),
        type: consentObj.type,
        status: consentObj.status,
        message: consentObj.message,
        parent: parentId && typeof parentId === 'object' && 'fullName' in parentId ? {
          fullName: parentId.fullName,
          user: {
            email: parentId.userId?.email || ''
          }
        } : null,
        child: childId && typeof childId === 'object' && 'fullName' in childId ? {
          fullName: childId.fullName
        } : null,
        classroom: classroomId && typeof classroomId === 'object' && 'name' in classroomId ? {
          name: classroomId.name
        } : null,
        createdAt: consentObj.createdAt || consentObj.created_at
      };
    });
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

  async getTeacherProfile(teacherId: string) {
    const profile = await this.teacherProfileModel.findById(teacherId)
      .populate('userId', 'email')
      .exec();

    if (!profile) {
      throw new NotFoundException('Teacher profile not found');
    }

    return profile;
  }

  async updateTeacherProfile(teacherId: string, updateData: { fullName?: string; phone?: string; school?: string }) {
    const profile = await this.teacherProfileModel.findByIdAndUpdate(
      teacherId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();

    if (!profile) {
      throw new NotFoundException('Teacher profile not found');
    }

    return profile;
  }
}
