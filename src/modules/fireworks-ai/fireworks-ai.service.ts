import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'

@Injectable()
export class FireworksAiService {
  private readonly openai: OpenAI
  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      baseURL: 'https://api.fireworks.ai/inference/v1',
      apiKey: this.configService.getOrThrow<string>('FIREWORKS_API_KEY'),
    })
  }
  async getPrompt() {
    const completion = await this.openai.chat.completions.create({
      messages: [
        { role: 'user', content: 'hola estoy probando, como estas' },
        {
          role: 'system',
          content: 'hola estoy probando, como estas',
        },
      ],
      max_completion_tokens: 100,

      model: 'accounts/fireworks/models/deepseek-r1',
    })
    return {
      completion,
    }
  }
}
