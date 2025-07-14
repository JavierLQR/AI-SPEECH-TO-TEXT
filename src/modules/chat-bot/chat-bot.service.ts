import { Injectable, Logger } from '@nestjs/common'

import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { CohereModelEmbedService } from '../app-history/cohere-model-embed/cohere-model-embed.service'
import { PineconeService } from '../app-history/pinecone/pinecone.service'
import { ChatHistoryUserEntity } from './entities/user-entity'

@Injectable()
export class ChatBotService {
  private readonly logger: Logger = new Logger(ChatBotService.name)
  constructor(
    @InjectModel(ChatHistoryUserEntity.name)
    private readonly chatHistoryUserEntity: Model<ChatHistoryUserEntity>,

    private readonly pineconeService: PineconeService,
    private readonly cohereModelEmbedService: CohereModelEmbedService,
  ) {}

  /**
   * getMessages
   */
  public async getMessages(text: string) {
    const chain = this.cohereModelEmbedService.withMemory('123456')

    const modelEmbeddings = this.cohereModelEmbedService.embeddings

    const pineconeIndex = this.pineconeService.getPineconeIndexName(
      'list-products',
      'dev',
    )

    const pineconeStore = this.pineconeService.getPineconeStore(
      modelEmbeddings,
      {
        namespace: 'dev',
        textKey: 'pageContent',
        pineconeIndex,
        maxConcurrency: 2,
        maxRetries: 2,
        onFailedAttempt: (error) => this.logger.error(error),
      },
    )

    const similaritySearch = await pineconeStore.similaritySearchWithScore(
      text,
      5,
    )

    const context = similaritySearch.map(([doc]) => doc.pageContent).join('\n')

    const response = await chain.stream(
      {
        context,
        question: text,
      },
      {
        configurable: {
          sessionId: '123456',
        },
      },
    )
    console.log({
      response,
    })

    let fullResponse: string = ''

    for await (const text of response) {
      const isString = typeof text === 'string'
      if (!isString) continue
      fullResponse += text
      console.log({ text })
    }
    console.log({
      fullResponse,
    })

    // await this.chatHistoryUserEntity.create({
    //   sessionId: '123456',
    //   userQuestion: text,
    //   assistantResponse: fullResponse,
    //   retrievedProducts: similaritySearch.map(([{ metadata }, score]) => ({
    //     name: metadata.name ?? '',
    //     score,
    //   })),
    //   userId: '123456',
    //   embeddingUsed: await modelEmbeddings.embedQuery(text),
    //   messageId: '123456',
    //   tokensUsed: 1000,
    //   latencyMs: 1000,
    //   promptTemplate: 'prompt',
    //   modelName: 'Cohere',
    // })
  }
}
