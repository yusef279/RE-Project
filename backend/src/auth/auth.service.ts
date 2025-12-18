import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../schemas/user.schema';
import { ParentProfile } from '../schemas/parent-profile.schema';
import { TeacherProfile } from '../schemas/teacher-profile.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(ParentProfile.name)
    private parentProfileModel: Model<ParentProfile>,
    @InjectModel(TeacherProfile.name)
    private teacherProfileModel: Model<TeacherProfile>,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { email, password, role, fullName, phone, school } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email }).exec();

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Only allow parent and teacher registration
    if (role !== UserRole.PARENT && role !== UserRole.TEACHER) {
      throw new BadRequestException(
        'Only parents and teachers can register directly',
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new this.userModel({
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await user.save();

    // Create profile based on role
    let profileId: string | undefined = undefined;

    if (role === UserRole.PARENT) {
      const parentProfile = new this.parentProfileModel({
        fullName,
        phone,
        userId: savedUser._id,
      });
      const savedProfile = await parentProfile.save();
      profileId = (savedProfile._id as Types.ObjectId).toString();
    } else if (role === UserRole.TEACHER) {
      const teacherProfile = new this.teacherProfileModel({
        fullName,
        phone,
        school,
        userId: savedUser._id,
      });
      const savedProfile = await teacherProfile.save();
      profileId = (savedProfile._id as Types.ObjectId).toString();
    }

    // Generate JWT
    const payload: JwtPayload = {
      sub: (savedUser._id as Types.ObjectId).toString(),
      email: savedUser.email,
      role: savedUser.role as UserRole,
      profileId: profileId || '',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        profileId: profileId || '',
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).exec();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get profile ID
    let profileId: string | undefined = undefined;
    if (user.role === UserRole.PARENT) {
      const profile = await this.parentProfileModel.findOne({ userId: user._id }).exec();
      if (profile) profileId = (profile._id as Types.ObjectId).toString();
    } else if (user.role === UserRole.TEACHER) {
      const profile = await this.teacherProfileModel.findOne({ userId: user._id }).exec();
      if (profile) profileId = (profile._id as Types.ObjectId).toString();
    }

    const payload: JwtPayload = {
      sub: (user._id as Types.ObjectId).toString(),
      email: user.email,
      role: user.role as UserRole,
      profileId: profileId || '',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profileId: profileId || '',
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  async getProfileId(userId: string, role: string): Promise<string> {
    if (role === UserRole.PARENT) {
      const profile = await this.parentProfileModel.findOne({ userId }).exec();
      return profile ? (profile._id as Types.ObjectId).toString() : '';
    } else if (role === UserRole.TEACHER) {
      const profile = await this.teacherProfileModel.findOne({ userId }).exec();
      return profile ? (profile._id as Types.ObjectId).toString() : '';
    }
    return '';
  }
}
