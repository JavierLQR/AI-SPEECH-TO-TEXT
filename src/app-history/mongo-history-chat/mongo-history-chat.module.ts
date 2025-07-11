import { Module } from '@nestjs/common'
import { MongoHistoryChatService } from './mongo-history-chat.service'

@Module({
  imports: [],
  controllers: [],
  providers: [MongoHistoryChatService],
  exports: [MongoHistoryChatService],
})
export class MongoHistoryChatModule {}
