import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'

@Injectable()
export class OpenaiService {
  private readonly client: OpenAI
  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
    })
  }

  /**
   * chat
   */
  public async chat(prompt: string) {
    const response = await this.client.responses.create({
      model: 'gpt-3.5-turbo',
      input: 'Write a one-sentence bedtime story about a unicorn.',
    })

    console.log({
      prompt,
      response,
    })
    return { status: 'ok ' }
  }
}
