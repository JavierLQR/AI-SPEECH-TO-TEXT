import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Pusher from 'pusher'

@Injectable()
export class PusherService {
  private readonly pusher: Pusher
  private readonly logger: Logger = new Logger(PusherService.name)

  constructor(private readonly configService: ConfigService) {
    this.pusher = new Pusher({
      appId: this.configService.getOrThrow<string>('PUSHER_APP_ID'),
      key: this.configService.getOrThrow<string>('PUSHER_KEY'),
      secret: this.configService.getOrThrow<string>('PUSHER_SECRET'),
      cluster: this.configService.getOrThrow<string>('PUSHER_CLUSTER'),
      useTLS: true,
    })
  }

  // Authenticate a user for a private channel
  authenticate(
    userId: string,
    socketId: string,
    channelName: string,
  ): Pusher.ChannelAuthResponse {
    try {
      const auth = this.pusher.authorizeChannel(socketId, channelName, {
        user_id: userId,
        user_info: { name: `User ${userId}` }, // Optional: Add user info
      })
      this.logger.log(`Authenticated user ${userId} for channel ${channelName}`)
      return auth
    } catch (error) {
      this.logger.error(`Authentication failed for user ${userId}: ${error}`)
      throw new InternalServerErrorException(
        `Authentication failed for user ${userId}`,
      )
    }
  }

  // Trigger an event on a private channel
  async trigger(channel: string, event: string, data: any): Promise<void> {
    try {
      await this.pusher.trigger('private-user-123', 'message', {
        message: 'hola',
      })
      await this.pusher.trigger('test', 'test-event', {
        message: 'hola',
      })
      this.logger.log(
        `Event ${event} triggered on channel ${channel} with data: ${JSON.stringify(data)}`,
      )
    } catch (error) {
      this.logger.error(
        `Failed to trigger event ${event} on ${channel}: ${error}`,
      )
      throw new InternalServerErrorException(
        `Failed to trigger event ${event} on ${channel}`,
      )
    }
  }
}
