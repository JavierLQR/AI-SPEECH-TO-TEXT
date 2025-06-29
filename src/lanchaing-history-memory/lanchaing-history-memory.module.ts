import { Module } from '@nestjs/common'
import { LanchaingHistoryMemoryService } from './lanchaing-history-memory.service'
import { LanchaingHistoryMemoryController } from './lanchaing-history-memory.controller'

@Module({
  controllers: [LanchaingHistoryMemoryController],
  providers: [LanchaingHistoryMemoryService],
})
export class LanchaingHistoryMemoryModule {}
