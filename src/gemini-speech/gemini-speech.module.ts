import { Module } from '@nestjs/common'
import { GeminiSpeechService } from './gemini-speech.service'
import { GeminiSpeechController } from './gemini-speech.controller'

@Module({
  controllers: [GeminiSpeechController],
  providers: [GeminiSpeechService],
})
export class GeminiSpeechModule {}
