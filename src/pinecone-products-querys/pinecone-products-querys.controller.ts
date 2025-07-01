import { Controller, Get } from '@nestjs/common'

import { PineconeProductsQuerysService } from './pinecone-products-querys.service'

@Controller('pinecone-products-querys')
export class PineconeProductsQuerysController {
  constructor(
    private readonly pineconeProductsQuerysService: PineconeProductsQuerysService,
  ) {}

  @Get('create-index')
  createIndex() {
    return this.pineconeProductsQuerysService.createIndex()
  }
}
