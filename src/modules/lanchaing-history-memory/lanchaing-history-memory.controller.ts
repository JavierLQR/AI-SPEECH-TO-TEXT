import { Controller, Get, Query } from '@nestjs/common'
import { LanchaingHistoryMemoryService } from './lanchaing-history-memory.service'

@Controller('lanchaing-history-memory')
export class LanchaingHistoryMemoryController {
  constructor(
    private readonly lanchaingHistoryMemoryService: LanchaingHistoryMemoryService,
  ) {}

  @Get('chat')
  conversation(@Query('message') message: string) {
    return this.lanchaingHistoryMemoryService.conversation(message)
  }
}
