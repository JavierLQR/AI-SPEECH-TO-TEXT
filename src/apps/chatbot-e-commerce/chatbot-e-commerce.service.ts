import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { ApiResponse } from 'src/common/utils/response.client'
import { PineconeService } from 'src/modules/app-history/pinecone/pinecone.service'

import { ChatMistralAI, MistralAIEmbeddings } from '@langchain/mistralai'
import { PrismaService } from 'nestjs-prisma'
import { Document } from '@langchain/core/documents'
import { mitralPrompt } from './prompt'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

@Injectable()
export class ChatbotECommerceService {
  private readonly mistralAIEmbeddings: MistralAIEmbeddings
  private readonly chatMistralAI: ChatMistralAI
  private readonly chain: ReturnType<typeof ChatPromptTemplate.prototype.pipe>

  private readonly logger = new Logger(ChatbotECommerceService.name)

  constructor(
    private readonly pineconeService: PineconeService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
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
      maxTokens: 300,

      onFailedAttempt: (error) => this.logger.error(error),
    })

    const parsed = new StringOutputParser()
    this.chain = mitralPrompt.pipe(this.chatMistralAI).pipe(parsed)
  }

  /**
   * chatBotEcommmerce
   */
  public async chatBotEcommmerce(question: string) {
    this.logger.verbose(`Question "(${question})"`)

    const search = await this.getPineconeStore(
      'bot-e-commerce',
    ).similaritySearchWithScore(question, 3)

    const context = search
      .map(([{ pageContent }, score]) => `${pageContent} (Score: ${score})`)
      .join('\n\n')

    const response = await this.chain.invoke({ question, context })

    return ApiResponse({
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: {
        response,
      },
      service: 'chatbot-ecommerce',
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
