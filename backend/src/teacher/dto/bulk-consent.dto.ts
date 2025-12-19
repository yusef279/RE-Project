import { IsArray, IsString, IsOptional, IsEnum } from 'class-validator';
import { ConsentType } from '../../schemas/consent.schema';

export class BulkConsentDto {
  @IsArray()
  @IsString({ each: true })
  childIds: string[];

  @IsString()
  classroomId: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsEnum(ConsentType)
  type: ConsentType;
}
