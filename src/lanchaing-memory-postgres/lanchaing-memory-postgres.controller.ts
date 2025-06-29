import { Controller, Get, Query } from '@nestjs/common'
import { LanchaingMemoryPostgresService } from './lanchaing-memory-postgres.service'

@Controller('lanchaing-memory-postgres')
export class LanchaingMemoryPostgresController {
  constructor(
    private readonly lanchaingMemoryPostgresService: LanchaingMemoryPostgresService,
  ) {}

  @Get('chat')
  conversation(@Query('message') message: string) {
    return this.lanchaingMemoryPostgresService.conversation(message)
  }

  @Get('conversations')
  conversation2() {
    return this.lanchaingMemoryPostgresService.findAllConversations()
  }
}
