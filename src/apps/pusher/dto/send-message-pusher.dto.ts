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
