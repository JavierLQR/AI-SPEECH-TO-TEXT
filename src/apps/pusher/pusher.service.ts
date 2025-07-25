import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Pusher from 'pusher'
import { AuthPusherDto } from './dto/auth-pusher.dto'
import { ApiResponse } from 'src/common/helpers/api.response'
import { SendMessagePusherDto } from './dto/send-message-pusher.dto'

@Injectable()
export class PusherService {
  private readonly pusher: Pusher
  private readonly logger: Logger = new Logger(PusherService.name)

  constructor(private readonly configService: ConfigService) {
    this.logger.log('Initializing Pusher service with configuration')
    this.pusher = new Pusher({
      appId: this.configService.getOrThrow<string>('PUSHER_APP_ID'),
      key: this.configService.getOrThrow<string>('PUSHER_KEY'),
      secret: this.configService.getOrThrow<string>('PUSHER_SECRET'),
      cluster: this.configService.getOrThrow<string>('PUSHER_CLUSTER'),
      useTLS: this.configService.getOrThrow<boolean>('PUSHER_USE_TLS'),
    })
  }

  private typeChannel(channel: string): 'presence' | 'private' | 'public' {
    const recordChannel: Record<string, 'presence' | 'private' | 'public'> = {
      'presence-': 'presence',
      'private-': 'private',
      'public-': 'public',
    }
    return recordChannel[channel.split('-')[0] + '-'] || 'public'
  }

  public async trigger(channelPusherDto: SendMessagePusherDto) {
    const { channelName, data, eventName, socket_id } = channelPusherDto
    const channel = await this.pusher.trigger(channelName, eventName, data, {
      socket_id,
    })

    return ApiResponse({
      message: 'Channel triggered successfully',
      data: channel,
      statusCode: HttpStatus.OK,
      service: 'PusherService',
    })
  }
  /**
   * async channelPublic
   */
  public async channelPublic() {}

  /**
   * autentication
   */
  public authorizeChannel(authPusherDto: AuthPusherDto) {
    const { socket_id, channel_name } = authPusherDto
    this.logger.log(`Authenticating user for channel: ${channel_name}`)
    const { auth } = this.pusher.authorizeChannel(socket_id, channel_name)
    console.log({
      socket_id,
      channel_name,
    })

    return {
      auth,
      statusCode: HttpStatus.CREATED,
      message: 'User authenticated successfully',
    }
  }
}
