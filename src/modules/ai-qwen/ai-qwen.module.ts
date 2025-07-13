import { Module } from '@nestjs/common'
import { AiQwenService } from './ai-qwen.service'
import { AiQwenController } from './ai-qwen.controller'

@Module({
  controllers: [AiQwenController],
  providers: [AiQwenService],
})
export class AiQwenModule {}
