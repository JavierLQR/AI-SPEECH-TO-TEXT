import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { ChatCohere, CohereEmbeddings } from '@langchain/cohere'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableWithMessageHistory } from '@langchain/core/runnables'
import { MongoDBChatMessageHistory } from '@langchain/mongodb'
import { Collection, ObjectId } from 'mongodb'

import { MongoHistoryChatService } from '../mongo-history-chat/mongo-history-chat.service'
import { coherePrompt } from './cohere-prompt'

@Injectable()
export class CohereModelEmbedService {
  private readonly modelEmbeddings: CohereEmbeddings
  private readonly model: ChatCohere
  private readonly chain: ReturnType<typeof ChatPromptTemplate.prototype.pipe>

  private readonly logger: Logger = new Logger(CohereModelEmbedService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly mongodbService: MongoHistoryChatService,
  ) {
    this.model = new ChatCohere({
      apiKey: this.configService.getOrThrow<string>('COHERE_API_KEY'),
      model: this.configService.getOrThrow<string>('COHERE_MODEL_CHAT'),
      metadata: {
        model: this.configService.getOrThrow<string>('COHERE_MODEL_CHAT'),
        name: this.configService.getOrThrow<string>(
          'COHERE_MODEL_EMBED_ENGLISH',
        ),
        owner: 'rodrigo',
      },
      temperature: 0.1,
      streaming: true,
      maxRetries: 2,
      maxConcurrency: 2,
      onFailedAttempt: (error) => this.logger.error(error),
    })

    this.modelEmbeddings = new CohereEmbeddings({
      apiKey: this.configService.getOrThrow<string>('COHERE_API_KEY'),
      model: this.configService.getOrThrow<string>(
        'COHERE_MODEL_EMBED_ENGLISH',
      ),
      maxConcurrency: 2,
      inputType: 'text',
      onFailedAttempt: (error) => this.logger.error(error),
      maxRetries: 2,
    })

    this.model.withConfig({
      maxTokens: 150,
    })

    const parsed = new StringOutputParser()

    this.chain = coherePrompt.pipe(this.model).pipe(parsed)
  }

  /**
   * Devuelve un chain con historial de conversación desde MongoDB
   * @param collection - Colección de MongoDB
   * @param sessionId - ID único por usuario o conversación
   */
  public withMemory(sessionId?: string) {
    const chatId = sessionId || new ObjectId().toString()
    return new RunnableWithMessageHistory({
      runnable: this.chain,
      getMessageHistory: () =>
        new MongoDBChatMessageHistory({
          sessionId: chatId,
          collection: this.mongodbService.Colletion,
        }),
      inputMessagesKey: 'question',
      historyMessagesKey: 'chat_history',
      outputMessagesKey: 'output',
      config: {
        maxConcurrency: 2,
      },
    })
  }

  public get Collection(): Collection {
    return this.mongodbService.Colletion
  }

  /**
   * Getter para acceder al chain desde otros servicios
   * @returns Runnable
   * @private
   */
  public get productChain(): ReturnType<
    typeof ChatPromptTemplate.prototype.pipe
  > {
    return this.chain
  }

  /**
   * Getter para acceder al embeddings desde otros servicios
   * @returns CohereEmbeddings
   * @private
   */
  public get embeddings(): CohereEmbeddings {
    return this.modelEmbeddings
  }
}
