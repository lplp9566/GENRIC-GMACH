import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AskDto {
  @IsString()
  @IsOptional()
  conversationId?: string;

  @IsString()
  @IsNotEmpty()
  question: string;
}
