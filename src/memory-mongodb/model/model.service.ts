import { ChatMistralAI } from '@langchain/mistralai'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GetParsed, GetPrompt } from '../prompts/get.prompt'

@Injectable()
export class GetModelService {
  private readonly logger = new Logger(GetModelService.name)
  private readonly model: ChatMistralAI

  constructor(private readonly configService: ConfigService) {
    this.model = new ChatMistralAI({
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
      model: this.configService.getOrThrow<string>('MISTRAL_MODEL'),
      temperature: 0.1,
      maxTokens: 300,
      metadata: {
        model: this.configService.getOrThrow<string>('MISTRAL_MODEL'),
        name: this.configService.getOrThrow<string>('MISTRAL_MODEL'),
      },
    })
  }

  private getModel() {
    this.logger.log('Modelo cargado')
    return this.model
  }

  private getPrompt() {
    return GetPrompt()
  }

  getChainModel() {
    this.logger.log('Chain model loaded')
    return this.getPrompt().pipe(this.getModel()).pipe(GetParsed())
  }
}
