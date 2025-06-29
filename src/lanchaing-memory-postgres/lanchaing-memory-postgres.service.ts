import { PostgresChatMessageHistory } from '@langchain/community/stores/message/postgres'
import { StringOutputParser } from '@langchain/core/output_parsers'
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'
import { RunnableWithMessageHistory } from '@langchain/core/runnables'
import { ChatMistralAI } from '@langchain/mistralai'
import { Injectable } from '@nestjs/common'
import * as pg from 'pg'

@Injectable()
export class LanchaingMemoryPostgresService {
  private readonly pool: pg.Pool
  private readonly chainWithMemory: RunnableWithMessageHistory<any, any>
  constructor() {
    // Inicializa conexión a PostgreSQL desde .env
    this.pool = new pg.Pool({
      host: process.env.HOST,
      port: Number(process.env.PORT_POSTGRES),
      user: process.env.USER_POSTGRES,
      password: process.env.PASSWORD_POSTGRES,
      database: process.env.DATABASE_POSTGRES,
      ssl: { rejectUnauthorized: false },
    })

    const model = new ChatMistralAI({
      model: 'codestral-latest',
      temperature: 0,
      apiKey: process.env.MISTRAL_API_KEY,
      maxTokens: 100,
    })

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'Eres un asistente inteligente que recuerda a los usuarios por su nombre y contexto anterior.',
      ],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
    ])

    const chain = prompt.pipe(model).pipe(new StringOutputParser())

    // Crea la cadena con historial de memoria desde Postgres
    this.chainWithMemory = new RunnableWithMessageHistory({
      runnable: chain,
      inputMessagesKey: 'input',
      historyMessagesKey: 'chat_history',
      getMessageHistory: (sessionId: string) => {
        return new PostgresChatMessageHistory({
          sessionId,
          pool: this.pool,
        })
      },
    })
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
