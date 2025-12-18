import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Classroom } from '../schemas/classroom.schema';
import { ClassroomStudent } from '../schemas/classroom-student.schema';
import { TeacherProfile } from '../schemas/teacher-profile.schema';
import { ChildProfile } from '../schemas/child-profile.schema';
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
    const classrooms = await this.classroomModel.find({ teacherId })
      .populate('classroomStudents')
      .sort({ createdAt: -1 })
      .exec();

    // Manual population for students count or list if needed
    // For now returning classrooms
    return classrooms;
  }

  async getClassroom(teacherId: string, id: string) {
    const classroom = await this.classroomModel.findOne({ _id: id, teacherId })
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
    const classroom = await this.classroomModel.findOneAndUpdate(
      { _id: classroomId, teacherId },
      updateClassroomDto,
      { new: true }
    ).exec();

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    return classroom;
  }

  async deleteClassroom(teacherId: string, classroomId: string) {
    const classroom = await this.classroomModel.findOneAndDelete({ _id: classroomId, teacherId }).exec();
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

    const classroomStudents = await this.classroomStudentModel.find({ classroomId }).populate('childId').exec();
    const students = classroomStudents.map((cs) => cs.childId as unknown as ChildProfile);

    // Calculate total points
    const totalPoints = students.reduce((sum, child) => sum + (child.totalPoints || 0), 0);
    const averagePoints = students.length > 0 ? totalPoints / students.length : 0;

    // Get game progress for all students
    const studentIds = students.map((s) => s._id);
    const allProgress = await this.progressModel.find({
      childId: { $in: studentIds }
    }).populate('gameId').exec();

    // Group by game
    const gameStats: Record<string, any> = {};
    allProgress.forEach((progress) => {
      const game = progress.gameId as any;
      const gameId = game._id.toString();
      if (!gameStats[gameId]) {
        gameStats[gameId] = {
          gameTitle: game.title,
          gameIcon: game.iconEmoji,
          totalCompletions: 0,
          averageScore: 0,
          scores: [],
        };
      }
      gameStats[gameId].totalCompletions += progress.timesCompleted;
      gameStats[gameId].scores.push(progress.highScore);
    });

    // Calculate averages
    Object.keys(gameStats).forEach((gameId) => {
      const scores = gameStats[gameId].scores;
      gameStats[gameId].averageScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;

      // Highlight low performance (AC-07.2: < 70% threshold)
      // Assuming max score is 100 for percentage comparison, 
      // or using a relative metric if points vary. 
      // For this demo, we'll flag any students with highScore < 70 in a 'key' game.
      gameStats[gameId].lowPerformers = allProgress
        .filter(p => p.gameId.toString() === gameId && p.highScore < 70)
        .map(p => p.childId);
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
        gameStats: Object.values(gameStats),
        topStudents: students
          .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
          .slice(0, 5)
          .map((child) => ({
            id: child._id,
            fullName: child.fullName,
            totalPoints: child.totalPoints,
          })),
      },
    };
  }

  async getClassroomLeaderboard(teacherId: string, classroomId: string, limit = 10) {
    const classroom = await this.getClassroom(teacherId, classroomId);

    const classroomStudents = await this.classroomStudentModel.find({ classroomId }).populate('childId').exec();
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
    return await this.consentModel.find({ teacherId })
      .populate('parentId')
      .populate('childId')
      .populate('classroomId')
      .sort({ createdAt: -1 })
      .exec();
  }
}
