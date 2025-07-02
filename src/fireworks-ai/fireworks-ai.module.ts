import { Module } from '@nestjs/common'
import { FireworksAiService } from './fireworks-ai.service'
import { FireworksAiController } from './fireworks-ai.controller'

@Module({
  controllers: [FireworksAiController],
  providers: [FireworksAiService],
})
export class FireworksAiModule {}
