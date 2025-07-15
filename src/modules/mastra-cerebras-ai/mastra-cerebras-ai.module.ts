import { Module } from '@nestjs/common'
import { MastraCerebrasAiService } from './mastra-cerebras-ai.service'
import { MastraCerebrasAiController } from './mastra-cerebras-ai.controller'

@Module({
  controllers: [MastraCerebrasAiController],
  providers: [MastraCerebrasAiService],
})
export class MastraCerebrasAiModule {}
