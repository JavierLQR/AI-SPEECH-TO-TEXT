import { MongoDBChatMessageHistory } from '@langchain/mongodb'
import { Injectable } from '@nestjs/common'

import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Collection } from 'mongodb'
import { MongoHistoryChatService } from '../app-history/mongo-history-chat/mongo-history-chat.service'
import { ChatHistoryUserEntity } from './entities/user-entity'

@Injectable()
export class ChatBotService {
  constructor(
    private readonly mongoHistoryChatService: MongoHistoryChatService,
    @InjectModel(ChatHistoryUserEntity.name)
    private readonly chatHistoryUserEntity: Model<ChatHistoryUserEntity>,
  ) {}

  private get getColletion(): Collection {
    return this.mongoHistoryChatService.Colletion
  }

  /**
   * getMessages
   */
  public async getMessages() {
    const collection = new MongoDBChatMessageHistory({
      collection: this.getColletion,
      sessionId: 'chatbot',
    })
    const messages = await collection.getMessages()
    return {
      messages,
      sessionId: '123456',
    }
  }
}
