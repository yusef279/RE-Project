import { IsString, IsOptional, IsInt, Min, Max, IsUrl } from 'class-validator';

export class UpdateChildDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsInt()
  @Min(3)
  @Max(12)
  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  locale?: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;
}
