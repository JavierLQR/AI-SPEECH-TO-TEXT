import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import {
  CreateIndexOptions,
  Pinecone as PineconeClient,
} from '@pinecone-database/pinecone'
import { PineconeStore, PineconeStoreParams } from '@langchain/pinecone'
import { EmbeddingsInterface } from '@langchain/core/embeddings'

@Injectable()
export class PineconeService {
  private readonly pinecone: PineconeClient

  constructor(private readonly configService: ConfigService) {
    this.pinecone = new PineconeClient({
      apiKey: this.configService.getOrThrow<string>('PINECONE_API_KEY'),
      maxRetries: 2,
      sourceTag: 'langchain',
    })
  }

  /**
   * getPineconeIndexName
   */
  public getPineconeIndexName(indexName: string, namespace: string) {
    return this.pinecone.index(indexName).namespace(namespace)
  }

  /**
   * createIndexPinecone
   */
  public async createIndexPinecone(createIndexOptions: CreateIndexOptions) {
    return await this.pinecone.createIndex(createIndexOptions)
  }

  /**
   * getPineconeStore
   */
  public getPineconeStore(
    embeddings: EmbeddingsInterface,
    params: PineconeStoreParams,
  ): PineconeStore {
    return new PineconeStore(embeddings, params)
  }
}
