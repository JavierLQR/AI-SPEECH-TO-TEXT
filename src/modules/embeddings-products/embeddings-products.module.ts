import { Module } from '@nestjs/common'
import { EmbeddingsProductsService } from './embeddings-products.service'
import { EmbeddingsProductsController } from './embeddings-products.controller'

@Module({
  controllers: [EmbeddingsProductsController],
  providers: [EmbeddingsProductsService],
  imports: [],
})
export class EmbeddingsProductsModule {}
