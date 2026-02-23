import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum AnnouncementAudience {
  MEMBERS = 'members',
  FRIENDS = 'friends',
  ALL = 'all',
  CUSTOM = 'custom',
}

export class CreateAnnouncementDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsString()
  @MinLength(1)
  body: string;

  @IsEnum(AnnouncementAudience)
  audience: AnnouncementAudience;

  // TODO: requirement asked for string[] (UUID). In this codebase users.id is int,
  // so we accept numeric ids. If users.id migrates to UUID, switch validation.
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  userIds?: number[];
}

