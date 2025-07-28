import { Body, Controller, Post } from '@nestjs/common'
import { AuthPusherDto } from './dto/auth-pusher.dto'
import { SendMessagePusherDto } from './dto/send-message-pusher.dto'
import { PusherService } from './pusher.service'

@Controller({
  version: '1',
  path: 'pusher',
})
export class PusherController {
  constructor(private readonly pusherService: PusherService) {}

  @Post('auth')
  authenticateUser(@Body() body: AuthPusherDto) {
    const user = {
      userId: '1000',
      name: 'Usuario Ejemplo',
      email: 'usuario@ejemplo.com',
    }
    return this.pusherService.authorizeChannel(body, user.userId)
  }

  @Post('send-message')
  sendMessage(@Body() body: SendMessagePusherDto) {
    return this.pusherService.trigger(body)
  }
}
