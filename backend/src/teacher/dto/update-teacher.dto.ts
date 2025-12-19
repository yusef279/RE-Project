import { IsString, IsOptional, IsPhoneNumber } from 'class-validator';

export class UpdateTeacherDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsString()
  @IsOptional()
  school?: string;
}
