import { Controller, Get, Query } from '@nestjs/common'
import { EmbeddingsProductsService } from './embeddings-products.service'

@Controller('embeddings-products')
export class EmbeddingsProductsController {
  constructor(
    private readonly embeddingsProductsService: EmbeddingsProductsService,
  ) {}

  @Get('/create-embeddings')
  createEmbeddings() {
    return this.embeddingsProductsService.createEmbeddings()
  }

  @Get('/query-embeddings')
  queryPineconeProducts(@Query('text') text: string) {
    return this.embeddingsProductsService.queryPineconeProducts(text)
  }
}
