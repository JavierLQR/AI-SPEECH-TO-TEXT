import { Injectable, Logger } from '@nestjs/common'
import { PineconeService } from './pinecone/pinecone.service'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from 'nestjs-prisma'

import { CohereModelEmbedService } from './cohere-model-embed/cohere-model-embed.service'
import { PineconeStore } from '@langchain/pinecone'
import { PusherService } from './pusher/pusher.service'
// import { MongoDBChatMessageHistory } from '@langchain/mongodb'

@Injectable()
export class AppHistoryService {
  private readonly logger: Logger = new Logger(AppHistoryService.name)

  constructor(
    private readonly configService: ConfigService,

    private readonly pineconeService: PineconeService,
    private readonly cohereModelEmbedService: CohereModelEmbedService,
    private readonly pusherService: PusherService,

    private readonly prismaService: PrismaService,
  ) {}

  /**
   * createIndex
   */
  public async createIndex(name: string) {
    return await this.pineconeService.createIndexPinecone({
      name,
      vectorType: 'dense',
      dimension: 1024,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
      deletionProtection: 'enabled',
      tags: {
        environment: 'development',
        app: 'app-history',
        model: this.configService.getOrThrow<string>(
          'COHERE_MODEL_EMBED_ENGLISH',
        ),
        dimension: '1024',
        owner: 'rodrigo',
        version: '1.0.0',
        name,
      },
    })
  }

  /**
   * insertDataInIndex
   */
  public async insertDataInIndex(name: string, namespace: string) {
    this.logger.verbose('Initializing Pinecone store...')
    const index = this.pineconeService.getPineconeIndexName(name, namespace)
    const modelEmbeddings = this.cohereModelEmbedService.embeddings

    const pineconeStore = this.pineconeService.getPineconeStore(
      modelEmbeddings,
      {
        namespace,
        textKey: 'pageContent',
        pineconeIndex: index,
        maxConcurrency: 2,
        maxRetries: 2,
        onFailedAttempt: (error) => this.logger.error(error),
      },
    )

    await this.insertForBatch(pineconeStore)
  }

  /**
   * chatIndex
   */
  public async chatIndex(text: string) {
    const id = '123456'
    // probar si se peude utilzia redis para el cahe y luego tiempo real en chat con next js
    //  y probar con el otro modelo
    // const chain = this.cohereModelEmbedService.productChain

    // obtener la base de datos de pinecone
    const indexPinecone = this.getPineconeStore('dev', 'list-products')

    // Buscar productos en la base de datos Pinecone
    const result = await indexPinecone.similaritySearch(text, 3)

    // Contexto de productos
    const context = result.map(({ pageContent }) => pageContent).join('\n\n')

    // Obtener la respuesta del chat
    const responseAI = await this.chatStream(text, id, context)

    return {
      responseAI,
    }
  }

  private async chatStream(text: string, id: string, context: string) {
    const chat = this.cohereModelEmbedService.withMemory(id)
    const stream = await chat.stream(
      {
        context,
        question: text,
      },
      {
        configurable: {
          sessionId: id,
        },
      },
    )
    let chunkFullResponse: string = ''
    for await (const chunk of stream) {
      const isString = typeof chunk === 'string'
      if (!isString) continue
      console.log(`${chunk}|`)

      chunkFullResponse += chunk

      await this.pusherService.trigger(chunk)
    }
    return chunkFullResponse
  }

  private async chatInvoke(text: string, id: string, context: string) {
    const chat = this.cohereModelEmbedService.withMemory(id)
    // // esta fallando el historial creo, no lo estoy configurando bien, cada rato holadice
    const responseAI = await chat.invoke(
      {
        context,
        question: text,
      },
      {
        configurable: {
          sessionId: id,
        },
      },
    )
    const isString = typeof responseAI === 'string'
    if (!isString) return
    return responseAI
  }

  private getPineconeStore(
    namespace: string,
    indexName: string,
  ): PineconeStore {
    // index ->  'list-products',
    // namespace -> dev
    const pineconeIndex = this.pineconeService.getPineconeIndexName(
      indexName,
      namespace,
    )

    return this.pineconeService.getPineconeStore(
      this.cohereModelEmbedService.embeddings,
      {
        namespace,
        textKey: 'pageContent',
        pineconeIndex,
        maxConcurrency: 2,
        maxRetries: 2,
        onFailedAttempt: (error) => this.logger.error(error),
      },
    )
  }

  private async insertForBatch(pineconeStore: PineconeStore) {
    const batchSize = 200
    let lastId = 0
    let totalInserted = 0

    while (true) {
      const products = await this.getFindAllProducts(lastId, batchSize)

      if (products.length === 0) break

      const documents = this.formatDocumentsForPinecone(products)

      await pineconeStore.addDocuments(documents)

      lastId = products[products.length - 1].id
      totalInserted += products.length

      this.logger.verbose(`✅ Insertados: ${totalInserted} productos`)
    }

    this.logger.debug('🎉 Inserción por cursor completa.')
  }

  private formatDocumentsForPinecone(
    products: {
      category: {
        name: string
      }
      description: string
      id: number
      imageUrl: string
      name: string
      price: number
    }[],
  ) {
    return products.map(
      ({ category, description, id, imageUrl, name, price }) => ({
        id: id.toString(),
        metadata: {
          name,
          description,
          category,
          price,
          imageUrl,
        },
        pageContent: `${name}. Categoría: ${category.name}. Descripción: ${description}. Precio: $${price}.`,
      }),
    )
  }

  /**
   * getFindAllProducts
   */
  private async getFindAllProducts(lastId: number, limit: number) {
    return await this.prismaService.product.findMany({
      where: {
        id: {
          gt: lastId, // 👉 solo productos más nuevos
        },
      },
      orderBy: {
        id: 'asc', // 👉 para mantener el cursor
      },
      take: limit,
      select: {
        id: true,
        price: true,
        name: true,
        imageUrl: true,
        description: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    })
  }

  /**
   * getIndex
   */
  public getIndex(name: string, namespace: string) {
    return { index: this.pineconeService.getPineconeIndexName(name, namespace) }
  }
}
