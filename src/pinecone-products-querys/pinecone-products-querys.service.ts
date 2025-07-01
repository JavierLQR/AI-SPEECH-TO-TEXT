import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { ConfigService } from '@nestjs/config'

import { CohereEmbeddings } from '@langchain/cohere'
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone'
import { PineconeStore } from '@langchain/pinecone'
import { Document } from '@langchain/core/documents'

@Injectable()
export class PineconeProductsQuerysService {
  private readonly embeddings: CohereEmbeddings
  private readonly pinecone: PineconeClient
  private readonly nameIndex: string = 'products-querys'

  private readonly logger: Logger = new Logger(
    PineconeProductsQuerysService.name,
  )

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.embeddings = new CohereEmbeddings({
      apiKey: this.configService.getOrThrow<string>('COHERE_API_KEY'),
      model: this.configService.getOrThrow<string>('COHERE_MODEL_EMBED'),
    })

    this.pinecone = new PineconeClient({
      apiKey: this.configService.getOrThrow<string>('PINECONE_API_KEY'),
    })
  }

  public async createIndex() {
    const index = await this.pinecone.createIndex({
      name: this.nameIndex,
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
        model: 'embed-v4.0',
        name: this.nameIndex,
        owner: 'rodrigo',
      },
    })
    return {
      message: 'Pinecone index created successfully',
      indexName: index,
    }
  }

  /**
   * insertEmbeddings
   */
  public async insertEmbeddings() {
    const productsIndex = await this.findAllProductsIndex()

    const docs: Document[] = productsIndex.map(
      ({ description, id, imageUrl, name, price }) => ({
        pageContent: `${name} - ${description}`,
        metadata: {
          id,
          description,
          imageUrl,
          name,
          price,
        },
      }),
    )

    const vectorStore = await PineconeStore.fromDocuments(
      docs,
      this.embeddings,
      {
        namespace: 'dev',
        pineconeIndex: this.pinecone.index(this.nameIndex),
      },
    )

    return {
      message: 'Productos vectorizados e insertados exitosamente',
      vectorStore,
    }
  }

  /**
   * queryEmbeddings
   */
  public async queryEmbeddings(text: string) {
    const vector = await this.embeddings.embedQuery(text)
    const index = this.pinecone.index(this.nameIndex).namespace('dev')

    const dataVector = await index.query({
      vector,
      topK: 5,
      includeMetadata: true,
    })

    this.logger.debug(dataVector)

    return {
      message: 'Pinecone index queried successfully',
      dataVector: dataVector.matches.map(({ metadata }) => metadata),
    }
  }

  /**
   * findAllProductsIndex
   */
  public async findAllProductsIndex() {
    return await this.prismaService.productIndex.findMany({
      skip: 0,
      take: 100,
      orderBy: { id: 'desc' },
    })
  }
}
