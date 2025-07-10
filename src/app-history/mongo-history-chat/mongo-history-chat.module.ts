import { Module } from '@nestjs/common'
import { MongoHistoryChatService } from './mongo-history-chat.service'
import { CohereModelEmbedModule } from '../cohere-model-embed/cohere-model-embed.module'

@Module({
  imports: [CohereModelEmbedModule],
  controllers: [],
  providers: [MongoHistoryChatService],
  exports: [MongoHistoryChatService],
})
export class MongoHistoryChatModule {}
