import { PartialType } from '@nestjs/mapped-types'
import { CreatePushbulletDto } from './create-pushbullet.dto'

export class UpdatePushbulletDto extends PartialType(CreatePushbulletDto) {}
