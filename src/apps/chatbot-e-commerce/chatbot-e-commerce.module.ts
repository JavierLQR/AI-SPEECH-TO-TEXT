import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ChatbotECommerceService } from './chatbot-e-commerce.service'
import { ChatbotECommerceController } from './chatbot-e-commerce.controller'
import { PineconeModule } from 'src/modules/app-history/pinecone/pinecone.module'
import { MongoHistoryChatModule } from 'src/modules/app-history/mongo-history-chat/mongo-history-chat.module'
import {
  ChatHistoryUserEntity,
  ChatHistoryUserSchema,
} from 'src/modules/chat-bot/entities/user-entity'
import { FilterFindHistoryService } from './filters/filters'
import { ChatMessageSchema } from './entitie/chatbot-e-commerce.entity'
import { ChatMessage } from '@langchain/core/messages'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ChatHistoryUserEntity.name,
        useFactory: () => ChatHistoryUserSchema,
      },
      {
        name: ChatMessage.name,
        useFactory: () => ChatMessageSchema,
      },
    ]),
    PineconeModule,
    MongoHistoryChatModule,
  ],
  controllers: [ChatbotECommerceController],
  providers: [ChatbotECommerceService, FilterFindHistoryService],
})
export class ChatbotECommerceModule {}
