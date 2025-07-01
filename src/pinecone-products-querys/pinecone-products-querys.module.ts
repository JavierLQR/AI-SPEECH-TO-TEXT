import { Module } from '@nestjs/common'
import { PineconeProductsQuerysService } from './pinecone-products-querys.service'
import { PineconeProductsQuerysController } from './pinecone-products-querys.controller'

@Module({
  controllers: [PineconeProductsQuerysController],
  providers: [PineconeProductsQuerysService],
})
export class PineconeProductsQuerysModule {}
