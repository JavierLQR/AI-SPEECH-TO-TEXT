import { Controller } from '@nestjs/common'
import { DeepseekService } from './deepseek.service'

@Controller('deepseek')
export class DeepseekController {
  constructor(private readonly deepseekService: DeepseekService) {}
}
