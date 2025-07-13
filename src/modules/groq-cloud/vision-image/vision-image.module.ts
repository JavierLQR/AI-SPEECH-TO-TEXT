import { Module } from '@nestjs/common'
import { VisionImageService } from './vision-image.service'
import { VisionImageController } from './vision-image.controller'

@Module({
  controllers: [VisionImageController],
  providers: [VisionImageService],
})
export class VisionImageModule {}
