import { Controller, Get } from '@nestjs/common'
import { GeminiSpeechService } from './gemini-speech.service'

@Controller('gemini-speech')
export class GeminiSpeechController {
  constructor(private readonly geminiSpeechService: GeminiSpeechService) {}

  @Get('speech')
  speech() {
    return this.geminiSpeechService.speech()
  }
}
