import { Module } from '@nestjs/common'
import { DeepseekService } from './deepseek.service'
import { DeepseekController } from './deepseek.controller'

@Module({
  controllers: [DeepseekController],
  providers: [DeepseekService],
})
export class DeepseekModule {}
