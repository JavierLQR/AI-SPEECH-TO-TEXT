import { PartialType } from '@nestjs/mapped-types'
import { CreatePusherDto } from './create-pusher.dto'

export class UpdatePusherDto extends PartialType(CreatePusherDto) {}
