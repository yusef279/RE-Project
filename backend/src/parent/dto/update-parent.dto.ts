import { IsString, IsOptional, IsPhoneNumber } from 'class-validator';

export class UpdateParentDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
