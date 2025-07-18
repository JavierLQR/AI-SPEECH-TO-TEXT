// Modules Nest
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from 'nestjs-prisma'

// Modules Pusher
import * as Pusher from 'pusher'

// My Modules
import { ApiResponse } from 'src/common/utils/response.client'
import { MongoHistoryChatService } from 'src/modules/app-history/mongo-history-chat/mongo-history-chat.service'
import { PineconeService } from 'src/modules/app-history/pinecone/pinecone.service'
import { ChatbotSessionsDto } from '../dtos/chatbot-sessions.dto'
import { mitralPrompt, promptText } from './prompt'

// Modules Langchain
import { Document } from '@langchain/core/documents'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableWithMessageHistory } from '@langchain/core/runnables'
import { ChatMistralAI, MistralAIEmbeddings } from '@langchain/mistralai'
import { MongoDBChatMessageHistory } from '@langchain/mongodb'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { ChatHistoryUserEntity } from 'src/modules/chat-bot/entities/user-entity'

@Injectable()
export class ChatbotECommerceService {
  private readonly mistralAIEmbeddings: MistralAIEmbeddings
  private readonly chatMistralAI: ChatMistralAI
  private readonly chain: ReturnType<typeof ChatPromptTemplate.prototype.pipe>

  private readonly pusher: Pusher

  private readonly logger = new Logger(ChatbotECommerceService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,

    private readonly pineconeService: PineconeService,
    private readonly mongoHistoryChatService: MongoHistoryChatService,

    @InjectModel(ChatHistoryUserEntity.name)
    private readonly modelChatHistoryUserEntity: Model<ChatHistoryUserEntity>,
  ) {
    this.mistralAIEmbeddings = new MistralAIEmbeddings({
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
      model: this.configService.getOrThrow<string>('MISTRAL_EMBEDDINGS_MODEL'),
      maxConcurrency: 2,
      maxRetries: 3,

      onFailedAttempt: (error) => this.logger.error(error),
    })

    this.pusher = new Pusher({
      appId: this.configService.getOrThrow<string>('PUSHER_APP_ID'),
      key: this.configService.getOrThrow<string>('PUSHER_KEY'),
      secret: this.configService.getOrThrow<string>('PUSHER_SECRET'),
      cluster: this.configService.getOrThrow<string>('PUSHER_CLUSTER'),
      useTLS: true,
      timeout: 10000,
    })

    this.chatMistralAI = new ChatMistralAI({
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
      model: this.configService.getOrThrow<string>(
        'MISTRAL_MODEL_LANCHAING_CHAT',
      ),
      temperature: 0,
      maxRetries: 3,
      maxConcurrency: 2,
      maxTokens: 300,

      onFailedAttempt: (error) => this.logger.error(error),
    })

    const parsed = new StringOutputParser()
    this.chain = mitralPrompt.pipe(this.chatMistralAI).pipe(parsed)
  }

  /**
   * findChatHistory
   */
  public async findChatHistory(chatbotSessionsDto: ChatbotSessionsDto) {
    const { sessionId, userId } = chatbotSessionsDto

    const chatsHistory = await this.modelChatHistoryUserEntity
      .find({
        userId,
        sessionId,
      })
      .select({
        _id: true,
        sessionId: true,
        userQuestion: true,
        assistantResponse: true,
      })
      .lean()

    return ApiResponse({
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: chatsHistory,
      service: 'chatbot-ecommerce',
    })
  }

  /**
   * chatBotEcommmerce
   */
  public async chatBotEcommmerce(chatbotSessionsDto: ChatbotSessionsDto) {
    const { question, sessionId, userId } = chatbotSessionsDto

    this.logger.verbose(
      `Question "(${question})" | SessionId "(${sessionId})" | UserId "(${userId})"`,
    )

    const session_id = this.mongoHistoryChatService.getObjetId || sessionId

    const chain = this.getChainWithMemory(session_id)

    const { context, retrievedProducts } =
      await this.getSimilaritySearchWithScore(question, 3)

    const response = await chain.stream(
      {
        question,
        context,
      },
      {
        configurable: {
          sessionId: session_id,
        },
      },
    )
    let fullReponse: string = ''
    for await (const chunk of response as AsyncIterable<string>) {
      const isString = typeof chunk === 'string'
      if (!isString) continue
      console.log(`${chunk}|`)

      fullReponse += chunk
    }

    await this.createHistoryChat(
      session_id,
      userId,
      question,
      fullReponse,
      retrievedProducts,
    )

    return ApiResponse({
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: {
        sessionId,
        response,
      },
      service: 'chatbot-ecommerce',
    })
  }

  private async createHistoryChat(
    sessionId: string,
    userId: string,
    question: string,
    fullReponse: string,
    retrievedProducts: { name: string; score: number }[],
  ) {
    await this.modelChatHistoryUserEntity.create({
      sessionId,
      userId,
      userQuestion: question,
      assistantResponse: fullReponse,
      promptTemplate: JSON.stringify(promptText),
      retrievedProducts,
      embeddingUsed: await this.mistralAIEmbeddings.embedQuery(question),
      messageId: this.mongoHistoryChatService.getObjetId,
      modelName: this.chatMistralAI.getName(),
    })
  }

  private async getSimilaritySearchWithScore(question: string, k: number) {
    const search = await this.getPineconeStore(
      'bot-e-commerce',
    ).similaritySearchWithScore(question, k)

    return {
      retrievedProducts: search.map(([{ metadata }, score]) => ({
        score,
        name: String(metadata.name) || 'Unknown',
      })),
      context: search.map(([{ pageContent }]) => pageContent).join('\n\n'),
    }
  }

  private getChainWithMemory(sessionId: string) {
    console.log({
      sessionId,
    })

    return new RunnableWithMessageHistory({
      runnable: this.chain,
      getMessageHistory: () =>
        new MongoDBChatMessageHistory({
          collection: this.mongoHistoryChatService.Colletion,
          sessionId,
        }),
      config: {
        maxConcurrency: 2,
      },
      historyMessagesKey: 'chat_history',
      inputMessagesKey: 'question',
      outputMessagesKey: 'output',
    })
  }

  /**
   * insertDataInIndex
   */
  public async insertAllProductsInIndex(name: string) {
    const store = this.getPineconeStore(name)

    const batchSize = 100
    let skip = 0
    let totalInserted = 0

    while (true) {
      const products = await this.prismaService.productChatBot.findMany({
        skip,
        take: batchSize,
        orderBy: { id: 'asc' },

        select: {
          id: true,
          description: true,
          imageUrl: true,
          name: true,
          price: true,
          stock: true,
          category: { select: { id: true, name: true } },
        },
      })

      if (products.length === 0) break

      const documents: Document[] = products.map(
        ({ category, description, id, imageUrl, name, price, stock }) => ({
          pageContent: `${name}. Category: ${category.name}. Description: ${description}. Price: $${Number(price)}. Stock: ${stock}. Image: ${imageUrl}.`,
          metadata: {
            id,
            name,
            description,
            price,
            stock,
            category: category.name,
            imageUrl,
          },
        }),
      )

      await store.addDocuments(documents)

      skip += batchSize
      totalInserted += products.length

      this.logger.log(`Insertados ${totalInserted} productos hasta ahora...`)
    }

    this.logger.log(
      `✅ Inserción completa: ${totalInserted} productos en el índice "${name}"`,
    )
  }
  /**
   * createIndex
   */
  public async createIndex(name: string) {
    const index = await this.pineconeService.createIndexPinecone({
      name,
      vectorType: 'dense',
      dimension: 1536,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
      deletionProtection: 'disabled',
      tags: {
        environment: 'development',
        model: this.configService.getOrThrow<string>(
          'MISTRAL_EMBEDDINGS_MODEL',
        ),
        name,
        owner: 'javier rojas',
      },
    })

    return ApiResponse({
      message: 'Index creado exitosamente',
      data: index,
      statusCode: HttpStatus.OK,
      service: 'Pinecone',
    })
  }

  /**
   * getPineconeStore
   */
  private getPineconeStore(name: string) {
    const pineconeIndex = this.pineconeService.getPineconeIndexName(
      name,
      'ecommerce',
    )
    return this.pineconeService.getPineconeStore(this.mistralAIEmbeddings, {
      maxConcurrency: 2,
      maxRetries: 3,
      namespace: 'ecommerce',
      textKey: 'pageContent',
      pineconeIndex,
    })
  }
}
