import { Module } from '@nestjs/common'
import { PineconeService } from './pinecone.service'

@Module({
  imports: [],
  controllers: [],
  providers: [PineconeService],
  exports: [PineconeService],
})
export class PineconeModule {}
