import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsentService } from './consent.service';
import { ConsentController } from './consent.controller';
import { Consent, ConsentSchema } from '../schemas/consent.schema';
import { ParentProfile, ParentProfileSchema } from '../schemas/parent-profile.schema';
import { TeacherProfile, TeacherProfileSchema } from '../schemas/teacher-profile.schema';
import { ChildProfile, ChildProfileSchema } from '../schemas/child-profile.schema';
import { Classroom, ClassroomSchema } from '../schemas/classroom.schema';
import { ClassroomStudent, ClassroomStudentSchema } from '../schemas/classroom-student.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Consent.name, schema: ConsentSchema },
      { name: ParentProfile.name, schema: ParentProfileSchema },
      { name: TeacherProfile.name, schema: TeacherProfileSchema },
      { name: ChildProfile.name, schema: ChildProfileSchema },
      { name: Classroom.name, schema: ClassroomSchema },
      { name: ClassroomStudent.name, schema: ClassroomStudentSchema },
    ]),
  ],
  controllers: [ConsentController],
  providers: [ConsentService],
  exports: [ConsentService],
})
export class ConsentModule { }
