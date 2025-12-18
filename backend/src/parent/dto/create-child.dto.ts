import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateChildDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsInt()
  @Min(3)
  @Max(12)
  age: number;

  @IsString()
  @IsOptional()
  locale?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
