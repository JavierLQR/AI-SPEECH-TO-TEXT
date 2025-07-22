// pusher/pusher.controller.ts
import { Body, Controller, Post } from '@nestjs/common'
import { PusherService } from './pusher.service'

@Controller('pusher')
export class PusherController {
  constructor(private pusherService: PusherService) {}

  @Post('auth')
  authenticateUser(@Body() body: { socket_id: string; channel_name: string }) {
    const { socket_id, channel_name } = body

    const userData = {
      userId: '123',
      name: 'Usuario Ejemplo',
      email: 'usuario@ejemplo.com',
    }

    try {
      if (channel_name.startsWith('presence-')) {
        return this.pusherService.authenticateUser(
          socket_id,
          channel_name,
          userData,
        )
      } else if (channel_name.startsWith('private-')) {
        return this.pusherService.authorizeChannel(
          socket_id,
          channel_name,
          userData.userId,
        )
      }
    } catch (error) {
      console.error('Error authenticating user:', error)
      return { error: 'Unauthorized' }
    }
  }

  @Post('send-message')
  async sendMessage(
    @Body()
    body: {
      channel: string
      event: string
      data: { message: string; userId: string }
      userId: string
    },
  ) {
    const { channel, event, data, userId } = body
    console.log({
      userId,
      isChanel: channel.includes(`user-${userId}`),
    })

    if (channel.includes(`user-${userId}`)) {
      await this.pusherService.sendToPrivateChannel(channel, event, data)
      return { success: true }
    }

    return { error: 'Unauthorized' }
  }
}
