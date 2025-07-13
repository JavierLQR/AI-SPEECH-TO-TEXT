import { Controller, Get } from '@nestjs/common'
import { FireworksAiService } from './fireworks-ai.service'

@Controller('fireworks-ai')
export class FireworksAiController {
  constructor(private readonly fireworksAiService: FireworksAiService) {}

  @Get('/chat')
  getPrompt() {
    return this.fireworksAiService.getPrompt()
  }
}
