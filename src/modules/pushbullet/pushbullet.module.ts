import { Module } from '@nestjs/common'
import { PushbulletService } from './pushbullet.service'
import { PushbulletController } from './pushbullet.controller'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  controllers: [PushbulletController],
  providers: [PushbulletService],
})
export class PushbulletModule {}
