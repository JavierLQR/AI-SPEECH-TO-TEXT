import { Controller, Get } from '@nestjs/common'
import { AiQwenService } from './ai-qwen.service'

@Controller('ai-qwen')
export class AiQwenController {
  constructor(private readonly aiQwenService: AiQwenService) {}

  @Get('prompt')
  getPrompt() {
    return this.aiQwenService.getPrompt()
  }
}
