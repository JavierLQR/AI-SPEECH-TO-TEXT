import { Injectable, Logger } from '@nestjs/common'
import { MistralAI } from '@langchain/mistralai'
import { ConfigService } from '@nestjs/config'
import { MistralAIEmbeddings } from '@langchain/mistralai'
import { PrismaService } from 'nestjs-prisma'
import { Pinecone } from '@pinecone-database/pinecone'
import { PineconeStore } from '@langchain/pinecone'
import { Document } from '@langchain/core/documents'
import { BaseMessageLike } from '@langchain/core/messages'

@Injectable()
export class EmbeddingsProductsService {
  private readonly model: MistralAI
  private readonly embeddings: MistralAIEmbeddings
  private readonly pinecone: Pinecone
  private readonly logger = new Logger(EmbeddingsProductsService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    /**
     * embeddings
     * @description embeddings to use for embeddings
     */
    this.embeddings = new MistralAIEmbeddings({
      model: this.configService.getOrThrow<string>('MISTRAL_EMBEDDINGS_MODEL'),
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
    })

    /**
     * pinecone
     * @description Pinecone client to use for embeddings
     */
    this.pinecone = new Pinecone({
      apiKey: this.configService.getOrThrow<string>('PINECONE_API_KEY'),
    })

    /**
     * model
     * @description Model to use for embeddings
     */
    this.model = new MistralAI({
      model: this.configService.getOrThrow<string>(
        'MISTRAL_MODEL_LANCHAING_CHAT',
      ),
      temperature: 0.4,
      maxTokens: 800,
      topP: 1,
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
      metadata: {
        model: this.configService.getOrThrow<string>(
          'MISTRAL_MODEL_LANCHAING_CHAT',
        ),
      },
    })
  }
  /**
   * findAllProducts
   */
  public async findAllProducts() {
    return await this.prismaService.productosEmbeddings.findMany()
  }

  /**
   * queryPineconeProducts
   * @description Query Pinecone for products
   * @param text
   *
   */
  public async queryPineconeProducts(text: string) {
    // 1. Obtener el vector de la consulta
    const queryVector = await this.embeddings.embedQuery(text)

    // 2. Hacer la consulta a Pinecone
    const index = this.pinecone
      .index('standard-dense-js')
      .namespace('ns-products')

    const response = await index.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
      filter: {},
    })

    // 3. Construir el contexto desde los productos
    const context = response.matches
      .map(({ metadata }) =>
        metadata
          ? `Producto: ${String(metadata.name ?? '')} - Precio: ${String(metadata.price ?? '')}`
          : 'Producto:  - Precio: ',
      )
      .join('\n')

    console.log({
      context,
    })

    // 4. Crear prompt
    const systemPrompt = `Eres un asistente experto en productos. A continuación, tienes una lista de productos relevantes:\n\n${context}\n\nEn base a estos productos, responde a la consulta del usuario recomendando los más apropiados y justificando tu respuesta. Usa un tono claro, educativo y fácil de entender.`

    const messages: BaseMessageLike[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ]

    // 5. Obtener respuesta del modelo
    const result = await this.model.invoke(messages)

    // 6. Devolver respuesta
    return {
      message: 'Respuesta generada exitosamente',
      answer: result,
    }
  }

  public async createEmbeddings() {
    const products = await this.findAllProducts()
    this.logger.log('Iniciando vectorización de productos...')

    const docs: Document[] = products.map(
      ({ category, id, price, product, size }) => ({
        pageContent: `${product}. ${category}`,
        metadata: {
          id,
          product,
          price,
          size,
        },
      }),
    )
    const vectorStore = await PineconeStore.fromDocuments(
      docs,
      this.embeddings,
      {
        pineconeIndex: this.pinecone.index('standard-dense-js'),
        namespace: 'ns-products',
      },
    )
    this.logger.debug({
      message: 'Productos vectorizados e insertados exitosamente',
      vectorStore,
    })
    return {
      message: 'Productos vectorizados e insertados exitosamente',
      count: docs.length,
    }
  }
}
