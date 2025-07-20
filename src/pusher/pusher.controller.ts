import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common'
import { PusherService } from './pusher.service'

@Controller('pusher')
export class PusherController {
  constructor(private readonly pusherService: PusherService) {}

  @Post('auth')
  authenticate(
    @Body('socket_id') socketId: string,
    @Body('channel_name') channelName: string,
    @Body('user_id') userId: string,
  ) {
    console.log({
      authenticate: 'auth',
      socketId,
      channelName,
      userId,
    })

    if (!userId) throw new UnauthorizedException('User ID is required')

    return this.pusherService.authenticate(userId, socketId, channelName)
  }

  @Post('send-message')
  async sendMessage<T>(
    @Body() body: { channel: string; event: string; data: T },
  ) {
    const { channel, event, data } = body
    console.log({
      sendMessage: 'send-message',
      channel,
      event,
      data,
    })

    await this.pusherService.trigger(channel, event, data)
    return {
      status: 'success',
      message: `Event ${event} triggered on channel ${channel}`,
      data: data,
    }
  }
}
