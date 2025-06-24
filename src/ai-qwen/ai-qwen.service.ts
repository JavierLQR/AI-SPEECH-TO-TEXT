import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
@Injectable()
export class AiQwenService {
  private readonly openai: OpenAI
  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
    })
  }
  getPrompt() {
    return this.openai.chat.completions.create({
      model: 'qwen',
      messages: [{ role: 'user', content: 'Hello World!' }],
    })
  }
}
