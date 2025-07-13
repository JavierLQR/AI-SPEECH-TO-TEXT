import { MongoDBChatMessageHistory } from '@langchain/mongodb'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { Collection, MongoClient } from 'mongodb'
@Injectable()
export class ChatBotService {
  private readonly client: MongoClient
  private readonly collection: Collection

  constructor(private readonly configService: ConfigService) {
    this.client = new MongoClient(
      this.configService.getOrThrow<string>('DATABASE_MONGO_URI'),
      {
        driverInfo: {
          name: 'Langchaing',
        },
        ssl: true,
      },
    )
    this.collection = this.client.db('langchaing').collection('memory')
  }

  /**
   * getMessages
   */
  public async getMessages() {
    const history = new MongoDBChatMessageHistory({
      collection: this.collection,
      sessionId: '123456',
    })
    const messages = await history.getMessages()
    console.log({
      messages,
    })

    const format = messages.map((message) => ({
      role: message.getType(),
      content: message.text,
    }))
    return {
      format,
    }
  }
}
