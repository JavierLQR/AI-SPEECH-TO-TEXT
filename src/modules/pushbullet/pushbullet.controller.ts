import { Controller, Post } from '@nestjs/common'
import { PushbulletService } from './pushbullet.service'

@Controller('pushbullet')
export class PushbulletController {
  constructor(private readonly pushbulletService: PushbulletService) {}

  @Post('send-sms')
  sendSms() {
    return this.pushbulletService.sendTextMessage()
  }
}
