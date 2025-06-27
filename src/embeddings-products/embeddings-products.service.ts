import { Injectable } from '@nestjs/common'
import { MistralAI } from '@langchain/mistralai'
import { ConfigService } from '@nestjs/config'
import { MistralAIEmbeddings } from '@langchain/mistralai'

@Injectable()
export class EmbeddingsProductsService {
  private readonly llm: MistralAI
  private readonly embeddings: MistralAIEmbeddings

  constructor(private readonly configService: ConfigService) {
    this.embeddings = new MistralAIEmbeddings({
      model: this.configService.getOrThrow<string>('MISTRAL_EMBEDDINGS_MODEL'),
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
    })
  }

  public async createEmbeddings(text: string) {
    const embed = await this.embeddings.embedQuery(text)

    return {
      embed,
    }
  }
}
