import { Module } from '@nestjs/common'
import { MitralStreamingsController } from './mitral-streamings.controller'
import { MitralStreamingsService } from './mitral-streamings.service'
@Module({
  imports: [],
  controllers: [MitralStreamingsController],
  providers: [MitralStreamingsService],
})
export class MitralStreamingsModule {}
