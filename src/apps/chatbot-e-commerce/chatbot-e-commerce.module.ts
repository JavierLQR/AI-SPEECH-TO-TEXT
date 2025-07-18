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

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ChatHistoryUserEntity.name,
        useFactory: () => ChatHistoryUserSchema,
      },
    ]),
    PineconeModule,
    MongoHistoryChatModule,
  ],
  controllers: [ChatbotECommerceController],
  providers: [ChatbotECommerceService],
})
export class ChatbotECommerceModule {}
