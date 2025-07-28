import { Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

class ChannelMessageDto {
  @IsString()
  @IsNotEmpty()
  channelName: string

  @IsString()
  @IsNotEmpty()
  eventName: string

  @IsString()
  @IsOptional()
  id: string

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  message: string

  @IsString()
  @IsNotEmpty()
  userId: string

  @IsString()
  @IsOptional()
  timestamp: string
}

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

  @IsOptional()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ChannelMessageDto)
  channelMessage: ChannelMessageDto
}
