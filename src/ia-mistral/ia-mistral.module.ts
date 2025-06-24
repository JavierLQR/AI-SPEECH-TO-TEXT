import { Module } from '@nestjs/common'
import { IaMistralService } from './ia-mistral.service'
import { IaMistralController } from './ia-mistral.controller'

@Module({
  controllers: [IaMistralController],
  providers: [IaMistralService],
})
export class IaMistralModule {}
