import { IsNotEmpty, IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateActivityEventDto {
  @IsString()
  @IsNotEmpty()
  childId: string;

  @IsString()
  @IsNotEmpty()
  eventType: string; // 'game_start', 'game_complete', 'login', 'logout', etc.

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  gameId?: string;

  @IsNumber()
  @IsOptional()
  score?: number;

  @IsNumber()
  @IsOptional()
  duration?: number; // in seconds
}
