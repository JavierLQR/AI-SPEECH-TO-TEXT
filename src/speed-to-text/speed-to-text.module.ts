import { Module } from '@nestjs/common'
import { SpeedToTextService } from './speed-to-text.service'
import { SpeedToTextController } from './speed-to-text.controller'

@Module({
  controllers: [SpeedToTextController],
  providers: [SpeedToTextService],
})
export class SpeedToTextModule {}
