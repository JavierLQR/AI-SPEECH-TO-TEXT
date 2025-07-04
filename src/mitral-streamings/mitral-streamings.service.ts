import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { Runnable } from '@langchain/core/runnables'
import { ChatMistralAI } from '@langchain/mistralai'
import { MistralAIEmbeddings } from '@langchain/mistralai'

// import { PineconeStore } from '@langchain/pinecone'
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone'

@Injectable()
export class MitralStreamingsService {
  private readonly chain: Runnable
  private readonly pinecone: PineconeClient

  /**
   * model
   * @description Model to use for embeddings
   * @Model MistralAI
   */
  private readonly model: ChatMistralAI
  private readonly mistralAIEmbeddings: MistralAIEmbeddings

  constructor(private readonly configService: ConfigService) {
    this.pinecone = new PineconeClient({
      apiKey: this.configService.getOrThrow<string>('PINECONE_API_KEY'),
    })

    this.mistralAIEmbeddings = new MistralAIEmbeddings({
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
      model: this.configService.getOrThrow<string>('MISTRAL_EMBEDDINGS_MODEL'),
    })

    this.model = new ChatMistralAI({
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
      model: this.configService.getOrThrow<string>('MISTRAL_MODEL'),
      temperature: 0.1,
      maxTokens: 300,
    })

    const prompt = ChatPromptTemplate.fromTemplate(
      'Eres un asiste de productos, aqui tienes una lista de productos: {context}\n\nPregunta: {question}\nRespuesta:',
    )
    const parsed = new StringOutputParser()
    this.chain = prompt.pipe(this.model).pipe(parsed)
  }

  /**
   * getIndexs
   */
  public async getIndexs() {
    const index = this.pinecone.index('products-querys').namespace('dev')

    const vectorAnswer = await index.query({
      topK: 2,
      includeMetadata: true,
      vector: await this.mistralAIEmbeddings.embedQuery('Tienes laptops?'),
    })

    const context = vectorAnswer.matches
      .map(
        ({ metadata }) =>
          `Producto: ${String(metadata?.name ?? '')} - Precio: ${String(metadata?.price ?? '')} - Descripción: ${String(metadata?.description ?? '')} - Imagen: ${String(metadata?.imageUrl ?? '')} - ID: ${String(metadata?.id ?? '')} `,
      )
      .join('\n')

    const streams = await this.chain.stream({
      context: context,
      question: 'Tienes laptops?',
    })

    for await (const chunk of streams) {
      console.log(chunk)
    }

    // const vectorStore = await PineconeStore.fromExistingIndex(
    //   this.mistralAIEmbeddings,
    //   {
    //     namespace: 'dev',
    //     pineconeIndex: index,
    //   },
    // )

    return {}
    // const contextDB = await vectorStore.similaritySearch('Tienes laptops?', 2)

    // const streams = await this.chain.stream({
    //   context: contextDB,
    //   question: 'Tienes laptops?',
    // })

    // for await (const chunk of streams) {
    //   console.log(chunk)
    // }
  }

  public async getPrompt(text: string) {
    const stream = await this.chain.stream({
      context: 'Laptops de 16 pulgadas',
      question: text,
    })

    for await (const text of stream) {
      console.log(text)
    }

    // const message: string[] = []

    // const streamWiouthParser = await this.model.stream(text)

    // for await (const chunk of streamWiouthParser) {
    //   console.log(chunk.content)
    // }
    // return {
    //   message,
    // }
  }

  /**
   * getChains
   */
  public async getChains() {
    const prompt = ChatPromptTemplate.fromTemplate(
      'Tell me a joke about {topic}',
    )

    const parser = new StringOutputParser()

    const chain = prompt.pipe(new ChatMistralAI()).pipe(parser)

    const stream = await chain.stream({
      topic: 'parrot',
    })
    // probarlo con un front end de chat

    const message: string[] = []
    for await (const chunk of stream) {
      console.log(`${chunk}|`)
      message.push(chunk)
    }
    return {
      message,
    }
  }
}
