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

  @Get('/pinecone-chat')
  async getUsePinecone(@Query('text') text: string) {
    return this.memoryMongodbService.getUsePinecone(text)
  }

  @Get('/chat-push')
  chatPush() {
    return this.memoryMongodbService.chatPush()
  }
}
