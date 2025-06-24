import { Module } from '@nestjs/common'
import { GroqCloudService } from './groq-cloud.service'
import { GroqCloudController } from './groq-cloud.controller'

@Module({
  controllers: [GroqCloudController],
  providers: [GroqCloudService],
})
export class GroqCloudModule {}
