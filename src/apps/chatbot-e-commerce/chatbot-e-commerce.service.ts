// Modules Nest
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from 'nestjs-prisma'

// My Modules
import { MongoHistoryChatService } from 'src/modules/app-history/mongo-history-chat/mongo-history-chat.service'
import { PineconeService } from 'src/modules/app-history/pinecone/pinecone.service'
import { ChatbotSessionsDto } from './dto/chatbot-sessions.dto'
import { FilterFindHistoryService } from './filters/filters'
import { PartialHistoryChat } from './interfaces/partial-history-chat.interface'
// import { HistoryChatMapper } from './mappers/history-chat.mapper'
import { ApiResponse } from 'src/common/helpers/api.response'
import { PusherService } from '../pusher/pusher.service'
import { ChatMessage } from './entitie/chatbot-e-commerce.entity'
import { mitralPrompt } from './prompt'

// Modules Langchain
import { Document } from '@langchain/core/documents'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableWithMessageHistory } from '@langchain/core/runnables'
import { ChatMistralAI, MistralAIEmbeddings } from '@langchain/mistralai'
import { MongoDBChatMessageHistory } from '@langchain/mongodb'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

// My Modules

@Injectable()
export class ChatbotECommerceService {
  private readonly mistralAIEmbeddings: MistralAIEmbeddings
  private readonly chatMistralAI: ChatMistralAI
  private readonly chain: ReturnType<typeof ChatPromptTemplate.prototype.pipe>

  private readonly logger = new Logger(ChatbotECommerceService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,

    private readonly pineconeService: PineconeService,
    private readonly mongoHistoryChatService: MongoHistoryChatService,

    private readonly pusherService: PusherService,

    @InjectModel(ChatMessage.name)
    private readonly modelHistoryChat: Model<ChatMessage>,

    private readonly filterFindHistoryService: FilterFindHistoryService,
  ) {
    this.mistralAIEmbeddings = new MistralAIEmbeddings({
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
      model: this.configService.getOrThrow<string>('MISTRAL_EMBEDDINGS_MODEL'),
      maxConcurrency: 2,
      maxRetries: 3,

      onFailedAttempt: (error) => this.logger.error(error),
    })

    this.chatMistralAI = new ChatMistralAI({
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
      model: this.configService.getOrThrow<string>(
        'MISTRAL_MODEL_LANCHAING_CHAT',
      ),
      temperature: 0,
      maxRetries: 3,
      maxConcurrency: 2,
      maxTokens: 500,

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
    this.logger.verbose(`SessionId: "(${sessionId})" | UserId: "(${userId})"`)

    const chatsHistory = await this.modelHistoryChat
      .find({
        userId,
        sessionId,
      })
      .select(this.filterFindHistoryService.projection)
      .sort({ createdAt: 1, _id: 1 })
      .lean<PartialHistoryChat[]>()

    // const mapper = HistoryChatMapper(chatsHistory)

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
    const { question, sessionId, userId, channelMessage } = chatbotSessionsDto
    console.log({
      chatbotSessionsDto,
    })

    this.logger.verbose(
      `Question "(${question})" | SessionId "(${sessionId})" | UserId "(${userId})"`,
    )

    const session_id = sessionId || this.mongoHistoryChatService.getObjetId

    const chain = this.getChainWithMemory(session_id)

    const { context, retrievedProducts } =
      await this.getSimilaritySearchWithScore(question, 2)

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
      const { channelName, eventName, userId } = channelMessage

      await this.pusherService.trigger({
        channelName,
        eventName,
        data: {
          message: chunk,
          userId,
          sessionId: session_id,
          userQuestion: question,
        },
        userId,
      })

      fullReponse += chunk
    }

    void this.createHistoryChat(
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
        response: fullReponse,
      },
      service: 'chatbot-ecommerce',
    })
  }

  private createHistoryChat(
    sessionId: string,
    userId: string,
    question: string,
    fullReponse: string,
    retrievedProducts: { name: string; score: number }[],
  ) {
    void this.modelHistoryChat.create([
      {
        sessionId,
        userId,
        content: question,
        role: 'user',
        isUser: true,
      },
      {
        sessionId,
        userId,
        content: fullReponse,
        role: 'assistant',
        isUser: false,
        retrievedProducts,
      },
    ])
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
