import { PartialType } from '@nestjs/mapped-types'
import { CreateDeepseekDto } from './create-deepseek.dto'

export class UpdateDeepseekDto extends PartialType(CreateDeepseekDto) {}
