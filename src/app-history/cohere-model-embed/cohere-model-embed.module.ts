import { Module } from '@nestjs/common'
import { CohereModelEmbedService } from './cohere-model-embed.service'
import { MongoHistoryChatModule } from '../mongo-history-chat/mongo-history-chat.module'

@Module({
  imports: [MongoHistoryChatModule],
  controllers: [],
  providers: [CohereModelEmbedService],
  exports: [CohereModelEmbedService],
})
export class CohereModelEmbedModule {}
