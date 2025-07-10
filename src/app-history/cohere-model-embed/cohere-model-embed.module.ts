import { Module } from '@nestjs/common'
import { CohereModelEmbedService } from './cohere-model-embed.service'

@Module({
  imports: [],
  controllers: [],
  providers: [CohereModelEmbedService],
  exports: [CohereModelEmbedService],
})
export class CohereModelEmbedModule {}
