import { Module } from '@nestjs/common'
import { MitralStreamingsService } from './mitral-streamings.service'
import { MitralStreamingsController } from './mitral-streamings.controller'

@Module({
  controllers: [MitralStreamingsController],
  providers: [MitralStreamingsService],
})
export class MitralStreamingsModule {}
