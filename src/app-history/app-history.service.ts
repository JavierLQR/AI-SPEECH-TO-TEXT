import { Injectable, Logger } from '@nestjs/common'
import { PineconeService } from './pinecone/pinecone.service'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from 'nestjs-prisma'

import { CohereModelEmbedService } from './cohere-model-embed/cohere-model-embed.service'
import { PineconeStore } from '@langchain/pinecone'

@Injectable()
export class AppHistoryService {
  private readonly logger: Logger = new Logger(AppHistoryService.name)

  constructor(
    private readonly configService: ConfigService,

    private readonly pineconeService: PineconeService,
    private readonly cohereModelEmbedService: CohereModelEmbedService,

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
    // este metodo hacerlo modular
    const index = this.pineconeService.getPineconeStore(
      this.cohereModelEmbedService.embeddings,
      {
        namespace: 'dev',
        textKey: 'pageContent',
        pineconeIndex: this.pineconeService.getPineconeIndexName(
          'list-products',
          'dev',
        ),
        maxConcurrency: 2,
        maxRetries: 2,
        onFailedAttempt: (error) => this.logger.error(error),
      },
    )

    const result = await index.similaritySearch(text, 3)
    const context = result.map(({ pageContent }) => pageContent).join('\n\n')

    const responseAI = await this.cohereModelEmbedService.productChain.invoke({
      context,
      question: text,
    })

    return {
      responseAI,
    }
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
