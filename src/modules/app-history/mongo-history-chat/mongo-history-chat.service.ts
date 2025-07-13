import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { Collection, MongoClient } from 'mongodb'

@Injectable()
export class MongoHistoryChatService {
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

  public get Colletion(): Collection {
    return this.collection
  }

  /**
   * getMemory
   */
  // public getMemory(question: string, sessionId: string) {
  //   const finalSessionId = sessionId || new ObjectId().toString()

  //   const memory = new BufferMemory({
  //     chatHistory: new MongoDBChatMessageHistory({
  //       collection: this.collection,
  //       sessionId: finalSessionId,
  //     }),
  //     memoryKey: 'chat_history',
  //     inputKey: 'question',
  //     outputKey: 'response',
  //     returnMessages: true,
  //     aiPrefix: 'Assistant:',
  //     humanPrefix: 'User: ',
  //   })

  //   return this.cohereService.productChain.invoke({ question })
  // }
}
