import { Controller, Get } from '@nestjs/common'
import { PineconeService } from './pinecone.service'

@Controller('pinecone')
export class PineconeController {
  constructor(private readonly pineconeService: PineconeService) {}

  @Get('index')
  getIndex() {
    return this.pineconeService.createIndex()
  }

  @Get('upsert-index')
  upsertIndex() {
    return this.pineconeService.upsertIndex()
  }

  @Get('query-index')
  queryIndex() {
    return this.pineconeService.queryIndex('Black holes')
  }

  @Get('question-AI')
  questionAI() {
    return this.pineconeService.questionAI()
  }
}
