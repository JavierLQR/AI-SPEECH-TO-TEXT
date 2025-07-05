import { Controller, Get, Query } from '@nestjs/common'
import { MemoryMongodbService } from './memory-mongodb.service'

@Controller('memory-mongodb')
export class MemoryMongodbController {
  constructor(private readonly memoryMongodbService: MemoryMongodbService) {}

  @Get('/chat')
  async chatWithMongoDB(
    @Query('question')
    question: string,
    @Query('sessionId')
    sessionId: string,
  ) {
    return this.memoryMongodbService.chatWithMongoDB(question, sessionId)
  }
}
