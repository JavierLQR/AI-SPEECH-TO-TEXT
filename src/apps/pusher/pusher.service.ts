import {
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Pusher from 'pusher'
import { AuthPusherDto } from './dto/auth-pusher.dto'
import { SendMessagePusherDto } from './dto/send-message-pusher.dto'
import { ApiResponse } from '../../common/helpers/api.response'

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

  public async trigger(channelPusherDto: SendMessagePusherDto) {
    const { channelName, data, eventName, socket_id } = channelPusherDto
    this.logger.debug({ channelName, data, eventName, socket_id })
    const channel = await this.pusher.trigger(channelName, eventName, data)

    return ApiResponse({
      message: 'Channel triggered successfully',
      data: channel,
      statusCode: HttpStatus.OK,
      service: 'PusherService',
    })
  }

  /**
   * async validateUserIdForChannel
   * @param channel
   * @param userId
   * @return boolean
   * @description Validates if the userId is allowed to access the channel
   * @throws Error if the userId is not allowed
   */
  private validateUserIdForChannel(channel: string, userId: string) {
    const isValid = channel.includes(`user-${userId}`)
    console.log({
      isValid,
      channel,
      userId,
    })

    if (!isValid)
      throw new UnauthorizedException(
        `${userId} is not allowed to access this channel`,
      )

    return isValid
  }

  private typeChannel(channel: string): 'presence' | 'private' | 'public' {
    const recordChannel: Record<string, 'presence' | 'private' | 'public'> = {
      'presence-': 'presence',
      'private-': 'private',
      'public-': 'public',
    }
    return recordChannel[channel.split('-')[0] + '-'] || 'public'
  }

  /**
   * autentication
   */
  public authorizeChannel(authPusherDto: AuthPusherDto, userId: string) {
    const { socket_id, channel_name } = authPusherDto

    // Saber qué tipo de canal es: presence, private o public
    const channelType = this.typeChannel(channel_name)
    console.log({
      channelType,
      channel_name,
      socket_id,
      userId,
    })

    // Validar solo si es private o presence
    // para el presence se necesita otro metodo
    if (channelType === 'private' || channelType === 'presence')
      this.validateUserIdForChannel(channel_name, userId)

    this.logger.log(
      `Authenticating user for ${channelType} channel: ${channel_name}`,
    )

    const { auth } = this.pusher.authorizeChannel(socket_id, channel_name)
    return ApiResponse({
      message: 'Authorized',
      data: {
        auth,
      },
      service: PusherService.name,
      statusCode: HttpStatus.OK,
    })
  }
}
