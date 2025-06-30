import { PostgresChatMessageHistory } from '@langchain/community/stores/message/postgres'
// import { BaseMessageLike } from '@langchain/core/messages'
import { StringOutputParser } from '@langchain/core/output_parsers'
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'
import { RunnableWithMessageHistory } from '@langchain/core/runnables'
import { ChatMistralAI, MistralAIEmbeddings } from '@langchain/mistralai'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Pinecone } from '@pinecone-database/pinecone'
import Redis from 'ioredis'
import { PrismaService } from 'nestjs-prisma'
import * as pg from 'pg'

@Injectable()
export class LanchaingMemoryPostgresService {
  /**
   * Instancia de la clase MistralAIEmbeddings
   */
  private readonly mistralEmbeddings: MistralAIEmbeddings

  private readonly model: ChatMistralAI

  private readonly pinecone: Pinecone

  private readonly pool: pg.Pool

  private readonly chainWithMemory: RunnableWithMessageHistory<any, any>

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    this.model = new ChatMistralAI({
      model: 'codestral-latest',
      temperature: 0.2,
      apiKey: process.env.MISTRAL_API_KEY,
      maxTokens: 100,
    })
    /***
     * mistralEmbeddings
     */
    this.mistralEmbeddings = new MistralAIEmbeddings({
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
      model: this.configService.getOrThrow<string>('MISTRAL_EMBEDDINGS_MODEL'),
    })

    /***
     * pinecone
     */
    this.pinecone = new Pinecone({
      apiKey: this.configService.getOrThrow<string>('PINECONE_API_KEY'),
    })

    // Inicializa conexión a PostgreSQL desde .env
    this.pool = new pg.Pool({
      host: process.env.HOST,
      port: Number(process.env.PORT_POSTGRES),
      user: process.env.USER_POSTGRES,
      password: process.env.PASSWORD_POSTGRES,
      database: process.env.DATABASE_POSTGRES,
      ssl: { rejectUnauthorized: false },
    })

    /***
     * chainWithMemory
     * */

    // const model = new ChatMistralAI({
    //   model: 'codestral-latest',
    //   temperature: 0,
    //   apiKey: process.env.MISTRAL_API_KEY,
    //   maxTokens: 100,
    // })

    // const prompt = ChatPromptTemplate.fromMessages([
    //   ['system', 'You are a helpful assistant.'],
    //   new MessagesPlaceholder('chat_history'),
    //   ['human', '{input}'],
    // ])

    // const chain = prompt.pipe(model).pipe(new StringOutputParser())

    // // Crea la cadena con historial de memoria desde Postgres
    // this.chainWithMemory = new RunnableWithMessageHistory({
    //   runnable: chain,
    //   inputMessagesKey: 'input',
    //   historyMessagesKey: 'chat_history',
    //   getMessageHistory: (sessionId: string) => {
    //     console.log({
    //       sessionId,
    //     })

    //     return new PostgresChatMessageHistory({
    //       sessionId,
    //       pool: this.pool,
    //     })
    //   },
    // })
  }

  /**
   * getEmbbedings
   */
  public async getEmbbedings(text: string) {
    const index = this.pinecone
      .index('standard-dense-js')
      .namespace('ns-products')

    // solo es cambiar el vector soy burro xdxd
    const vector = await this.mistralEmbeddings.embedQuery('calzados')

    const response = await index.query({
      vector,
      topK: 5,
      includeMetadata: true,
    })
    Logger.debug({
      response: response.matches,
    })
    const context = response.matches
      .map(({ metadata }) =>
        metadata
          ? `Producto: ${String(metadata.name ?? '')} - Precio: ${String(metadata.price ?? '')} `
          : 'Producto:  - Precio: ',
      )
      .join('\n')

    const systemPrompt = `
    Eres un asistente de ventas de una tiendas. A continuación verás una lista de productos:
    ${context} 
    Usa el contexto para responder con base a lo que se te pide y explica de forma clara y concisa.
    `

    // 🔧 Construcción dinámica del chain
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt.trim()],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
    ])

    const chain = prompt.pipe(this.model).pipe(new StringOutputParser())

    const chainWithMemory = new RunnableWithMessageHistory({
      runnable: chain,
      inputMessagesKey: 'input',
      historyMessagesKey: 'chat_history',
      getMessageHistory: (sessionId: string) => {
        console.log({
          sessionId,
        })

        return new PostgresChatMessageHistory({
          sessionId,
          pool: this.pool,
        })
      },
      outputMessagesKey: 'output',
    })

    const result = await chainWithMemory.invoke(
      {
        input: text,
      },
      {
        configurable: { sessionId: 'usuario-demo' },
      },
    )

    return { result }
  }

  async findAllConversations() {
    const cacheConversations = await this.redis.get('conversations')

    if (cacheConversations)
      return { conversationsCache: JSON.parse(cacheConversations) }

    const conversations =
      await this.prismaService.langchain_chat_histories.findMany({
        orderBy: {
          id: 'desc',
        },
        select: {
          id: true,
          session_id: true,
          message: true,
        },
      })
    await this.redis.set(
      'conversations',
      JSON.stringify(conversations),
      'EX',
      3600,
    )

    return { conversations }
  }

  async conversation(message: string) {
    const sessionId = 'usuario-demo'

    const result: string = (await this.chainWithMemory.invoke(
      {
        input: message,
      },
      {
        configurable: {
          sessionId,
        },
      },
    )) as string

    return {
      answer: result,
    }
  }
}
