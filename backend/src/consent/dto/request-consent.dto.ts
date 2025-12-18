import { IsNotEmpty, IsString, IsEnum, IsOptional, ValidateIf } from 'class-validator';
import { ConsentType } from '../../schemas/consent.schema';

export class RequestConsentDto {
  @IsEnum(ConsentType)
  type: ConsentType;

  @IsString()
  @IsNotEmpty()
  parentId: string;

  @ValidateIf((o) => o.type === ConsentType.CHILD)
  @IsString()
  @IsNotEmpty()
  childId?: string;

  @ValidateIf((o) => o.type === ConsentType.CLASSROOM)
  @IsString()
  @IsNotEmpty()
  classroomId?: string;

  @IsString()
  @IsOptional()
  message?: string;
}
