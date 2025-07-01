import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

import { CohereEmbeddings } from '@langchain/cohere'
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone'

import { ConfigService } from '@nestjs/config'

@Injectable()
export class PineconeProductsQuerysService {
  private readonly embeddings: CohereEmbeddings
  private readonly pinecone: PineconeClient

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.embeddings = new CohereEmbeddings({
      apiKey: this.configService.getOrThrow<string>('COHERE_API_KEY'),
      model: 'embed-v4.0',
    })

    this.pinecone = new PineconeClient({
      apiKey: this.configService.getOrThrow<string>('PINECONE_API_KEY'),
    })
  }

  public async createIndex() {
    const index = await this.pinecone.createIndex({
      name: 'products-querys',
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
        name: 'products-querys',
        owner: 'rodrigo',
      },
    })
    return {
      message: 'Pinecone index created successfully',
      indexName: index,
    }
  }
}
