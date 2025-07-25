import { IsNotEmpty, IsString } from 'class-validator'

export class AuthPusherDto {
  @IsString({ message: 'socket_id must be a string' })
  @IsNotEmpty({ message: 'socket_id is required' })
  socket_id: string

  @IsNotEmpty({ message: 'channel_name is required' })
  @IsString({ message: 'channel_name must be a string' })
  channel_name: string
}
