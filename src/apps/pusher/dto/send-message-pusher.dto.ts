import { Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

class DataMessage {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  id?: string

  @IsNotEmpty()
  @IsString()
  message: string

  @IsNotEmpty()
  @IsString()
  userId: string

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  timestamp?: string | Date

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  sessionId: string

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  userQuestion: string

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  assistantResponse?: string

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  messageId?: string

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  _id?: string
}

export class SendMessagePusherDto {
  @IsString()
  @IsNotEmpty()
  channelName: string

  @IsNotEmpty()
  @IsString()
  eventName: string

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DataMessage)
  data: DataMessage

  @IsNotEmpty()
  @IsString()
  userId: string

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  socket_id?: string
}
