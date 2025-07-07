import { ChatMistralAI } from '@langchain/mistralai'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { ChatPromptTemplate, ParamsFromFString } from '@langchain/core/prompts'
import { Runnable } from '@langchain/core/runnables'
import { MongoDBChatMessageHistory } from '@langchain/mongodb'
import { BufferMemory, MemoryVariables } from 'langchain/memory'
import { MongoClient } from 'mongodb'

import { StringOutputParser } from '@langchain/core/output_parsers'
@Injectable()
export class GetModelService {
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
      streaming: true, // very important to use streaming
      callbacks: [],
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
  public getModel() {
    if (!this.model) throw new BadRequestException("Model doesn't exist")
    return this.model
  }

  /**
   *
   * @returns Returns the prompt
   * @private
   */
  private getPrompt() {
    return ChatPromptTemplate.fromTemplate(`
      A continuación tienes el historial de la conversación entre el usuario y el asistente de productos. Usa este historial para responder correctamente
      
      Historial:
      {chat_history}
      
      Usuario: {question}
      Asistente:

    `)
  }

  public getParsed(): StringOutputParser {
    return new StringOutputParser()
  }

  /**
   *
   * @param question Param question
   * @param sessionId Param sessionId
   * @returns Promise<MemoryVariables>
   * @private
   */
  public async getHistorialMemory(
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
  public async saveContextMemory(
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

  public getChainModel(): Runnable<ParamsFromFString<string>> {
    return this.getPrompt().pipe(this.getModel()).pipe(this.getParsed())
  }
}
