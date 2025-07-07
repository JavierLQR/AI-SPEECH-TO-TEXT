import { ChatPromptTemplate } from '@langchain/core/prompts'
import { Injectable, Logger } from '@nestjs/common'
import { GetModelService } from './model/model.service'

import { PineconeStore } from '@langchain/pinecone'

import {
  Index,
  Pinecone as PineconeClient,
  RecordMetadata,
} from '@pinecone-database/pinecone'
import { ConfigService } from '@nestjs/config'
import { CohereEmbeddings } from '@langchain/cohere'
import { DocumentInterface } from '@langchain/core/documents'

import * as Pusher from 'pusher'

@Injectable()
export class MemoryMongodbService {
  private readonly chain: ReturnType<typeof ChatPromptTemplate.prototype.pipe>

  private readonly chainWithProducts: ReturnType<
    typeof ChatPromptTemplate.prototype.pipe
  >

  private readonly pinecone: PineconeClient
  private readonly cohereEmbeddings: CohereEmbeddings

  private readonly logger: Logger = new Logger(MemoryMongodbService.name)

  private readonly pusher: Pusher

  constructor(
    readonly getModelService: GetModelService,
    private readonly configService: ConfigService,
  ) {
    this.pusher = new Pusher({
      appId: configService.getOrThrow<string>('PUSHER_APP_ID'),
      key: configService.getOrThrow<string>('PUSHER_KEY'),
      secret: configService.getOrThrow<string>('PUSHER_SECRET'),
      cluster: configService.getOrThrow<string>('PUSHER_CLUSTER'),
      useTLS: configService.getOrThrow<boolean>('PUSHER_USE_TLS'),
    })

    // EMBEDDINGS TO USE FOR EMBEDDINGS
    this.cohereEmbeddings = new CohereEmbeddings({
      apiKey: this.configService.getOrThrow<string>('COHERE_API_KEY'),
      model: this.configService.getOrThrow<string>('COHERE_MODEL_EMBED'),
    })

    this.chain = getModelService.getChainModel()

    const prompt = ChatPromptTemplate.fromTemplate(
      `A continuación tiene la lista de los siguientes productos, tu rol es el de asistente de productos. se requiere que el asistente responda correctamente. y explique los productos.
      Productos: {products}
      \n
      \n
      Usuario: {question}`,
    )
    this.chainWithProducts = prompt
      .pipe(this.getModelService.getModel())
      .pipe(this.getModelService.getParsed())

    // PINECONE
    this.pinecone = new PineconeClient({
      apiKey: this.configService.getOrThrow<string>('PINECONE_API_KEY'),
    })
  }

  async chatPush() {
    await this.pusher.trigger('my-channel', 'my-event', {
      message: 'hello',
    })
  }

  /**
   *
   * @param indexName description of the index
   * @param namespace description of the namespace
   * @returns Index
   */
  private getIndex(
    indexName: string,
    namespace: string,
  ): Index<RecordMetadata> {
    return this.pinecone.index(indexName).namespace(namespace)
  }
  /**
   *
   * @param pineconeIndex description of the index
   * @returns PineconeStore
   */
  private async getPineconeStore(
    pineconeIndex: Index<RecordMetadata> | undefined,
  ): Promise<PineconeStore> {
    return await PineconeStore.fromExistingIndex(this.cohereEmbeddings, {
      pineconeIndex,
      namespace: 'dev',
      maxConcurrency: 2,
      textKey: 'pageContent', // importante que coincida con el campo que indexaste
      onFailedAttempt: (error) => this.logger.error(error),
    })
  }

  /**
   * getUsePinecone
   */
  public async getUsePinecone(text: string) {
    const pineconeIndex = this.getIndex('products-querys', 'dev')

    const vectorStorage = await this.getPineconeStore(pineconeIndex)

    const results = await vectorStorage.similaritySearch(text, 5)

    const formatToPrompt = this.formatResultSimilarity(results)
    this.logger.debug({ formatToPrompt })

    const response = await this.chainWithProducts.stream({
      products: formatToPrompt,
      question: text,
    })

    this.logger.debug({
      response,
    })

    for await (const text of response) {
      console.log({ text })
    }

    return {}
  }

  private formatResultSimilarity(
    results: DocumentInterface<Record<string, any>>[],
  ): string[] {
    return results.map(({ metadata }) => {
      const { name, price, description, imageUrl, id } = metadata as Record<
        string,
        string
      >
      return `Producto: ${name}\nDescripción: ${description}\nPrecio: ${price}\nImagen: ${imageUrl}\nID: ${id}`
    })
  }
  /**
   * saveContextMemory
   */
  public async saveContextMemory(
    question: string,
    sessionId: string,
    response: string,
  ) {
    await this.getModelService.saveContextMemory(question, sessionId, response)
  }

  public async chatWithMongoDB(question: string, sessionId: string) {
    const memoryVariables = await this.getModelService.getHistorialMemory(
      question,
      sessionId,
    )

    const streams = await this.chain.stream({
      ...memoryVariables,
      question,
    })

    let fullResponse: string = ''

    for await (const chunk of streams) {
      const isString = typeof chunk === 'string'
      if (!isString) continue

      fullResponse += chunk
      await this.pusher.trigger('my-channel', 'my-event', {
        message: chunk,
      })
    }

    console.log({
      fullResponse,
    })

    await this.saveContextMemory(question, sessionId, fullResponse)
  }
}
