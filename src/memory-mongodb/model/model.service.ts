import { ChatMistralAI } from '@langchain/mistralai'
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { MongoDBChatMessageHistory } from '@langchain/mongodb'
import { MongoClient } from 'mongodb'
import { BufferMemory, MemoryVariables } from 'langchain/memory'
import { ParamsFromFString } from '@langchain/core/prompts'
import { Runnable } from '@langchain/core/runnables'

import { GetParsed, GetPrompt } from '../prompts/get.prompt'
@Injectable()
export class GetModelService {
  private readonly logger = new Logger(GetModelService.name)
  private readonly model: ChatMistralAI

  /**
   *
   * @param configService Param configService
   * @param client Param client
   */
  constructor(
    private readonly configService: ConfigService,
    @Inject(MongoClient.name) private readonly client: MongoClient,
  ) {
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

  /**
   *
   * @returns Returns the model
   * @private
   */
  private getModel() {
    this.logger.log('Modelo cargado')
    return this.model
  }

  /**
   *
   * @returns Returns the prompt
   * @private
   */
  private getPrompt() {
    return GetPrompt()
  }

  /**
   *
   * @param question Param question
   * @param sessionId Param sessionId
   * @returns Promise<MemoryVariables>
   * @private
   */
  async getHistorialMemory(
    question: string,
    sessionId: string,
  ): Promise<MemoryVariables> {
    if (!sessionId) throw new BadRequestException('Session id is required')

    const memory = this.getMemory(sessionId)
    return await memory.loadMemoryVariables({
      question,
    })
  }

  /**
   *
   * @param sessionId
   * @returns Returns a BufferMemory
   * @private
   */
  private getMemory(sessionId: string): BufferMemory {
    if (!sessionId) throw new BadRequestException('Session id is required')

    const collection = this.client.db('langchaing').collection('memory')

    return new BufferMemory({
      chatHistory: new MongoDBChatMessageHistory({
        collection,
        sessionId,
      }),
      memoryKey: 'chat_history',
      inputKey: 'question',
      outputKey: 'response',
      returnMessages: true,
    })
  }

  /**
   *
   * @param question Param question
   * @param sessionId Param sessionId
   * @param response Param response
   * @private
   */
  async saveContextMemory(
    question: string,
    sessionId: string,
    response: string,
  ) {
    const memory = this.getMemory(sessionId)

    await memory.saveContext(
      { question },
      {
        response,
      },
    )
  }

  /**
   * Get chain model
   * @private
   * @returns Runnable<ParamsFromFString<string>>
   * */

  getChainModel(): Runnable<ParamsFromFString<string>> {
    this.logger.log('Chain model loaded')
    return this.getPrompt().pipe(this.getModel()).pipe(GetParsed())
  }
}
