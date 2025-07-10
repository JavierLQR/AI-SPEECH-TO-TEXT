import { Module } from '@nestjs/common'

import { AppHistoryController } from './app-history.controller'
import { AppHistoryService } from './app-history.service'
import { PineconeModule } from './pinecone/pinecone.module'
import { CohereModelEmbedModule } from './cohere-model-embed/cohere-model-embed.module'

@Module({
  imports: [PineconeModule, CohereModelEmbedModule],
  controllers: [AppHistoryController],
  providers: [AppHistoryService],
})
export class AppHistoryModule {}
