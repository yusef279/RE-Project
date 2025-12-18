import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CompleteGameDto {
  @IsString()
  @IsNotEmpty()
  childId: string;

  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsNumber()
  @Min(0)
  score: number;

  @IsNumber()
  @Min(1)
  duration: number; // in seconds

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  accuracyPercent?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}
