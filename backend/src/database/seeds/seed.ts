import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserSchema, UserRole } from '../../schemas/user.schema';
import { ParentProfile, ParentProfileSchema } from '../../schemas/parent-profile.schema';
import { TeacherProfile, TeacherProfileSchema } from '../../schemas/teacher-profile.schema';
import { ChildProfile, ChildProfileSchema } from '../../schemas/child-profile.schema';
import { Classroom, ClassroomSchema } from '../../schemas/classroom.schema';
import { Consent, ConsentSchema, ConsentStatus, ConsentType } from '../../schemas/consent.schema';
import { Game, GameSchema, GameType, GameCategory } from '../../schemas/game.schema';
import { Badge, BadgeSchema, BadgeCategory } from '../../schemas/badge.schema';
import { SandboxAsset, SandboxAssetSchema } from '../../schemas/sandbox-asset.schema';
import { SandboxProject, SandboxProjectSchema } from '../../schemas/sandbox-project.schema';
import { ClassroomStudent, ClassroomStudentSchema } from '../../schemas/classroom-student.schema';

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/re_db';

  console.log('⏳ Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Database connected');

  // Define Models
  const UserModel = mongoose.model(User.name, UserSchema);
  const ParentProfileModel = mongoose.model(ParentProfile.name, ParentProfileSchema);
  const TeacherProfileModel = mongoose.model(TeacherProfile.name, TeacherProfileSchema);
  const ChildModel = mongoose.model(ChildProfile.name, ChildProfileSchema);
  const ClassroomModel = mongoose.model(Classroom.name, ClassroomSchema);
  const ClassroomStudentModel = mongoose.model(ClassroomStudent.name, ClassroomStudentSchema);
  const ConsentModel = mongoose.model(Consent.name, ConsentSchema);
  const GameModel = mongoose.model(Game.name, GameSchema);
  const BadgeModel = mongoose.model(Badge.name, BadgeCategory ? BadgeSchema : BadgeSchema); // Just using BadgeSchema
  const SandboxAssetModel = mongoose.model(SandboxAsset.name, SandboxAssetSchema);
  const SandboxProjectModel = mongoose.model(SandboxProject.name, SandboxProjectSchema);

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await Promise.all([
    UserModel.deleteMany({}),
    ParentProfileModel.deleteMany({}),
    TeacherProfileModel.deleteMany({}),
    ChildModel.deleteMany({}),
    ClassroomModel.deleteMany({}),
    ClassroomStudentModel.deleteMany({}),
    ConsentModel.deleteMany({}),
    GameModel.deleteMany({}),
    BadgeModel.deleteMany({}),
    SandboxAssetModel.deleteMany({}),
    SandboxProjectModel.deleteMany({}),
  ]);

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Admin User
  const adminUser = new UserModel({
    email: 'admin@playlearn.eg',
    password: hashedPassword,
    role: UserRole.ADMIN,
  });
  await adminUser.save();
  console.log('✅ Admin user created: admin@playlearn.eg / password123');

  // 2. Create Parent User with Profile
  const parentUser = new UserModel({
    email: 'parent@example.eg',
    password: hashedPassword,
    role: UserRole.PARENT,
  });
  await parentUser.save();

  const parentProfile = new ParentProfileModel({
    fullName: 'أحمد محمد (Ahmed Mohamed)',
    phone: '+20 123 456 7890',
    userId: parentUser._id,
  });
  await parentProfile.save();
  console.log('✅ Parent user created: parent@example.eg / password123');

  // 3. Create Teacher User with Profile
  const teacherUser = new UserModel({
    email: 'teacher@school.eg',
    password: hashedPassword,
    role: UserRole.TEACHER,
  });
  await teacherUser.save();

  const teacherProfile = new TeacherProfileModel({
    fullName: 'فاطمة علي (Fatima Ali)',
    phone: '+20 123 456 7891',
    school: 'مدرسة المستقبل (Future School)',
    userId: teacherUser._id,
  });
  await teacherProfile.save();
  console.log('✅ Teacher user created: teacher@school.eg / password123');

  // 4. Create Child Profile
  const child = new ChildModel({
    fullName: 'ليلى أحمد (Layla Ahmed)',
    age: 7,
    locale: 'ar-EG',
    parentId: parentProfile._id,
  });
  await child.save();
  console.log('✅ Child profile created: Layla Ahmed (age 7)');

  // 5. Create Classroom
  const classroom = new ClassroomModel({
    name: 'الصف الثاني - أ (Grade 2 - A)',
    description: 'فصل الرياضيات والعلوم (Math and Science Class)',
    gradeLevel: 'Grade 2',
    teacherId: teacherProfile._id,
  });
  await classroom.save();
  console.log('✅ Classroom created: Grade 2 - A');

  // 6. Create Pending Consent Request (Teacher → Parent for Classroom)
  const consent = new ConsentModel({
    type: ConsentType.CLASSROOM,
    status: ConsentStatus.PENDING,
    parentId: parentProfile._id,
    teacherId: teacherProfile._id,
    childId: child._id,
    classroomId: classroom._id,
    message: 'أرغب في إضافة ابنتك ليلى إلى فصل الصف الثاني - أ (I would like to add your daughter Layla to Grade 2 - A)',
  });
  await consent.save();
  console.log('✅ Pending consent request created');

  // 7. Create Games
  const memoryGame = new GameModel({
    title: 'Memory Match',
    description: 'Match pairs of cards to win!',
    type: GameType.PLAY,
    category: GameCategory.MEMORY,
    iconEmoji: '🧠',
    minAge: 3,
    maxAge: 12,
    basePoints: 10,
    config: {
      easyGrid: 4,
      mediumGrid: 6,
      hardGrid: 8,
    },
  });
  await memoryGame.save();

  const mathGame = new GameModel({
    title: 'Math Quiz',
    description: 'Solve math problems and earn points!',
    type: GameType.LEARN,
    category: GameCategory.MATH,
    iconEmoji: '🔢',
    minAge: 5,
    maxAge: 12,
    basePoints: 15,
    config: {
      questionsPerRound: 10,
      easyRange: 10,
      mediumRange: 50,
      hardRange: 100,
    },
  });
  await mathGame.save();

  const pharaohMath = new GameModel({
    title: "Pharaoh's Math Pyramid",
    description: 'Solve ancient puzzles to build the pyramid!',
    type: GameType.LEARN,
    category: GameCategory.MATH,
    iconEmoji: '🏗️',
    minAge: 6,
    maxAge: 12,
    basePoints: 20,
    isEgyptianThemed: true,
    culturalThemes: ['History', 'Ancient Egypt'],
    iconBadges: ['Historical', 'Educational'],
    config: {
      levels: 5,
      difficultyScale: 1.2,
    },
  });
  await pharaohMath.save();

  const localStories = new GameModel({
    title: 'Local Stories',
    description: 'Discover Egyptian folklore and traditions.',
    type: GameType.PLAY,
    category: GameCategory.LANGUAGE,
    iconEmoji: '📜',
    minAge: 3,
    maxAge: 8,
    basePoints: 15,
    isEgyptianThemed: true,
    culturalThemes: ['Folklore', 'Tradition'],
    iconBadges: ['Local Stories', 'Family'],
    config: {
      interactiveElements: true,
    },
  });
  await localStories.save();

  console.log('✅ Games created: Memory Match, Math Quiz, Pharaoh\'s Math Pyramid, Local Stories');

  // 8. Create Badges
  const firstGameBadge = new BadgeModel({
    name: 'First Game',
    description: 'Complete your first game!',
    iconEmoji: '🌟',
    category: BadgeCategory.ACHIEVEMENT,
    criteria: { type: 'first_game' },
  });
  await firstGameBadge.save();

  const pointsMilestoneBadge = new BadgeModel({
    name: '100 Points',
    description: 'Earn 100 total points!',
    iconEmoji: '💯',
    category: BadgeCategory.MILESTONE,
    criteria: { type: 'points_milestone', points: 100 },
  });
  await pointsMilestoneBadge.save();

  const streakBadge = new BadgeModel({
    name: 'Hot Streak',
    description: 'Play games 5 days in a row!',
    iconEmoji: '🔥',
    category: BadgeCategory.STREAK,
    criteria: { type: 'streak', days: 5 },
  });
  await streakBadge.save();

  const mathMasterBadge = new BadgeModel({
    name: 'Math Master',
    description: 'Get 100% accuracy in Math Quiz!',
    iconEmoji: '🧮',
    category: BadgeCategory.MASTERY,
    criteria: { type: 'perfect_score' },
  });
  await mathMasterBadge.save();
  console.log('✅ Badges created: 4 achievement badges');

  // 9. Create Sandbox Assets (F-REQ-03)
  const pyramidAsset = new SandboxAssetModel({
    name: 'Great Pyramid',
    type: 'building',
    isEgyptianThemed: true,
    isLocked: true,
    unlockCriteriaGameId: pharaohMath._id,
  });
  await pyramidAsset.save();

  const pharaohAsset = new SandboxAssetModel({
    name: 'Pharaoh Khufu',
    type: 'character',
    isEgyptianThemed: true,
    isLocked: false,
  });
  await pharaohAsset.save();

  const hieroglyphAsset = new SandboxAssetModel({
    name: 'Hieroglyph Set',
    type: 'item',
    isEgyptianThemed: true,
    isLocked: true,
    unlockCriteriaGameId: pharaohMath._id,
  });
  await hieroglyphAsset.save();

  console.log('✅ Sandbox assets created: Great Pyramid, Pharaoh Khufu, Hieroglyph Set');

  // 10. Link existing Child to Classroom (F-REQ-07)
  const classroomStudent = new ClassroomStudentModel({
    classroomId: classroom._id,
    childId: child._id,
  });
  await classroomStudent.save();

  console.log('✅ Classroom and Student link created');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📝 Demo Accounts:');
  console.log('-------------------');
  console.log('Admin:   admin@playlearn.eg / password123');
  console.log('Parent:  parent@example.eg / password123');
  console.log('Teacher: teacher@school.eg / password123');
  console.log('-------------------\n');

  await mongoose.disconnect();
}

seed()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
