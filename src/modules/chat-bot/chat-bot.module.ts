import { Module } from '@nestjs/common'
import { ChatBotService } from './chat-bot.service'
import { ChatBotController } from './chat-bot.controller'
import { MongooseModule } from '@nestjs/mongoose'

import {
  ChatHistoryUserEntity,
  ChatHistoryUserSchema,
} from './entities/user-entity'
import { MongoHistoryChatModule } from '../app-history/mongo-history-chat/mongo-history-chat.module'
import { PineconeModule } from '../app-history/pinecone/pinecone.module'
import { CohereModelEmbedModule } from '../app-history/cohere-model-embed/cohere-model-embed.module'

@Module({
  imports: [
    PineconeModule,
    MongoHistoryChatModule,
    CohereModelEmbedModule,
    MongooseModule.forFeatureAsync([
      {
        name: ChatHistoryUserEntity.name,
        useFactory: () => ChatHistoryUserSchema,
      },
    ]),
  ],
  controllers: [ChatBotController],
  providers: [ChatBotService],
})
export class ChatBotModule {}
