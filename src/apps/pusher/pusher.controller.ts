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
      userId: '1',
      name: 'Usuario Ejemplo',
      email: 'usuario@ejemplo.com',
      sessionId: '687b0fd0699333ee27bcef20',
    }
    return this.pusherService.authorizeChannel(body, user.sessionId)
  }

  @Post('send-message')
  sendMessage(@Body() body: SendMessagePusherDto) {
    return this.pusherService.trigger(body)
  }
}
