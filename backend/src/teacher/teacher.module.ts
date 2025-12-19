import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { Classroom, ClassroomSchema } from '../schemas/classroom.schema';
import { ClassroomStudent, ClassroomStudentSchema } from '../schemas/classroom-student.schema';
import { TeacherProfile, TeacherProfileSchema } from '../schemas/teacher-profile.schema';
import { ChildProfile, ChildProfileSchema } from '../schemas/child-profile.schema';
import { ParentProfile, ParentProfileSchema } from '../schemas/parent-profile.schema';
import { GameProgress, GameProgressSchema } from '../schemas/game-progress.schema';
import { Consent, ConsentSchema } from '../schemas/consent.schema';
import { Assignment, AssignmentSchema } from '../schemas/assignment.schema';
import { Game, GameSchema } from '../schemas/game.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Classroom.name, schema: ClassroomSchema },
      { name: ClassroomStudent.name, schema: ClassroomStudentSchema },
      { name: TeacherProfile.name, schema: TeacherProfileSchema },
      { name: ChildProfile.name, schema: ChildProfileSchema },
      { name: ParentProfile.name, schema: ParentProfileSchema },
      { name: GameProgress.name, schema: GameProgressSchema },
      { name: Consent.name, schema: ConsentSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Game.name, schema: GameSchema },
    ]),
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule { }
