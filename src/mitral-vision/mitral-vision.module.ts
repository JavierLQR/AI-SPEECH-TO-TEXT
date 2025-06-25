import { Module } from '@nestjs/common'
import { MitralVisionService } from './mitral-vision.service'
import { MitralVisionController } from './mitral-vision.controller'

@Module({
  controllers: [MitralVisionController],
  providers: [MitralVisionService],
})
export class MitralVisionModule {}
