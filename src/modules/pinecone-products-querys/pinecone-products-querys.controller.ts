import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common'

import { PineconeProductsQuerysService } from './pinecone-products-querys.service'

@Controller('pinecone-products-querys')
export class PineconeProductsQuerysController {
  constructor(
    private readonly pineconeProductsQuerysService: PineconeProductsQuerysService,
  ) {}

  @Get('create-index')
  @HttpCode(HttpStatus.CREATED)
  createIndex() {
    return this.pineconeProductsQuerysService.createIndex()
  }

  @Get('products-index')
  @HttpCode(HttpStatus.OK)
  findAllProductsIndex() {
    return this.pineconeProductsQuerysService.findAllProductsIndex()
  }

  @HttpCode(HttpStatus.CREATED)
  @Get('insert-products-index')
  insertEmbeddings() {
    return this.pineconeProductsQuerysService.insertEmbeddings()
  }

  @HttpCode(HttpStatus.OK)
  @Get('query-products-index')
  queryEmbeddings(@Query('text') text: string) {
    return this.pineconeProductsQuerysService.queryEmbeddings(text)
  }
}
