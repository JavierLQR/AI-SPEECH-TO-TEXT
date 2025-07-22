import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Pusher from 'pusher'

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
      useTLS: true,
    })
  }

  authenticateUser(
    socketId: string,
    channel: string,
    userData: { userId: string; name: string; email: string },
  ) {
    const presenceData = {
      user_id: userData.userId,
      user_info: {
        name: userData.name,
        email: userData.email,
      },
    }

    return this.pusher.authorizeChannel(socketId, channel, presenceData)
  }

  authorizeChannel(socketId: string, channel: string, userId: string) {
    if (this.canUserAccessChannel(userId, channel)) {
      this.logger.log('Authorizing private channel access', {
        socketId,
        channel,
      })
      return this.pusher.authorizeChannel(socketId, channel)
    }
    throw new Error('Unauthorized')
  }

  private canUserAccessChannel(userId: string, channel: string): boolean {
    // Ejemplo: solo permitir acceso a canales que contengan el ID del usuario
    return channel.includes(`user-${userId}`)
  }

  async sendToPrivateChannel(
    channel: string,
    event: string,
    data: {
      id: string
      message: string
      userId: string
      timestamp: string
    },
  ) {
    this.logger.log(`Sending message to private channel: ${channel}`, {
      event,
      data,
    })
    await this.pusher.trigger(channel, event, data)
  }
}
