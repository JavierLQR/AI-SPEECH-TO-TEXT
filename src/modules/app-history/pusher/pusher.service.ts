import { Injectable, Logger } from '@nestjs/common'
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
      useTLS: this.configService.getOrThrow<boolean>('PUSHER_USE_TLS'),
    })
  }

  /**
   *  trigger
   */
  public async trigger(text: string) {
    await this.pusher.trigger('channel-test', 'event-test', {
      message: text,
    })
  }
}
