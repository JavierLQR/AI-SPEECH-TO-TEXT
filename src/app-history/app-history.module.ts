import { Module } from '@nestjs/common'

import { AppHistoryController } from './app-history.controller'
import { AppHistoryService } from './app-history.service'
import { PineconeModule } from './pinecone/pinecone.module'
import { CohereModelEmbedModule } from './cohere-model-embed/cohere-model-embed.module'
import { MongoHistoryChatModule } from './mongo-history-chat/mongo-history-chat.module'

@Module({
  imports: [PineconeModule, CohereModelEmbedModule, MongoHistoryChatModule],
  controllers: [AppHistoryController],
  providers: [AppHistoryService],
})
export class AppHistoryModule {}
