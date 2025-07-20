import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class ChatbotSessionsDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  sessionId: string

  @IsString()
  @IsNotEmpty()
  userId: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  question: string
}
